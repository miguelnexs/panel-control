import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from config.models import AppSettings
from products.models import Product, Category, ProductVariant, ProductSKU, ProductColor
from sales.models import Sale
from services.models import Service
from clients.models import Client
from cashbox.models import CashSession
from webconfig.models import AIChatSession, AIChatMessage
from users.models import UserProfile, Tenant
from django.db.models import Sum, F
from django.utils import timezone
import json
import re
import logging
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

logger = logging.getLogger(__name__)

def _get_user_tenant(user):
    try:
        profile = user.profile
        return getattr(profile, 'tenant', None)
    except UserProfile.DoesNotExist:
        return Tenant.objects.filter(admin=user).first()

class AIChatView(APIView):
    permission_classes = [IsAuthenticated]

    def _execute_ai_action(self, action_json, tenant):
        try:
            data = json.loads(action_json)
            action = data.get('action')
            params = data.get('params', {})
            
            if action == 'create_product':
                name = params.get('name')
                price = params.get('price', 0)
                if not name: return None
                
                cat_name = params.get('category')
                category = None
                if cat_name:
                    category, _ = Category.objects.get_or_create(name=cat_name, tenant=tenant)
                
                product = Product.objects.create(
                    name=name, price=price, description=params.get('description', ''),
                    sku=params.get('sku') or f"AI-{timezone.now().timestamp()}",
                    category=category, tenant=tenant, inventory_qty=params.get('stock', 0)
                )
                
                # Colors
                colors = params.get('colors', [])
                color_objs = []
                for c in colors:
                    name_c = c if isinstance(c, str) else c.get('name')
                    hex_c = '#000000' if isinstance(c, str) else c.get('hex', '#000000')
                    if name_c:
                        color_objs.append(ProductColor.objects.create(product=product, name=name_c, hex=hex_c))
                
                # Variants
                variants = params.get('variants', [])
                variant_objs = []
                for v in variants:
                    name_v = v if isinstance(v, str) else v.get('name')
                    price_v = 0 if isinstance(v, str) else v.get('extra_price', 0)
                    if name_v:
                        variant_objs.append(ProductVariant.objects.create(product=product, name=name_v, extra_price=price_v))
                
                # SKUs
                if color_objs and variant_objs:
                    for co in color_objs:
                        for va in variant_objs:
                            ProductSKU.objects.create(product=product, color=co, variant=va, stock=0, sku=f"{product.sku}-{co.name[:2]}-{va.name[:2]}")
                elif color_objs:
                    for co in color_objs:
                        ProductSKU.objects.create(product=product, color=co, stock=0, sku=f"{product.sku}-{co.name[:2]}")
                elif variant_objs:
                    for va in variant_objs:
                        ProductSKU.objects.create(product=product, variant=va, stock=0, sku=f"{product.sku}-{va.name[:2]}")
                else:
                    ProductSKU.objects.create(product=product, stock=params.get('stock', 0), sku=product.sku)
                
                return f"✅ Producto '{name}' creado."
            
            elif action == 'create_category':
                name = params.get('name')
                if name:
                    Category.objects.get_or_create(name=name, tenant=tenant)
                    return f"✅ Categoría '{name}' creada."
            
            elif action == 'create_service_definition':
                from services.models import ServiceDefinition
                name = params.get('name')
                price = params.get('price', 0)
                if name:
                    ServiceDefinition.objects.create(
                        name=name, price=price, 
                        description=params.get('description', ''),
                        tenant=tenant
                    )
                    return f"✅ Servicio '{name}' definido correctamente."
                    
            return None
        except Exception as e:
            logger.error(f"AI Action Error: {str(e)}", exc_info=True)
            return f"❌ Error: {str(e)}"

    def _extract_json(self, text):
        # Improved extraction: finds the first { and the last } that could form a valid JSON
        try:
            start = text.find('{')
            end = text.rfind('}')
            if start != -1 and end != -1:
                json_str = text[start:end+1]
                # Validate it's parseable
                json.loads(json_str)
                return json_str
        except:
            pass
        return None

    def get(self, request, session_id=None):
        if not session_id:
            return Response({'detail': 'session_id is required'}, status=400)
        tenant = _get_user_tenant(request.user)
        session = AIChatSession.objects.filter(id=session_id, user=request.user).first()
        if not session:
            return Response({'detail': 'Session not found'}, status=404)
        messages = session.messages.all().order_by('created_at')
        return Response([
            {'role': m.role, 'content': m.content}
            for m in messages
        ])

    def post(self, request):
        msg_text = request.data.get('message')
        session_id = request.data.get('session_id')
        tenant = _get_user_tenant(request.user)
        
        session = AIChatSession.objects.filter(id=session_id, user=request.user).first() if session_id else None
        if not session: 
            session = AIChatSession.objects.create(user=request.user, tenant=tenant)
        
        # Create user message
        user_msg = AIChatMessage.objects.create(session=session, role='user', content=msg_text)

        api_key = "AIzaSyC8TmqL5HjjE7OE64wlsMUffvYM_ffknkw"
        settings = AppSettings.objects.filter(tenant=tenant).first() or AppSettings.objects.filter(tenant=None).first()
        if settings and settings.google_config:
            raw_key = settings.google_config.get('api_key') or settings.google_config.get('gemini_api_key')
            if raw_key:
                from globetrek_backend.utils.encryption import decrypt_text
                try: api_key = decrypt_text(raw_key)
                except: api_key = raw_key

        try:
            context = "Eres un asistente de inventario y servicios. Obligatorio usar este formato exacto para acciones:\n"
            context += 'ACTION_JSON:{"action": "create_product", "params": {"name": "Nombre", "price": 100, ...}}\n'
            context += 'ACTION_JSON:{"action": "create_service_definition", "params": {"name": "Mantenimiento", "price": 50000, "description": "Limpieza y pasta térmica"}}\n'
            context += "Puedes incluir múltiples bloques ACTION_JSON si el usuario pide varias cosas. Responde siempre en español."
            
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                system_instruction=context
            )
            
            # Fetch last 15 messages (excluding the one we just created) for chat context
            prev_msgs = list(session.messages.exclude(id=user_msg.id).order_by('-created_at')[:15])
            prev_msgs.reverse() # chronological order
            
            chat_history = []
            for m in prev_msgs:
                role = 'user' if m.role == 'user' else 'model'
                chat_history.append({
                    'role': role,
                    'parts': [m.content]
                })
                
            chat = model.start_chat(history=chat_history)
            response = chat.send_message(msg_text)
            
            try:
                full_text = response.text
            except Exception as e:
                logger.error(f"AI response error: {str(e)}")
                # If blocked by safety, show candidate text if possible or generic msg
                try: full_text = response.candidates[0].content.parts[0].text
                except: full_text = "Lo siento, no puedo procesar esa solicitud por políticas de seguridad o error técnico."
            
            # Robust extraction of all ACTION_JSON blocks
            results = []
            display_text = full_text
            
            # Find all occurrences of ACTION_JSON:
            for match in re.finditer(r'ACTION_JSON\s*:', full_text):
                start_pos = match.end()
                # Find the matching closing brace for the JSON starting here
                brace_count = 0
                json_content = ""
                for i in range(start_pos, len(full_text)):
                    char = full_text[i]
                    if char == '{': brace_count += 1
                    elif char == '}': brace_count -= 1
                    
                    json_content += char
                    if brace_count == 0 and json_content.strip().startswith('{'):
                        # Found a complete JSON object
                        res = self._execute_ai_action(json_content, tenant)
                        if res: results.append(res)
                        display_text = display_text.replace(match.group(0) + json_content, "")
                        break
            
            display_text = display_text.strip()
            if results:
                display_text += "\n\n" + "\n".join(results)
            
            if not display_text: display_text = "Solicitud procesada."

            AIChatMessage.objects.create(session=session, role='assistant', content=display_text)
            return Response({'response': display_text, 'session_id': session.id})
        except Exception as e:
            return Response({'detail': f'Error: {str(e)}'}, status=500)

