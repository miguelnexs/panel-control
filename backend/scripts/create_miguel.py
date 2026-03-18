from django.contrib.auth.models import User
from users.models import UserProfile

username = 'miguel'
password = 'migel1457'
email = 'miguel@example.com'

# Verificar si el usuario ya existe
if User.objects.filter(username=username).exists():
    user = User.objects.get(username=username)
    user.set_password(password)
    user.is_superuser = True
    user.is_staff = True
    user.save()
    print(f"Usuario '{username}' actualizado correctamente.")
else:
    user = User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Superusuario '{username}' creado exitosamente.")

# Asegurar que tenga perfil de admin
profile, created = UserProfile.objects.get_or_create(user=user)
profile.role = 'admin'
profile.save()
print(f"Perfil de administrador configurado para '{username}'.")
