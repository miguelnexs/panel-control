from django.shortcuts import get_object_or_404
from django.http import Http404
from .models import Tenant
from .models_tenant_config import TenantConfiguration
import re


class TenantDomainMiddleware:
    """Middleware to handle tenant identification via domain/subdomain"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Extract host from request
        host = request.get_host().lower()
        
        # Remove port if present
        if ':' in host:
            host = host.split(':')[0]
        
        # Try to identify tenant by custom domain
        tenant = self._get_tenant_by_domain(host)
        
        # If no custom domain, try subdomain
        if not tenant:
            tenant = self._get_tenant_by_subdomain(host)
        
        # If no subdomain, try path-based tenant (domain.com/tenant-name)
        if not tenant:
            tenant = self._get_tenant_by_path(request)
        
        # Store tenant in request for later use
        request.tenant_from_domain = tenant
        
        response = self.get_response(request)
        return response
    
    def _get_tenant_by_domain(self, host):
        """Get tenant by custom domain"""
        try:
            config = TenantConfiguration.objects.filter(
                custom_domain=host,
                tenant__admin__is_active=True
            ).select_related('tenant').first()
            return config.tenant if config else None
        except Exception:
            return None
    
    def _get_tenant_by_subdomain(self, host):
        """Get tenant by subdomain (tenant.domain.com)"""
        # Split host into parts
        parts = host.split('.')
        
        # If we have at least 3 parts, the first part could be a subdomain
        if len(parts) >= 3:
            subdomain = parts[0]
            try:
                config = TenantConfiguration.objects.filter(
                    subdomain=subdomain,
                    tenant__admin__is_active=True
                ).select_related('tenant').first()
                return config.tenant if config else None
            except Exception:
                return None
        
        return None
    
    def _get_tenant_by_path(self, request):
        """Get tenant from URL path (domain.com/tenant-name/)"""
        path = request.path
        
        # Match pattern like /tenant-name/ or /tenant-name/rest/of/path
        match = re.match(r'^/([^/]+)/?', path)
        if match:
            tenant_slug = match.group(1)
            try:
                # Try to find tenant by admin username as slug
                tenant = Tenant.objects.filter(
                    admin__username=tenant_slug,
                    admin__is_active=True
                ).first()
                return tenant
            except Exception:
                return None
        
        return None