class AIAnalyzeProductView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        try:
            image_file = request.FILES.get('image')
            image_url = request.data.get('image_url') or request.POST.get('image_url')
            notes = request.data.get('notes') or request.POST.get('notes', '')
            tenant = _get_user_tenant(request.user)
            
            logger.info(f"AI Analyze: Starting for user {request.user.username}")
            
            api_key = "AIzaSyC8TmqL5HjjE7OE64wlsMUffvYM_ffknkw"
            settings = AppSettings.objects.filter(tenant=tenant).first() or AppSettings.objects.filter(tenant=None).first()
            if settings and settings.google_config:
                raw_key = settings.google_config.get('api_key') or settings.google_config.get('gemini_api_key')
                if raw_key:
                    from globetrek_backend.utils.encryption import decrypt_text
                    try: api_key = decrypt_text(raw_key)
                    except: api_key = raw_key

            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            Analiza esta imagen de producto y devuelve un JSON con esta estructura exacta:
            {{
              "name": "Nombre corto y comercial",
              "description": "Descripción detallada y atractiva",
              "price": 10000,
              "category_name": "Nombre de la categoría (ej: Ropa, Electrónica, etc.)",
              "features": ["Característica 1", "Característica 2", "Característica 3"],
              "suggested_variants": [
                {{"name": "Talla S", "extra_price": 0}},
                {{"name": "Talla M", "extra_price": 0}}
              ],
              "suggested_colors": [
                {{"name": "Rojo", "hex": "#FF0000"}},
                {{"name": "Azul", "hex": "#0000FF"}}
              ]
            }}
            
            IMPORTANTE: El usuario ha proporcionado estas notas adicionales que debes seguir obligatoriamente:
            "{notes}"
            
            Si el usuario pide variantes o colores específicos en las notas, inclúyelos en los campos correspondientes.
            El precio debe ser un número entero estimado en Pesos Colombianos (COP).
            Responde SOLO el JSON.
            """
            
            content = [prompt]
            if image_file:
                logger.info(f"AI Analyze: Using uploaded file {image_file.name}")
                content.append({
                    "mime_type": image_file.content_type or 'image/jpeg',
                    "data": image_file.read()
                })
            elif image_url:
                logger.info(f"AI Analyze: Fetching image from URL {image_url}")
                import requests
                img_res = requests.get(image_url, timeout=10)
                if img_res.ok:
                    content.append({
                        "mime_type": img_res.headers.get('Content-Type', 'image/jpeg'),
                        "data": img_res.content
                    })
                else:
                    return Response({'detail': f'No se pudo descargar la imagen de la URL: {img_res.status_code}'}, status=400)

            if len(content) < 2:
                return Response({'detail': 'No se proporcionó ninguna imagen para analizar.'}, status=400)

            logger.info("AI Analyze: Sending request to Gemini...")
            response = model.generate_content(content)
            
            try:
                text = response.text
            except Exception as e:
                logger.error(f"AI analyze error: {str(e)}")
                try: text = response.candidates[0].content.parts[0].text
                except: return Response({'detail': 'La IA bloqueó la respuesta por seguridad o error técnico.'}, status=500)

            if not text:
                return Response({'detail': 'La IA no devolvió ninguna respuesta.'}, status=500)
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(0))
                return Response(data)
            
            return Response({'detail': f'La IA no devolvió un formato JSON válido: {text[:100]}'}, status=500)
            
        except Exception as e:
            logger.error(f"AI Analyze Error: {str(e)}", exc_info=True)
            return Response({'detail': f"Error en el servidor de IA: {str(e)}"}, status=500)

class AIChatSessionView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        tenant = _get_user_tenant(request.user)
        sessions = AIChatSession.objects.filter(user=request.user, tenant=tenant)
        return Response([{'id': s.id, 'title': s.title, 'updated_at': s.updated_at} for s in sessions])
    def post(self, request):
        tenant = _get_user_tenant(request.user)
        session = AIChatSession.objects.create(user=request.user, tenant=tenant, title=request.data.get('title', 'Nuevo Chat'))
        return Response({'id': session.id, 'title': session.title})

from .models_web_request import WebsiteRequest

class WebsiteRequestView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get(self, request):
        tenant = _get_user_tenant(request.user)
        # Admins see their own requests, super admins see all
        if request.user.profile.role == 'super_admin':
            requests = WebsiteRequest.objects.all().order_by('-created_at')
            data = []
            for r in requests:
                from users.models_tenant_config import TenantConfiguration
                config, _ = TenantConfiguration.objects.get_or_create(tenant=r.tenant)
                data.append({
                    'id': r.id,
                    'business_name': r.business_name,
                    'business_type': r.business_type,
                    'primary_colors': r.primary_colors,
                    'preferred_subdomain': r.preferred_subdomain,
                    'additional_notes': r.additional_notes,
                    'proposals': r.proposals,
                    'files': r.files,
                    'questions': r.questions,
                    'answers': r.answers,
                    'status': r.status,
                    'live_url': r.live_url,
                    'created_at': r.created_at,
                    'tenant_admin': r.tenant.admin.username,
                    'tenant_name': r.tenant.name,
                    'enable_web_advertising': config.enable_web_advertising,
                    'enable_web_sync': config.enable_web_sync,
                    'stats': {
                        'products': Product.objects.filter(tenant=r.tenant).count(),
                        'sales': Sale.objects.filter(tenant=r.tenant).count(),
                        'clients': Client.objects.filter(tenant=r.tenant).count(),
                    }
                })
        else:
            requests = WebsiteRequest.objects.filter(tenant=tenant).order_by('-created_at')
            data = []
            for r in requests:
                from users.models_tenant_config import TenantConfiguration
                config, _ = TenantConfiguration.objects.get_or_create(tenant=r.tenant)
                data.append({
                    'id': r.id,
                    'business_name': r.business_name,
                    'status': r.status,
                    'proposals': r.proposals,
                    'files': r.files,
                    'questions': r.questions,
                    'answers': r.answers,
                    'live_url': r.live_url,
                    'created_at': r.created_at,
                    'enable_web_sync': config.enable_web_sync
                })
            
        return Response(data)

    def post(self, request):
        tenant = _get_user_tenant(request.user)
        try:
            req = WebsiteRequest.objects.create(
                tenant=tenant,
                user=request.user,
                business_name=request.data.get('business_name'),
                business_type=request.data.get('business_type'),
                primary_colors=request.data.get('primary_colors', ''),
                preferred_subdomain=request.data.get('preferred_subdomain', ''),
                additional_notes=request.data.get('additional_notes', '')
            )
            return Response({'id': req.id, 'detail': 'Solicitud enviada correctamente.'})
        except Exception as e:
            return Response({'detail': str(e)}, status=400)

    def patch(self, request):
        req_id = request.data.get('id')
        if not req_id:
            return Response({'detail': 'ID requerido.'}, status=400)
            
        try:
            req = WebsiteRequest.objects.get(id=req_id)
            role = request.user.profile.role
            
            # Check ownership for non-superadmin
            if role != 'super_admin' and req.tenant != _get_user_tenant(request.user):
                return Response({'detail': 'No tienes permiso.'}, status=403)

            # Super Admin updates
            if role == 'super_admin':
                new_status = request.data.get('status')
                new_proposals = request.data.get('proposals')
                if isinstance(new_proposals, str): # Handle JSON from FormData
                    import json
                    new_proposals = json.loads(new_proposals)
                
                new_questions = request.data.get('questions')
                if isinstance(new_questions, str):
                    import json
                    new_questions = json.loads(new_questions)

                # Handle file upload
                uploaded_file = request.FILES.get('file')
                if uploaded_file:
                    from django.core.files.storage import default_storage
                    path = default_storage.save(f'web_requests/req_{req.id}/{uploaded_file.name}', uploaded_file)
                    file_url = request.build_absolute_uri(default_storage.url(path))
                    files = list(req.files)
                    files.append({'name': uploaded_file.name, 'url': file_url})
                    req.files = files

                if new_status:
                    req.status = new_status
                    if new_status == 'completed':
                        from users.models_tenant_config import TenantConfiguration
                        config, _ = TenantConfiguration.objects.get_or_create(tenant=req.tenant)
                        config.enable_web_store = True
                        if req.preferred_subdomain:
                            config.subdomain = req.preferred_subdomain
                        config.save()
                
                # New Toggles
                adv = request.data.get('enable_web_advertising')
                sync = request.data.get('enable_web_sync')
                if adv is not None or sync is not None:
                    from users.models_tenant_config import TenantConfiguration
                    config, _ = TenantConfiguration.objects.get_or_create(tenant=req.tenant)
                    if adv is not None:
                        config.enable_web_advertising = str(adv).lower() == 'true'
                    if sync is not None:
                        config.enable_web_sync = str(sync).lower() == 'true'
                    config.save()
                        
                if new_proposals is not None:
                    req.proposals = new_proposals
                if new_questions is not None:
                    req.questions = new_questions
                
                if 'live_url' in request.data:
                    req.live_url = request.data.get('live_url')
            
            # Client updates (answers)
            else:
                new_answers = request.data.get('answers')
                if isinstance(new_answers, str):
                    import json
                    new_answers = json.loads(new_answers)
                if new_answers is not None:
                    # Update dict, don't overwrite if partial
                    answers = dict(req.answers)
                    answers.update(new_answers)
                    req.answers = answers

            req.save()
            return Response({'detail': 'Actualizado correctamente.'})
        except WebsiteRequest.DoesNotExist:
            return Response({'detail': 'No encontrado.'}, status=404)
        except Exception as e:
            logger.error(f"WebsiteRequest PATCH error: {str(e)}", exc_info=True)
            return Response({'detail': str(e)}, status=400)
