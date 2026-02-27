from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.mail import send_mail, get_connection
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
            
        smtp_config = {}
        if app_settings and app_settings.google_config:
            smtp_config = app_settings.google_config
            
        # Extract credentials
        email_host = 'smtp.gmail.com'
        email_port = 587
        email_use_tls = True
        email_host_user = smtp_config.get('email')
        email_host_password = smtp_config.get('app_password')
        
        if not email_host_user or not email_host_password:
             return Response({'detail': 'Configuración de correo (SMTP) no encontrada. Configure Gmail en Ajustes.'}, status=400)

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
            use_tls=email_use_tls
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
            receipt_footer = app_settings.receipt_footer if app_settings and app_settings.receipt_footer else "¡Gracias por su compra!"
            
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
            
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recibo de Compra</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; -webkit-font-smoothing: antialiased;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td style="padding: 20px 0;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                                <!-- Header -->
                                <div style="background-color: {primary_color}; padding: 30px 40px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">{company_name.upper()}</h1>
                                    {f'<p style="margin: 5px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">NIT: {company_nit}</p>' if company_nit else ''}
                                </div>
                                
                                <!-- Content -->
                                <div style="padding: 40px;">
                                    <div style="text-align: center; margin-bottom: 30px;">
                                        <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 600;">Recibo de Pago</h2>
                                        <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Gracias por tu compra</p>
                                    </div>
                                    
                                    <!-- Order Info Grid -->
                                    <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="50%" valign="top" style="padding-right: 10px;">
                                                    <p style="margin: 0 0 5px; font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: 600;">Número de Orden</p>
                                                    <p style="margin: 0 0 15px; font-size: 14px; color: #111827; font-weight: 500;">#{sale.order_number}</p>
                                                    
                                                    <p style="margin: 0 0 5px; font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: 600;">Fecha</p>
                                                    <p style="margin: 0; font-size: 14px; color: #111827;">{sale.created_at.strftime('%d/%m/%Y %H:%M')}</p>
                                                </td>
                                                <td width="50%" valign="top" style="padding-left: 10px;">
                                                    <p style="margin: 0 0 5px; font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: 600;">Cliente</p>
                                                    <p style="margin: 0 0 5px; font-size: 14px; color: #111827; font-weight: 500;">{sale.client.full_name}</p>
                                                    <p style="margin: 0 0 2px; font-size: 13px; color: #6b7280;">{sale.client.email or ''}</p>
                                                    <p style="margin: 0; font-size: 13px; color: #6b7280;">{sale.client.phone or ''}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <!-- Items Table -->
                                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                                        <thead>
                                            <tr style="border-bottom: 2px solid #e5e7eb;">
                                                <th style="padding: 10px 15px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6b7280;">Producto</th>
                                                <th style="padding: 10px 15px; text-align: center; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6b7280;">Cant.</th>
                                                <th style="padding: 10px 15px; text-align: right; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6b7280;">Precio</th>
                                                <th style="padding: 10px 15px; text-align: right; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6b7280;">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items_html}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colspan="3" style="padding: 15px; text-align: right; font-weight: 600; color: #374151;">Total a Pagar:</td>
                                                <td style="padding: 15px; text-align: right; font-weight: 700; font-size: 18px; color: {primary_color};">${sale.total_amount:,.0f}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                    
                                    <!-- Footer Info -->
                                    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                                        <p style="margin: 0 0 5px; font-size: 14px; color: #374151;">{receipt_footer}</p>
                                        <div style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin-top: 15px;">
                                            {f'<p style="margin: 0;">{company_address}</p>' if company_address else ''}
                                            {f'<p style="margin: 0;">Tel: {company_phone} | Email: {company_email}</p>' if company_phone or company_email else ''}
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- System Footer -->
                                <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0; font-size: 11px; color: #9ca3af;">Enviado automáticamente por el sistema de ventas.</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """
            
            send_mail(
                subject,
                f"Recibo de compra #{sale.order_number} - Total: ${sale.total_amount}",
                email_host_user,
                [client_email],
                html_message=html_message,
                fail_silently=False,
                connection=connection
            )
            
            return Response({'detail': 'Recibo enviado correctamente'})
            
        except Exception as e:
            return Response({'detail': f'Error al enviar correo: {str(e)}'}, status=500)
