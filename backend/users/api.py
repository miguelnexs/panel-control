from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import UserProfile, Tenant
from .models_subscription import SubscriptionPlan
from .tenant import ensure_tenant_for_user


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=4)
    password = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('El nombre de usuario ya existe.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
        )
        # Crear perfil por defecto como empleado
        UserProfile.objects.create(user=user, role='employee')
        return user


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'Registro exitoso', 'username': user.username}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterTenantSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=4)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    tenant_name = serializers.CharField(required=True)
    plan_code = serializers.CharField()

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('El nombre de usuario ya existe.')
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('El correo electrónico ya está registrado.')
        return value

    def validate_plan_code(self, value):
        if not SubscriptionPlan.objects.filter(code=value).exists():
            raise serializers.ValidationError('El plan seleccionado no es válido.')
        return value

    def create(self, validated_data):
        # 1. Crear usuario
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        
        # 2. Crear perfil como admin
        UserProfile.objects.create(user=user, role='admin')
        
        # 3. Obtener plan
        plan = SubscriptionPlan.objects.get(code=validated_data['plan_code'])
        
        # 4. Crear Tenant
        alias = f"tenant_{user.id}"
        tenant = Tenant.objects.create(
            admin=user,
            db_alias=alias,
            db_path=f"schema:{alias}",
            name=validated_data['tenant_name'],
            subscription_plan=plan
        )
        
        # 5. Vincular perfil al tenant
        profile = user.profile
        profile.tenant = tenant
        profile.save()
        
        # 6. Inicializar esquema
        ensure_tenant_for_user(user)
        
        return user


class RegisterTenantView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterTenantSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                return Response({'message': 'Registro de empresa exitoso', 'username': user.username}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Credenciales inválidas.')
        data['user'] = user
        return data


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            from rest_framework_simplejwt.tokens import RefreshToken
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            role = request.user.profile.role
        except UserProfile.DoesNotExist:
            role = 'employee'
        
        # Obtener información del plan de suscripción
        subscription_info = None
        has_paid = False
        tenant = _get_user_tenant(request.user)
        if tenant:
            if tenant.subscription_plan:
                plan = tenant.subscription_plan
                subscription_info = {
                    'name': plan.name,
                    'code': plan.code,
                    'max_users': plan.max_users,
                    'max_products': plan.max_products,
                    'max_categories': plan.max_categories,
                    'max_transactions': plan.max_transactions_per_month,
                    'features': {
                        'web_store': plan.enable_web_store,
                        'inventory': plan.enable_inventory_management,
                        'marketing': plan.enable_marketing_tools,
                        'advanced_sales': plan.enable_advanced_sales_analysis,
                        'detailed_reports': plan.enable_detailed_reports,
                        'api_access': plan.enable_api_access,
                        'user_management': plan.enable_user_management,
                    }
                }
            # Consideramos pagado si tiene un ID de suscripción de Stripe
            if tenant.stripe_subscription_id:
                has_paid = True

        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'role': role,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'phone': getattr(getattr(request.user, 'profile', None), 'phone', None),
            'department': getattr(getattr(request.user, 'profile', None), 'department', None),
            'position': getattr(getattr(request.user, 'profile', None), 'position', None),
            'subscription': subscription_info,
            'has_paid': has_paid
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        user = request.user
        for field in ['email', 'first_name', 'last_name']:
            if field in request.data:
                setattr(user, field, request.data.get(field) or '')
        if 'password' in request.data and request.data['password']:
            user.set_password(request.data['password'])
        user.save()
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=user, role='employee')
        for pfield in ['phone', 'department', 'position']:
            if pfield in request.data:
                setattr(profile, pfield, request.data.get(pfield))
        profile.save()
        return Response(_serialize_user(user), status=status.HTTP_200_OK)


def _serialize_user(user: User):
    try:
        role = user.profile.role
    except UserProfile.DoesNotExist:
        role = 'employee'
    # Intentar obtener campos del perfil
    department = None
    position = None
    phone = None
    try:
        department = getattr(user.profile, 'department', None)
        position = getattr(user.profile, 'position', None)
        phone = getattr(user.profile, 'phone', None)
    except UserProfile.DoesNotExist:
        pass
    return {
        'id': user.id,
        'username': user.username,
        'role': role,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'department': department,
        'position': position,
        'phone': phone,
    }

