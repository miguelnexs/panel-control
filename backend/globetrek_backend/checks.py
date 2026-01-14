from django.core.checks import register, Tags

@register(Tags.security)
def security_settings_check(app_configs, **kwargs):
    return []
