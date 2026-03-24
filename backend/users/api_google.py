from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.utils.crypto import get_random_string
from .models import UserProfile, Tenant
from .models_subscription import SubscriptionPlan
from .tenant import ensure_tenant_for_user
import uuid
import requests

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        token_type = request.data.get('type', 'id_token') # 'id_token' or 'access_token'
        
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            email = None
            first_name = ""
            last_name = ""
            
            if token_type == 'access_token':
                # Verify access_token by calling Google UserInfo
                user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
                response = requests.get(user_info_url, params={'access_token': token})
                
                if not response.ok:
                    return Response({'error': 'Invalid access token'}, status=status.HTTP_400_BAD_REQUEST)
                
                user_info = response.json()
                email = user_info.get('email')
                first_name = user_info.get('given_name', '')
                last_name = user_info.get('family_name', '')
                
            else:
                # Verify id_token
                # Note: In a real app, you should verify the AUD (client ID)
                client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
                id_info = id_token.verify_oauth2_token(token, google_requests.Request(), audience=client_id)
                email = id_info.get('email')
                first_name = id_info.get('given_name', '')
                last_name = id_info.get('family_name', '')

            if not email:
                return Response({'error': 'Invalid token: Email not found'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user exists
            user = User.objects.filter(email=email).first()
            
            if user:
                # Login existing user
                pass
            else:
                # Register new user automatically
                username = email.split('@')[0]
                # Ensure unique username
                if User.objects.filter(username=username).exists():
                    username = f"{username}_{get_random_string(5)}"
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    password=get_random_string(20) # Random password for social login
                )
                
                # Create Profile
                profile = UserProfile.objects.create(
                    user=user,
                    role='admin' # Default role for new web registrations
                )
                
                # Default Subscription Plan (e.g., 'starter' or 'free')
                plan = SubscriptionPlan.objects.filter(is_active=True, price=0).first()
                if not plan:
                    plan = SubscriptionPlan.objects.filter(is_active=True).first()
                
                # Create Tenant
                alias = f"tenant_{user.id}"
                tenant = Tenant.objects.create(
                    admin=user,
                    db_alias=alias,
                    db_path=f"schema:{alias}",
                    name=f"Negocio de {first_name or username}",
                    subscription_plan=plan,
                    has_paid=False # Force payment before dashboard access
                )
                
                # Link profile to tenant
                profile.tenant = tenant
                profile.save()
                
                # Ensure Tenant creation/initialization
                ensure_tenant_for_user(user)

            # Generate JWT
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email
                }
            })

        except ValueError as e:
            return Response({'error': f'Invalid token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