# Helper seguro para obtener el rol sin provocar 500 si no hay perfil
def _get_user_role(user: User) -> str:
    try:
        return user.profile.role
    except UserProfile.DoesNotExist:
        return 'employee'

# Helper seguro para obtener el tenant del usuario (admin o empleado)
def _get_user_tenant(user: User):
    # Intentar por perfil
    try:
        profile = user.profile
        return getattr(profile, 'tenant', None)
    except UserProfile.DoesNotExist:
        pass
    # Intentar por relación OneToOne de admin
    return Tenant.objects.filter(admin=user).first()


class UsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            role = _get_user_role(request.user)
            if role not in ('admin', 'super_admin'):
                return Response({'detail': 'Solo administradores pueden gestionar usuarios.'}, status=status.HTTP_403_FORBIDDEN)
            if role == 'admin':
                try:
                    ensure_tenant_for_user(request.user)
                except Exception:
                    pass
                admin_tenant = _get_user_tenant(request.user)
                if admin_tenant:
                    users = User.objects.filter(profile__role='employee', profile__tenant=admin_tenant).select_related('profile')
                else:
                    users = User.objects.none()
            else:
                tenant_id = request.query_params.get('tenant_id')
                role_param = request.query_params.get('role')
                qs = User.objects.all().select_related('profile')
                if role_param in ('employee', 'admin', 'employer', 'super_admin'):
                    qs = qs.filter(profile__role=role_param)
                if tenant_id:
                    qs = qs.filter(profile__tenant_id=tenant_id)
                users = qs
            return Response([_serialize_user(u) for u in users], status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': f'Error listando usuarios: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        # Reglas de creación por rol
        requester_role = _get_user_role(request.user)
        username = request.data.get('username')
        password = request.data.get('password')
        # Si es super_admin puede elegir rol; si es admin, siempre empleado
        target_role = request.data.get('role') if requester_role == 'super_admin' else 'employee'
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        phone = request.data.get('phone')
        department = request.data.get('department')
        position = request.data.get('position')
        if not username or not password:
            return Response({'detail': 'Usuario y contraseña son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
        # Validar permisos según rol del solicitante
        if requester_role == 'super_admin':
            if target_role not in ('admin', 'employer', 'employee'):
                return Response({'detail': 'Super Administrador solo puede crear usuarios de tipo Administrador, Empleador o Empleado.'}, status=status.HTTP_403_FORBIDDEN)
        elif requester_role == 'admin':
            if target_role != 'employee':
                return Response({'detail': 'Administrador solo puede crear usuarios de tipo Empleado.'}, status=status.HTTP_403_FORBIDDEN)
            
            # Verificar límite de usuarios del plan
            tenant = _get_user_tenant(request.user)
            if tenant and tenant.subscription_plan:
                plan = tenant.subscription_plan
                if plan.max_users != -1:
                    current_users = User.objects.filter(profile__tenant=tenant).count()
                    # Contamos el admin también si queremos, pero normalmente max_users es "usuarios adicionales" o "total usuarios"
                    # Asumiremos total de usuarios vinculados al tenant (incluyendo el admin si está vinculado, y empleados)
                    if current_users >= plan.max_users:
                        return Response({'detail': f'Ha alcanzado el límite de usuarios de su plan ({plan.max_users}). Actualice su plan para agregar más.'}, status=status.HTTP_403_FORBIDDEN)

        else:
            return Response({'detail': 'Empleados no tienen permisos para crear usuarios.'}, status=status.HTTP_403_FORBIDDEN)
        if User.objects.filter(username=username).exists():
            return Response({'detail': 'El nombre de usuario ya existe.'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, password=password)
        user.first_name = first_name or ''
        user.last_name = last_name or ''
        user.email = email or ''
        user.save()
        if target_role == 'employee':
            # Si el solicitante es super_admin, debe especificar admin_id para asignar tenant
            admin_tenant = None
            if requester_role == 'super_admin':
                tenant_id = request.data.get('tenant_id')
                admin_id = request.data.get('admin_id')
                if tenant_id:
                    from .models import Tenant as TenantModel
                    admin_tenant = TenantModel.objects.filter(id=tenant_id).first()
                    if not admin_tenant:
                        return Response({'detail': 'Tenant destino no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
                else:
                    if not admin_id:
                        return Response({'detail': 'tenant_id o admin_id es requerido para crear un empleado como Super Administrador.'}, status=status.HTTP_400_BAD_REQUEST)
                    admin_user = User.objects.filter(id=admin_id).first()
                    if not admin_user:
                        return Response({'detail': 'Administrador destino no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
                    # Asegurar que el usuario destino sea admin/employer
                    try:
                        role_admin = _get_user_role(admin_user)
                    except Exception:
                        role_admin = 'employee'
                    if role_admin not in ('admin', 'employer'):
                        return Response({'detail': 'El usuario destino no es un administrador/empleador.'}, status=status.HTTP_400_BAD_REQUEST)
                    # Asegurar tenant del admin destino
                    ensure_tenant_for_user(admin_user)
                    admin_tenant = _get_user_tenant(admin_user)
            else:
                # Vincular al tenant del administrador solicitante
                ensure_tenant_for_user(request.user)
                admin_tenant = _get_user_tenant(request.user)
            if not admin_tenant:
                return Response({'detail': 'No hay tenant válido para asignar el empleado.'}, status=status.HTTP_400_BAD_REQUEST)
            UserProfile.objects.create(
                user=user,
                role='employee',
                phone=phone,
                department=department,
                position=position,
                tenant=admin_tenant,
            )
        else:
            # Admin y Empleador no se vinculan a tenant en creación
            UserProfile.objects.create(
                user=user,
                role=target_role,
                phone=phone,
                department=department,
                position=position,
            )
        return Response(_serialize_user(user), status=status.HTTP_201_CREATED)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        role = _get_user_role(request.user)
        if role not in ('admin', 'super_admin'):
            return Response({'detail': 'Solo administradores pueden eliminar usuarios.'}, status=status.HTTP_403_FORBIDDEN)
        target = User.objects.filter(id=user_id).first()
        if not target:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        if _get_user_role(target) != 'employee':
            return Response({'detail': 'Solo se pueden eliminar cuentas de empleados.'}, status=status.HTTP_403_FORBIDDEN)
        if role == 'admin':
            admin_tenant = _get_user_tenant(request.user)
            target_tenant = _get_user_tenant(target)
            if target_tenant != admin_tenant:
                return Response({'detail': 'No puede eliminar empleados de otro tenant.'}, status=status.HTTP_403_FORBIDDEN)
        target.delete()
        return Response({'message': 'Usuario eliminado.'}, status=status.HTTP_200_OK)

    def patch(self, request, user_id):
        role = _get_user_role(request.user)
        if role not in ('admin', 'super_admin'):
            return Response({'detail': 'Solo administradores pueden actualizar usuarios.'}, status=status.HTTP_403_FORBIDDEN)
        target = User.objects.filter(id=user_id).select_related('profile').first()
        if not target:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        # Solo se permite actualizar empleados del mismo tenant
        if _get_user_role(target) != 'employee':
            return Response({'detail': 'Solo se pueden actualizar cuentas de empleados.'}, status=status.HTTP_403_FORBIDDEN)
        if role == 'admin':
            admin_tenant = _get_user_tenant(request.user)
            target_tenant = _get_user_tenant(target)
            if target_tenant != admin_tenant:
                return Response({'detail': 'No puede actualizar empleados de otro tenant.'}, status=status.HTTP_403_FORBIDDEN)
        # No permitir cambiar el rol por este endpoint
        if 'role' in request.data:
            return Response({'detail': 'Cambio de rol no permitido.'}, status=status.HTTP_403_FORBIDDEN)
        # Actualizar campos básicos del usuario
        for field in ['email', 'first_name', 'last_name']:
            if field in request.data:
                setattr(target, field, request.data.get(field) or '')
        if 'password' in request.data and request.data['password']:
            target.set_password(request.data['password'])
        target.save()
        # Actualizar campos del perfil si existen
        try:
            profile = target.profile
            for pfield in ['phone', 'department', 'position']:
                if pfield in request.data:
                    setattr(profile, pfield, request.data.get(pfield))
            profile.save()
        except UserProfile.DoesNotExist:
            pass
        return Response(_serialize_user(target), status=status.HTTP_200_OK)
