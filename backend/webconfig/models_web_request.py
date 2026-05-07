from django.db import models
from django.contrib.auth.models import User
from users.models import Tenant

class WebsiteRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('in_progress', 'En Proceso'),
        ('completed', 'Completado'),
        ('rejected', 'Rechazado'),
    )
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='website_requests')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Form data
    business_name = models.CharField(max_length=255)
    business_type = models.CharField(max_length=100)
    primary_colors = models.CharField(max_length=100, blank=True)
    preferred_subdomain = models.CharField(max_length=100, blank=True)
    additional_notes = models.TextField(blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    proposals = models.JSONField(default=list, blank=True)
    files = models.JSONField(default=list, blank=True)  # List of file URLs/info
    questions = models.JSONField(default=list, blank=True) # Questions from super admin
    answers = models.JSONField(default=dict, blank=True)   # Answers from client
    live_url = models.URLField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Request from {self.business_name} ({self.tenant.admin.username})"
