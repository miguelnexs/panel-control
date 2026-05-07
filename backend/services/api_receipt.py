from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.mail import EmailMessage, get_connection
from django.conf import settings
from users.models import UserProfile, Tenant
from .models import Service
from config.models import AppSettings
from users.utils.crypto import decrypt_text
import json

def _get_user_tenant(user):
    try:
        profile = user.profile
        return getattr(profile, 'tenant', None)
    except UserProfile.DoesNotExist:
        return Tenant.objects.filter(admin=user).first()

class SendServiceReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            service = Service.objects.get(pk=pk)
        except Service.DoesNotExist:
            return Response({'detail': 'Servicio no encontrado'}, status=404)
        
        # Check permissions (tenant)
        tenant = _get_user_tenant(request.user)
        if service.tenant != tenant:
             return Response({'detail': 'No tiene permiso para ver este servicio'}, status=403)
             
        client_email = service.client.email
        if not client_email:
            return Response({'detail': 'El cliente no tiene un correo electrónico registrado'}, status=400)
        
        # Get SMTP settings from AppSettings
        app_settings = AppSettings.objects.filter(tenant=tenant).first()
        if not app_settings:
            app_settings = AppSettings.objects.filter(tenant__isnull=True).first()
            
        smtp_config = app_settings.google_config if app_settings else {}
        email_host = smtp_config.get('smtp_host', 'smtp.gmail.com')
        email_port = int(smtp_config.get('smtp_port', 587))
        email_use_tls = smtp_config.get('smtp_use_tls', True)
        email_use_ssl = smtp_config.get('smtp_use_ssl', False)
        email_host_user = smtp_config.get('email')
        email_host_password = smtp_config.get('app_password')
        
        if not email_host_user or not email_host_password:
             return Response({'detail': 'Configuración de correo (SMTP) no encontrada.'}, status=400)

        # Decrypt password if encrypted
        try:
            if email_host_password.startswith('gAAAA'):
                 email_host_password = decrypt_text(email_host_password)
        except Exception:
             pass 
             
        connection = get_connection(
            host=email_host,
            port=email_port,
            username=email_host_user,
            password=email_host_password,
            use_tls=email_use_tls,
            use_ssl=email_use_ssl,
            timeout=30
        )
            
        try:
            # POS Style Settings for Services
            company_name = app_settings.company_name if app_settings else "Nuestra Tienda"
            company_nit = app_settings.company_nit if app_settings and app_settings.company_nit else ""
            company_address = app_settings.company_address if app_settings and app_settings.company_address else ""
            company_phone = app_settings.company_phone if app_settings and app_settings.company_phone else ""
            
            # Use service specific fields
            paper_w = app_settings.service_paper_width_mm or 58
            footer_raw = app_settings.service_receipt_footer or "¡Gracias por confiar en nosotros!"
            
            # Parse printer options from service footer if it's JSON
            printer_opts = {}
            receipt_footer = footer_raw
            if footer_raw and footer_raw.strip().startswith('{'):
                try:
                    printer_opts = json.loads(footer_raw)
                    receipt_footer = printer_opts.get('message', '')
                except:
                    pass
            
            header1 = printer_opts.get('header1', '')
            header2 = printer_opts.get('header2', '')
            align = printer_opts.get('align', 'center')
            font_size = int(printer_opts.get('font_size', 11))
            margin_top = int(printer_opts.get('margin_top', 10))
            margin_bottom = int(printer_opts.get('margin_bottom', 10))
            
            align_cls = 'left' if align == 'left' else 'right' if align == 'right' else 'center'
            
            subject = f"Comprobante de Servicio #{service.id} - {service.name}"
            
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif; }}
                    .paper {{ 
                        background-color: white; 
                        width: {paper_w * 4}px; 
                        max-width: 100%; 
                        margin: 20px auto; 
                        padding: {margin_top}px 15px {margin_bottom}px; 
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        color: #000;
                    }}
                    .hr {{ border-top: 1px dashed #999; margin: 10px 0; }}
                    .t {{ font-weight: bold; }}
                </style>
            </head>
            <body>
                <div class="paper">
                    <div style="text-align: {align_cls};">
                        <div style="font-size: {font_size + 4}px; font-weight: bold; margin-bottom: 2px;">{company_name}</div>
                        <div style="font-size: {font_size - 1}px;">NIT: {company_nit}</div>
                        <div style="font-size: {font_size - 1}px;">{company_address}</div>
                        <div style="font-size: {font_size - 1}px;">Tel: {company_phone}</div>
                        {f'<div style="font-size: {font_size - 1}px;">{header1}</div>' if header1 else ''}
                        {f'<div style="font-size: {font_size - 1}px;">{header2}</div>' if header2 else ''}
                    </div>

                    <div class="hr"></div>
                    
                    <div style="font-size: {font_size - 1}px; line-height: 1.4;">
                        <div style="font-weight: bold; border-bottom: 1px solid #eee; margin-bottom: 5px; padding-bottom: 2px;">DATOS DEL SERVICIO</div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: bold;">SERVICIO:</span>
                            <span>#{service.id}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: bold;">ESTADO:</span>
                            <span style="text-transform: uppercase; color: {'#10b981' if service.status == 'entregado' else '#f59e0b'};">{service.status}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: bold;">ENTRADA:</span>
                            <span>{service.entry_date.strftime('%d/%m/%Y') if service.entry_date else 'N/A'}</span>
                        </div>
                        {f'<div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">ENTREGA:</span><span>{service.exit_date.strftime("%d/%m/%Y")}</span></div>' if service.exit_date else ''}
                        
                        <div style="font-weight: bold; border-bottom: 1px solid #eee; margin-top: 10px; margin-bottom: 5px; padding-bottom: 2px;">DATOS DEL CLIENTE</div>
                        <div><span style="font-weight: bold;">NOMBRE:</span> {service.client.full_name}</div>
                        {f'<div><span style="font-weight: bold;">C.C./NIT:</span> {service.client.cedula}</div>' if service.client.cedula else ''}
                        {f'<div><span style="font-weight: bold;">TELÉFONO:</span> {service.client.phone}</div>' if service.client.phone else ''}
                        
                        <div style="font-weight: bold; border-bottom: 1px solid #eee; margin-top: 10px; margin-bottom: 5px; padding-bottom: 2px;">DETALLES</div>
                        <div style="font-weight: bold;">{service.name}</div>
                        <div style="white-space: pre-wrap;">{service.description}</div>
                    </div>

                    <div class="hr"></div>

                    <table style="width: 100%; border-collapse: collapse;">
                        <tfoot>
                            <tr>
                                <td style="padding-top: 10px; font-weight: bold; text-align: right; font-size: {font_size + 2}px;">VALOR:</td>
                                <td style="padding-top: 10px; font-weight: bold; text-align: right; font-size: {font_size + 2}px;">${service.value:,.0f}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div class="hr"></div>

                    <div style="text-align: center; font-size: {font_size}px; margin-top: 10px;">
                        {receipt_footer}
                    </div>

                    <div style="text-align: center; font-size: 9px; color: #999; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
                        Comprobante de servicio generado automáticamente
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Send Email
            email_msg = EmailMessage(
                subject,
                f"Recibo de servicio #{service.id} - Total: ${service.value}",
                email_host_user,
                [client_email],
                connection=connection
            )
            email_msg.content_subtype = "html"
            email_msg.body = html_message
            email_msg.send(fail_silently=False)
            
            return Response({'detail': 'Recibo de servicio enviado correctamente'})
            
        except Exception as e:
            return Response({'detail': f'Error al enviar correo: {str(e)}'}, status=500)
