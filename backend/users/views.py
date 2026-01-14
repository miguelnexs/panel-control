from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from .models import UserProfile
from .forms import LoginForm, UserRegistrationForm, UserProfileForm, UserUpdateForm
from .decorators import super_admin_required, admin_required, role_required

def home(request):
    """Vista para la página principal - Ahora devuelve info de la API"""
    return JsonResponse({
        'message': 'Bienvenido a Localix API',
        'version': '1.0.0',
        'endpoints': {
            'login_api': '/users/api/auth/login/',
            'register_api': '/users/api/auth/register/',
            'token_refresh': '/users/api/auth/token/refresh/',
            'user_info': '/users/api/auth/me/',
            'products': '/products/api/',
            'clients': '/clients/api/',
            'sales': '/sales/api/',
            'web_config': '/webconfig/api/'
        },
        'note': 'Esta es una API REST. Usa los endpoints con /api/ para interactuar.'
    })

def login_view(request):
    """Vista para el inicio de sesión - Ahora redirige a la API REST"""
    # Si es una petición POST, procesar con la lógica tradicional
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Bienvenido {username}!')
                return redirect('home')
            else:
                messages.error(request, 'Usuario o contraseña incorrectos.')
    else:
        form = LoginForm()
    
    # Para GET, mostrar información sobre cómo usar la API
    return JsonResponse({
        'message': 'Esta ruta es para la interfaz web tradicional.',
        'api_endpoint': '/users/api/auth/login/',
        'api_method': 'POST',
        'api_example': {
            'username': 'tu_usuario',
            'password': 'tu_contraseña'
        },
        'note': 'Para autenticación en tu app, usa el endpoint de API REST',
        'current_server': f'http://127.0.0.1:8085/users/api/auth/login/'
    }, status=200)

def register(request):
    """Vista para el registro de usuarios - Ahora usa la API"""
    # Si es GET, mostrar información sobre cómo usar la API
    if request.method == 'GET':
        return JsonResponse({
            'message': 'Esta ruta es para la interfaz web tradicional.',
            'api_endpoint': '/users/api/auth/register/',
            'api_method': 'POST',
            'api_example': {
                'username': 'nuevo_usuario',
                'password': 'contraseña_segura'
            },
            'note': 'Para registrar usuarios en tu app, usa el endpoint de API REST',
            'current_server': f'http://127.0.0.1:8085/users/api/auth/register/'
        })
    
    # Para POST, mantener la lógica tradicional por si acaso
    if request.method == 'POST':
        # Pasamos el rol del usuario que está creando (si está autenticado)
        user_role = None
        if request.user.is_authenticated:
            user_role = request.user.profile.role
            
        user_form = UserRegistrationForm(request.POST, user_role=user_role)
        profile_form = UserProfileForm(request.POST)
        
        if user_form.is_valid() and profile_form.is_valid():
            # Crear usuario pero no guardar aún
            user = user_form.save(commit=False)
            # La contraseña ya se establece en el formulario UserCreationForm
            user.save()
            
            # Crear perfil de usuario
            profile = profile_form.save(commit=False)
            profile.user = user
            profile.role = user_form.cleaned_data['role']
            profile.save()
            
            return JsonResponse({
                'message': f'Registro exitoso para el usuario {user.username}.',
                'username': user.username,
                'note': 'El usuario puede ahora iniciar sesión con sus credenciales.'
            })
        else:
            return JsonResponse({
                'error': 'Datos inválidos',
                'user_errors': user_form.errors if user_form.errors else None,
                'profile_errors': profile_form.errors if profile_form.errors else None
            }, status=400)

def logout_view(request):
    """Vista para cerrar sesión - Ahora usa JSON"""
    logout(request)
    return JsonResponse({
        'message': 'Has cerrado sesión correctamente.',
        'note': 'Para volver a autenticarte, usa el endpoint /users/api/auth/login/'
    })

@login_required
def profile(request):
    """Vista para el perfil de usuario - Ahora usa JSON"""
    if request.method == 'GET':
        user = request.user
        profile = user.profile
        return JsonResponse({
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': profile.role,
            'phone': profile.phone,
            'department': profile.department,
            'cedula': profile.cedula,
            'note': 'Para actualizar tu perfil, usa la API correspondiente'
        })
    
    # Para POST, mantener la lógica pero devolver JSON
    if request.method == 'POST':
        user_form = UserUpdateForm(request.POST, instance=request.user)
        profile_form = UserProfileForm(request.POST, instance=request.user.profile)
        
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            return JsonResponse({
                'message': 'Perfil actualizado exitosamente.',
                'username': request.user.username
            })
        else:
            return JsonResponse({
                'error': 'Datos inválidos',
                'user_errors': user_form.errors if user_form.errors else None,
                'profile_errors': profile_form.errors if profile_form.errors else None
            }, status=400)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@admin_required
