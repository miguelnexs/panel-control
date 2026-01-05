from rest_framework import serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models_tenant_config import TenantConfiguration, TenantTheme, TenantPermission
from .models import Tenant, UserProfile
from .tenant import get_current_tenant_alias, ensure_tenant_for_user


class TenantConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantConfiguration
        fields = '__all__'
        read_only_fields = ('tenant', 'created_at', 'updated_at')


class TenantThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantTheme
        fields = '__all__'
        read_only_fields = ('tenant', 'created_at')


class TenantPermissionSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = TenantPermission
        fields = ['id', 'user', 'user_username', 'permission', 'granted_at', 'granted_by']
        read_only_fields = ('granted_at',)


class TenantConfigurationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get tenant configuration for the current user's tenant"""
        try:
            ensure_tenant_for_user(request.user)
            tenant = request.user.profile.tenant
            if not tenant:
                return Response({'detail': 'No tenant associated with user'}, status=status.HTTP_404_NOT_FOUND)
            
            config, created = TenantConfiguration.objects.get_or_create(tenant=tenant)
            serializer = TenantConfigurationSerializer(config)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request):
        """Update tenant configuration"""
        try:
            ensure_tenant_for_user(request.user)
            tenant = request.user.profile.tenant
            if not tenant:
                return Response({'detail': 'No tenant associated with user'}, status=status.HTTP_404_NOT_FOUND)
            
            config, created = TenantConfiguration.objects.get_or_create(tenant=tenant)
            serializer = TenantConfigurationSerializer(config, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)


class TenantThemesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all themes for the current tenant"""
        try:
            ensure_tenant_for_user(request.user)
            tenant = request.user.profile.tenant
            if not tenant:
                return Response({'detail': 'No tenant associated with user'}, status=status.HTTP_404_NOT_FOUND)
            
            themes = TenantTheme.objects.filter(tenant=tenant)
            serializer = TenantThemeSerializer(themes, many=True)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        """Create a new theme for the tenant"""
        try:
            ensure_tenant_for_user(request.user)
            tenant = request.user.profile.tenant
            if not tenant:
                return Response({'detail': 'No tenant associated with user'}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = TenantThemeSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(tenant=tenant)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)


class TenantThemeDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, theme_id):
        """Update a specific theme"""
        try:
            ensure_tenant_for_user(request.user)
            tenant = request.user.profile.tenant
            if not tenant:
                return Response({'detail': 'No tenant associated with user'}, status=status.HTTP_404_NOT_FOUND)
            
            theme = get_object_or_404(TenantTheme, id=theme_id, tenant=tenant)
            serializer = TenantThemeSerializer(theme, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, theme_id):
        """Delete a specific theme"""
        try:
            ensure_tenant_for_user(request.user)
            tenant = request.user.profile.tenant
            if not tenant:
                return Response({'detail': 'No tenant associated with user'}, status=status.HTTP_404_NOT_FOUND)
            
            theme = get_object_or_404(TenantTheme, id=theme_id, tenant=tenant)
            theme.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)


class TenantPermissionsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all permissions for the current tenant"""
        try:
            ensure_tenant_for_user(request.user)
            tenant = request.user.profile.tenant
            if not tenant:
                return Response({'detail': 'No tenant associated with user'}, status=status.HTTP_404_NOT_FOUND)
            
            permissions = TenantPermission.objects.filter(tenant=tenant)
            serializer = TenantPermissionSerializer(permissions, many=True)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        """Grant a permission to a user"""
        try:
            ensure_tenant_for_user(request.user)
            tenant = request.user.profile.tenant
            if not tenant:
                return Response({'detail': 'No tenant associated with user'}, status=status.HTTP_404_NOT_FOUND)
            
            user_id = request.data.get('user_id')
            permission = request.data.get('permission')
            
            if not user_id or not permission:
                return Response({'detail': 'user_id and permission are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify the user belongs to this tenant
            try:
                user = UserProfile.objects.get(user_id=user_id, tenant=tenant).user
            except UserProfile.DoesNotExist:
                return Response({'detail': 'User not found in this tenant'}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if permission already exists
            if TenantPermission.objects.filter(tenant=tenant, user=user, permission=permission).exists():
                return Response({'detail': 'Permission already granted'}, status=status.HTTP_400_BAD_REQUEST)
            
            tenant_permission = TenantPermission.objects.create(
                tenant=tenant,
                user=user,
                permission=permission,
                granted_by=request.user
            )
            
            serializer = TenantPermissionSerializer(tenant_permission)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)


class TenantPermissionDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, permission_id):
        """Revoke a permission from a user"""
        try:
            ensure_tenant_for_user(request.user)
            tenant = request.user.profile.tenant
            if not tenant:
                return Response({'detail': 'No tenant associated with user'}, status=status.HTTP_404_NOT_FOUND)
            
            permission = get_object_or_404(TenantPermission, id=permission_id, tenant=tenant)
            permission.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)


class SuperAdminTenantsView(APIView):
    """View for super administrators to manage all tenants"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all tenants (super admin only)"""
        # Check if user is super admin
        try:
            if request.user.profile.role != 'super_admin':
                return Response({'detail': 'Only super administrators can access this resource'}, status=status.HTTP_403_FORBIDDEN)
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        tenants = Tenant.objects.all().select_related('admin__profile')
        data = []
        
        for tenant in tenants:
            config = getattr(tenant, 'configuration', None)
            data.append({
                'id': tenant.id,
                'admin_username': tenant.admin.username,
                'admin_email': tenant.admin.email,
                'db_alias': tenant.db_alias,
                'db_path': tenant.db_path,
                'created_at': tenant.admin.date_joined,
                'is_active': tenant.admin.is_active,
                'configuration': TenantConfigurationSerializer(config).data if config else None,
                'user_count': UserProfile.objects.filter(tenant=tenant).count(),
            })
        
        return Response(data)
    
    def post(self, request):
        """Create a new tenant (super admin only)"""
        try:
            if request.user.profile.role != 'super_admin':
                return Response({'detail': 'Only super administrators can create tenants'}, status=status.HTTP_403_FORBIDDEN)
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not username or not email or not password:
            return Response({'detail': 'username, email, and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create admin user
        if User.objects.filter(username=username).exists():
            return Response({'detail': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'detail': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        admin_user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=True,
            is_superuser=False
        )
        
        # Create admin profile
        UserProfile.objects.create(
            user=admin_user,
            role='admin'
        )
        
        # Create tenant
        tenant = Tenant.objects.create(
            admin=admin_user,
            db_alias=f"tenant_{admin_user.id}",
            db_path=f"schema:tenant_{admin_user.id}"
        )
        
        # Create default configuration
        TenantConfiguration.objects.create(tenant=tenant)
        
        return Response({
            'id': tenant.id,
            'admin_username': admin_user.username,
            'admin_email': admin_user.email,
            'db_alias': tenant.db_alias,
            'db_path': tenant.db_path,
        }, status=status.HTTP_201_CREATED)