# Generated manually for tenant configuration models

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='TenantConfiguration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('theme', models.CharField(choices=[('dark', 'Dark Theme'), ('light', 'Light Theme'), ('blue', 'Blue Theme'), ('green', 'Green Theme'), ('purple', 'Purple Theme')], default='dark', max_length=20)),
                ('layout', models.CharField(choices=[('sidebar', 'Sidebar Navigation'), ('topbar', 'Top Navigation'), ('minimal', 'Minimal Layout')], default='sidebar', max_length=20)),
                ('primary_color', models.CharField(default='#3B82F6', max_length=7)),
                ('secondary_color', models.CharField(default='#1E40AF', max_length=7)),
                ('company_name', models.CharField(default='My Company', max_length=100)),
                ('company_logo', models.ImageField(blank=True, null=True, upload_to='tenant_logos/')),
                ('favicon', models.ImageField(blank=True, null=True, upload_to='tenant_favicons/')),
                ('custom_domain', models.CharField(blank=True, max_length=255, null=True, unique=True)),
                ('subdomain', models.CharField(blank=True, max_length=50, null=True, unique=True)),
                ('enable_inventory', models.BooleanField(default=True)),
                ('enable_sales', models.BooleanField(default=True)),
                ('enable_clients', models.BooleanField(default=True)),
                ('enable_reports', models.BooleanField(default=True)),
                ('enable_web_store', models.BooleanField(default=False)),
                ('items_per_page', models.IntegerField(default=10)),
                ('date_format', models.CharField(default='%Y-%m-%d', max_length=20)),
                ('timezone', models.CharField(default='UTC', max_length=50)),
                ('currency', models.CharField(default='USD', max_length=3)),
                ('session_timeout', models.IntegerField(default=30)),
                ('require_strong_passwords', models.BooleanField(default=True)),
                ('enable_two_factor', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('tenant', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='configuration', to='users.tenant')),
            ],
            options={
                'verbose_name': 'Tenant Configuration',
                'verbose_name_plural': 'Tenant Configurations',
            },
        ),
        migrations.CreateModel(
            name='TenantTheme',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('css_variables', models.TextField(help_text='CSS custom properties in JSON format')),
                ('is_active', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='themes', to='users.tenant')),
            ],
            options={
                'unique_together': {('tenant', 'name')},
            },
        ),
        migrations.CreateModel(
            name='TenantPermission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('view_products', 'View Products'), ('create_products', 'Create Products'), ('edit_products', 'Edit Products'), ('delete_products', 'Delete Products'), ('view_clients', 'View Clients'), ('create_clients', 'Create Clients'), ('edit_clients', 'Edit Clients'), ('delete_clients', 'Delete Clients'), ('view_sales', 'View Sales'), ('create_sales', 'Create Sales'), ('edit_sales', 'Edit Sales'), ('delete_sales', 'Delete Sales'), ('view_reports', 'View Reports'), ('manage_users', 'Manage Users'), ('manage_settings', 'Manage Settings')], max_length=50)),
                ('granted_at', models.DateTimeField(auto_now_add=True)),
                ('granted_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='granted_permissions', to='auth.user')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='permissions', to='users.tenant')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tenant_permissions', to='auth.user')),
            ],
            options={
                'unique_together': {('tenant', 'user', 'permission')},
            },
        ),
    ]