def user_list(request):
    """Vista para listar usuarios (solo para administradores) - Ahora JSON"""
    if request.user.profile.is_super_admin():
        # Super admin ve todos los usuarios
        users = User.objects.all().select_related('profile')
    else:
        # Admin normal solo ve empleados
        users = User.objects.filter(profile__role='employee').select_related('profile')
    
    users_data = []
    for user in users:
        users_data.append({
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': user.profile.role,
            'phone': user.profile.phone,
            'department': user.profile.department,
            'cedula': user.profile.cedula,
            'date_joined': user.date_joined.isoformat()
        })
    
    return JsonResponse({
        'users': users_data,
        'total': len(users_data),
        'note': 'Para operaciones CRUD completas, usa la API REST'
    })

@admin_required
def user_create(request):
    """Vista para crear usuarios (solo para administradores) - Ahora JSON"""
    if request.method == 'GET':
        return JsonResponse({
            'message': 'Para crear usuarios, usa la API REST',
            'api_endpoint': '/users/api/users/',
            'api_method': 'POST',
            'note': 'Esta función ahora está deshabilitada. Usa la API REST para crear usuarios.'
        })
    
    if request.method == 'POST':
        return JsonResponse({
            'error': 'Función deshabilitada',
            'message': 'Para crear usuarios, usa la API REST: /users/api/users/',
            'note': 'Esta vista tradicional ha sido reemplazada por la API REST'
        }, status=405)

@admin_required
def user_edit(request, user_id):
    """Vista para editar usuarios (solo para administradores) - Ahora JSON"""
    user_to_edit = get_object_or_404(User, id=user_id)
    
    # Verificar permisos
    if user_to_edit.profile.is_admin() and not request.user.profile.is_super_admin():
        return JsonResponse({
            'error': 'Sin permisos',
            'message': 'No tiene permisos para editar administradores.'
        }, status=403)
    
    if user_to_edit.profile.is_super_admin() and not user_to_edit == request.user:
        return JsonResponse({
            'error': 'Sin permisos',
            'message': 'No puede editar al Super Administrador.'
        }, status=403)
    
    if request.method == 'GET':
        return JsonResponse({
            'message': 'Para editar usuarios, usa la API REST',
            'api_endpoint': f'/users/api/users/{user_id}/',
            'api_method': 'PUT/PATCH',
            'user_info': {
                'id': user_to_edit.id,
                'username': user_to_edit.username,
                'role': user_to_edit.profile.role
            }
        })
    
    return JsonResponse({
        'error': 'Función deshabilitada',
        'message': f'Para editar usuarios, usa la API REST: /users/api/users/{user_id}/',
        'note': 'Esta vista tradicional ha sido reemplazada por la API REST'
    }, status=405)

@admin_required
def user_delete(request, user_id):
    """Vista para eliminar usuarios (solo para administradores) - Ahora JSON"""
    user_to_delete = get_object_or_404(User, id=user_id)
    
    # Verificar permisos
    if user_to_delete.profile.is_admin() and not request.user.profile.is_super_admin():
        return JsonResponse({
            'error': 'Sin permisos',
            'message': 'No tiene permisos para eliminar administradores.'
        }, status=403)
    
    if user_to_delete.profile.is_super_admin():
        return JsonResponse({
            'error': 'Sin permisos',
            'message': 'No puede eliminar al Super Administrador.'
        }, status=403)
    
    if request.method == 'GET':
        return JsonResponse({
            'message': 'Para eliminar usuarios, usa la API REST',
            'api_endpoint': f'/users/api/users/{user_id}/',
            'api_method': 'DELETE',
            'user_to_delete': {
                'id': user_to_delete.id,
                'username': user_to_delete.username
            }
        })
    
    return JsonResponse({
        'error': 'Función deshabilitada',
        'message': f'Para eliminar usuarios, usa la API REST: DELETE /users/api/users/{user_id}/',
        'note': 'Esta vista tradicional ha sido reemplazada por la API REST'
    }, status=405)

@super_admin_required
def statistics(request):
    """Vista para estadísticas (solo para super administrador) - Ahora JSON"""
    total_users = User.objects.count()
    admins = User.objects.filter(profile__role='admin').count()
    employees = User.objects.filter(profile__role='employee').count()
    
    return JsonResponse({
        'statistics': {
            'total_users': total_users,
            'admins': admins,
            'employees': employees
        },
        'note': 'Para estadísticas más detalladas, usa la API REST'
    })

@admin_required
def admin_dashboard(request):
    """Dashboard para administradores - Ahora JSON"""
    employees = User.objects.filter(profile__role='employee').select_related('profile')
    
    employees_data = []
    for emp in employees:
        employees_data.append({
            'id': emp.id,
            'username': emp.username,
            'first_name': emp.first_name,
            'last_name': emp.last_name,
            'email': emp.email,
            'phone': emp.profile.phone,
            'department': emp.profile.department,
            'date_joined': emp.date_joined.isoformat()
        })
    
    return JsonResponse({
        'dashboard': {
            'employees': employees_data,
            'employee_count': employees.count()
        },
        'note': 'Para operaciones de administrador, usa la API REST'
    })
