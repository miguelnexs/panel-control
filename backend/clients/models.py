from django.db import models
from users.models import Tenant


class Client(models.Model):
    full_name = models.CharField(max_length=150)
    cedula = models.CharField(max_length=20)
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField()
    address = models.TextField()
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['cedula']),
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.full_name
