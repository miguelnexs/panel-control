from rest_framework import views, status, permissions
from rest_framework.response import Response
from config.models import AppSettings
import requests
import smtplib
from users.utils.crypto import decrypt_text

class TestGoogleConfigView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        email = request.data.get('email')
        app_password = request.data.get('app_password')
        api_key = request.data.get('api_key')

        # Mode 1: SMTP Auth (Email + App Password) - Preferred by user
        if email or app_password:
            if not email:
                return Response({'detail': 'Correo electrónico requerido'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle masked password
            if app_password == '********' or not app_password:
                try:
                    profile = getattr(request.user, 'profile', None)
                    user_tenant = profile.tenant if profile else None
                    if user_tenant:
                        ws = AppSettings.objects.filter(tenant=user_tenant).first()
                    else:
                        ws = AppSettings.objects.first()
                    
                    if ws and ws.google_config and 'app_password' in ws.google_config:
                        app_password = decrypt_text(ws.google_config['app_password'])
                except Exception:
                    pass

            if not app_password or app_password == '********':
                 return Response({'detail': 'Contraseña de aplicación requerida'}, status=status.HTTP_400_BAD_REQUEST)

            # Test SMTP Connection
            try:
                server = smtplib.SMTP('smtp.gmail.com', 587, timeout=10)
                server.starttls()
                server.login(email, app_password)
                server.quit()
                return Response({'detail': 'Conexión SMTP exitosa. Credenciales válidas.'})
            except smtplib.SMTPAuthenticationError:
                 return Response({'detail': 'Error de autenticación: Correo o contraseña incorrectos. Asegúrate de usar una Contraseña de Aplicación.'}, status=status.HTTP_401_UNAUTHORIZED)
            except Exception as e:
                 return Response({'detail': f'Error de conexión SMTP: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Mode 2: API Key (Legacy/Maps support)
        if api_key:
            # If the key is masked (********), try to get the stored key
            if api_key == '********':
                try:
                    profile = getattr(request.user, 'profile', None)
                    user_tenant = profile.tenant if profile else None
                    if user_tenant:
                        ws = AppSettings.objects.filter(tenant=user_tenant).first()
                    else:
                        ws = AppSettings.objects.first()
                    
                    if ws and ws.google_config and 'api_key' in ws.google_config:
                        api_key = decrypt_text(ws.google_config['api_key'])
                except Exception:
                    pass

            if not api_key or api_key == '********':
                 return Response({'detail': 'API Key inválida o no encontrada'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                url = f"https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest?key={api_key}"
                resp = requests.get(url, timeout=10)
                
                if resp.status_code == 200:
                    return Response({'detail': 'Conexión exitosa. La API Key es válida.'})
                else:
                    try:
                        err = resp.json()
                        msg = err.get('error', {}).get('message', 'Error desconocido de Google')
                        return Response({'detail': f'Error de validación: {msg}'}, status=status.HTTP_400_BAD_REQUEST)
                    except:
                        return Response({'detail': 'La API Key no es válida o no tiene permisos.'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({'detail': f'Error de conexión: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'Se requieren credenciales (Correo/Contraseña) o API Key'}, status=status.HTTP_400_BAD_REQUEST)
