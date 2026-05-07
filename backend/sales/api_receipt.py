from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.mail import EmailMessage, get_connection
# import io
# from xhtml2pdf import pisa
from django.conf import settings
from users.models import UserProfile, Tenant
from .models import Sale
from config.models import AppSettings
from users.utils.crypto import decrypt_text

def _get_user_tenant(user):
    try:
        profile = user.profile
        return getattr(profile, 'tenant', None)
    except UserProfile.DoesNotExist:
        return Tenant.objects.filter(admin=user).first()

class SendReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            sale = Sale.objects.get(pk=pk)
        except Sale.DoesNotExist:
            return Response({'detail': 'Pedido no encontrado'}, status=404)
        
        # Check permissions (tenant)
        tenant = _get_user_tenant(request.user)
        if sale.tenant != tenant:
             return Response({'detail': 'No tiene permiso para ver este pedido'}, status=403)
             
        client_email = sale.client.email
        if not client_email:
            return Response({'detail': 'El cliente no tiene un correo electrónico registrado'}, status=400)
        
        # Get SMTP settings
        app_settings = AppSettings.objects.filter(tenant=tenant).first()
        if not app_settings:
            # Fallback to global settings if tenant not found (or if logic dictates)
            app_settings = AppSettings.objects.filter(tenant__isnull=True).first()
            
        # Extract credentials and connection settings
        smtp_config = app_settings.google_config if app_settings else {}
        email_host = smtp_config.get('smtp_host', 'smtp.gmail.com')
        email_port = int(smtp_config.get('smtp_port', 587))
        email_use_tls = smtp_config.get('smtp_use_tls', True)
        email_use_ssl = smtp_config.get('smtp_use_ssl', False)
        email_host_user = smtp_config.get('email')
        email_host_password = smtp_config.get('app_password')
        
        if not email_host_user or not email_host_password:
             return Response({'detail': 'Configuración de correo (SMTP) no encontrada. Verifique los Ajustes.'}, status=400)

        # Decrypt password if encrypted
        try:
            if email_host_password.startswith('gAAAA'):
                 email_host_password = decrypt_text(email_host_password)
        except Exception:
             pass # Assume plain text if decryption fails
             
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
            # Construct email content
            subject = f"Recibo de Compra #{sale.order_number}"
            
            # Company Info
            company_name = app_settings.company_name if app_settings else "Nuestra Tienda"
            company_nit = app_settings.company_nit if app_settings and app_settings.company_nit else ""
            company_address = app_settings.company_address if app_settings and app_settings.company_address else ""
            company_phone = app_settings.company_phone if app_settings and app_settings.company_phone else ""
            company_email = app_settings.company_email if app_settings and app_settings.company_email else ""
            primary_color = app_settings.primary_color if app_settings and app_settings.primary_color else "#4F46E5"
            
            receipt_footer_raw = app_settings.receipt_footer if app_settings and app_settings.receipt_footer else "¡Gracias por su compra!"
            receipt_footer = receipt_footer_raw
            
            # AGGRESSIVE JSON CLEANUP
            # Fix: The footer might be stored as a JSON string containing configuration
            # We must extract only the 'message' field to avoid showing raw JSON in emails
            
            # Clean/Normalize first
            receipt_footer_clean = receipt_footer_raw.strip() if receipt_footer_raw else ""
            try:
                from html import unescape
                receipt_footer_clean = unescape(receipt_footer_clean)
            except:
                pass

            # Check if it looks like config (contains "show_logo": or starts with {)
            # Use lower case for check to be case insensitive
            clean_lower = receipt_footer_clean.lower()
            if receipt_footer_clean and ('"show_logo":' in clean_lower or '"message":' in clean_lower or receipt_footer_clean.startswith('{')):
                # It looks like config! Assume it is config and we want to extract message.
                # PREEMPTIVE STRIKE: Default to empty string to be safe (hide raw config).
                receipt_footer = ""
                
                try:
                    import json
                    import re
                    
                    extracted_msg = ""
                    
                    # 1. Try direct parse first
                    try:
                        footer_data = json.loads(receipt_footer_clean)
                        if isinstance(footer_data, dict):
                            extracted_msg = footer_data.get('message', '')
                    except json.JSONDecodeError:
                        # 2. Try to find JSON object in string (handle extra chars)
                        json_match = re.search(r'(\{.*\})', receipt_footer_clean, re.DOTALL)
                        if json_match:
                            try:
                                footer_data = json.loads(json_match.group(1))
                                if isinstance(footer_data, dict):
                                    extracted_msg = footer_data.get('message', '')
                            except:
                                pass
                                
                    # 3. Last resort: Regex extraction
                    if not extracted_msg:
                         if '"message":' in clean_lower:
                             match = re.search(r'"message"\s*:\s*"((?:[^"\\]|\\.)*)"', receipt_footer_clean)
                             if match:
                                 extracted_msg = match.group(1).replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')

                    # Final Safety Check: If extracted message STILL looks like code, kill it
                    if extracted_msg and ('"show_logo":' in extracted_msg or extracted_msg.strip().startswith('{')):
                        receipt_footer = ""
                    else:
                        receipt_footer = extracted_msg
                            
                except Exception:
                    # If any error occurs during extraction, keep it empty
                    receipt_footer = ""

            # Logo Logic (needs absolute URL if hosted, or CID if attached - keeping simple for now)
            # For this context, we'll just use text if no public URL logic is set up
            # If you have a way to serve media files publicly, you could use request.build_absolute_uri(app_settings.logo.url)
            
            # Generate Items HTML
            items_html = ""
            for item in sale.items.all():
                desc = item.product_name
                details = []
                if item.color:
                    details.append(item.color.name)
                if item.variant:
                    details.append(item.variant.name)
                if details:
                    desc += f" <span style='color: #6b7280; font-size: 0.9em;'>({' - '.join(details)})</span>"
                
                items_html += f"""
                <tr>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; color: #374151;">{desc}</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">{item.quantity}</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">${item.unit_price:,.0f}</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500; color: #111827;">${item.line_total:,.0f}</td>
                </tr>
                """
            
            # Extract POS style settings
            paper_w = int(smtp_config.get('paper_width_mm', 58)) if isinstance(smtp_config, dict) else 58
            # Fallback to direct fields if not in json
            if not paper_w or paper_w == 58:
                paper_w = app_settings.paper_width_mm or 58
            
            # Re-parse printer options from footer if it's JSON
            printer_opts = {}
            if receipt_footer_raw and receipt_footer_raw.strip().startswith('{'):
                try:
                    import json
                    printer_opts = json.loads(receipt_footer_raw)
                except:
                    pass
            
            header1 = printer_opts.get('header1', '')
            header2 = printer_opts.get('header2', '')
            align = printer_opts.get('align', 'center')
            font_size = int(printer_opts.get('font_size', 11))
            margin_top = int(printer_opts.get('margin_top', 10))
            margin_bottom = int(printer_opts.get('margin_bottom', 10))
            show_logo = printer_opts.get('show_logo', True)
            logo_w = int(printer_opts.get('logo_width_mm', 45))
            
            align_cls = 'left' if align == 'left' else 'right' if align == 'right' else 'center'
            
            # Generate Items HTML in POS style
            items_pos_html = ""
            for item in sale.items.all():
                name = item.product_name
                items_pos_html += f"""
                <tr>
                    <td style="padding: 4px 0; font-size: {font_size}px; border-bottom: 1px dashed #eee;">
                        <div style="font-weight: 600;">{name}</div>
                        {f'<div style="font-size: {max(9, font_size-2)}px; color: #666;">{item.color.name if item.color else ""} {item.variant.name if item.variant else ""}</div>' if item.color or item.variant else ''}
                    </td>
                    <td style="padding: 4px 0; font-size: {font_size}px; text-align: center; border-bottom: 1px dashed #eee;">{item.quantity}</td>
                    <td style="padding: 4px 0; font-size: {font_size}px; text-align: right; border-bottom: 1px dashed #eee;">${item.line_total:,.0f}</td>
                </tr>
                """

            # Support for payments and balances (Apartados)
            payments_html = ""
            total_paid = 0
            all_payments = sale.payments.all().order_by('created_at')
            
            if all_payments.exists():
                payments_html += f"""
                <div style="font-weight: bold; border-bottom: 1px solid #eee; margin-top: 10px; margin-bottom: 5px; padding-bottom: 2px; font-size: {font_size-1}px;">HISTORIAL DE PAGOS</div>
                <table style="width: 100%; border-collapse: collapse; font-size: {font_size-2}px;">
                """
                for p in all_payments:
                    total_paid += p.amount
                    payments_html += f"""
                    <tr>
                        <td style="padding: 2px 0;">{p.created_at.strftime('%d/%m/%y')}</td>
                        <td style="padding: 2px 0; text-transform: capitalize;">{p.payment_method}</td>
                        <td style="padding: 2px 0; text-align: right;">${p.amount:,.0f}</td>
                    </tr>
                    """
                payments_html += "</table>"

            balance_due = sale.total_amount - total_paid
            
            totals_section = f"""
                <tr>
                    <td colspan="2" style="padding-top: 10px; font-weight: bold; text-align: right; font-size: {font_size}px;">TOTAL VENTA:</td>
                    <td style="padding-top: 10px; font-weight: bold; text-align: right; font-size: {font_size}px;">${sale.total_amount:,.0f}</td>
                </tr>
            """
            
            if total_paid > 0:
                totals_section += f"""
                <tr>
                    <td colspan="2" style="text-align: right; font-size: {font_size}px; color: #10b981;">TOTAL ABONADO:</td>
                    <td style="text-align: right; font-size: {font_size}px; color: #10b981;">${total_paid:,.0f}</td>
                </tr>
                <tr>
                    <td colspan="2" style="text-align: right; font-weight: bold; font-size: {font_size + 2}px; color: {'#ef4444' if balance_due > 0 else '#000'};">SALDO PENDIENTE:</td>
                    <td style="text-align: right; font-weight: bold; font-size: {font_size + 2}px; color: {'#ef4444' if balance_due > 0 else '#000'};">${balance_due:,.0f}</td>
                </tr>
                """

            # Construct POS-like HTML email
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
                    .c {{ text-align: center; }}
                    .l {{ text-align: left; }}
                    .r {{ text-align: right; }}
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
                        <div style="font-weight: bold; border-bottom: 1px solid #eee; margin-bottom: 5px; padding-bottom: 2px;">DATOS DEL PEDIDO</div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: bold;">ORDEN:</span>
                            <span>#{sale.order_number}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: bold;">TIPO:</span>
                            <span style="text-transform: uppercase;">{'APARTADO' if sale.status == 'apartado' else 'VENTA'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-weight: bold;">FECHA:</span>
                            <span>{sale.created_at.strftime('%d/%m/%Y %H:%M')}</span>
                        </div>
                        
                        <div style="font-weight: bold; border-bottom: 1px solid #eee; margin-top: 10px; margin-bottom: 5px; padding-bottom: 2px;">DATOS DEL CLIENTE</div>
                        <div><span style="font-weight: bold;">NOMBRE:</span> {sale.client.full_name}</div>
                        {f'<div><span style="font-weight: bold;">C.C./NIT:</span> {sale.client.cedula}</div>' if sale.client.cedula else ''}
                        {f'<div><span style="font-weight: bold;">TELÉFONO:</span> {sale.client.phone}</div>' if sale.client.phone else ''}
                    </div>

                    <div class="hr"></div>

                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid #000;">
                                <th style="text-align: left; font-size: {font_size - 1}px; padding-bottom: 5px;">DESC</th>
                                <th style="text-align: center; font-size: {font_size - 1}px; padding-bottom: 5px;">CANT</th>
                                <th style="text-align: right; font-size: {font_size - 1}px; padding-bottom: 5px;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_pos_html}
                        </tbody>
                        <tfoot>
                            {totals_section}
                        </tfoot>
                    </table>

                    {payments_html}

                    <div class="hr"></div>

                    <div style="text-align: center; font-size: {font_size}px; margin-top: 10px;">
                        {receipt_footer}
                    </div>

                    <div style="text-align: center; font-size: 9px; color: #999; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
                        Recibo generado electrónicamente
                    </div>
                </div>
            </body>
            </html>
            """
            
            # PDF generation removed for troubleshooting
            pdf_attached = False
            
            # Send Email
            email_msg = EmailMessage(
                subject,
                f"Recibo de compra #{sale.order_number} - Total: ${sale.total_amount}",
                email_host_user,
                [client_email],
                connection=connection
            )
            email_msg.content_subtype = "html"
            email_msg.body = html_message
            
            email_msg.send(fail_silently=False)
            
            return Response({'detail': 'Recibo enviado correctamente'})
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'detail': f'Error al enviar correo: {str(e)}'}, status=500)
