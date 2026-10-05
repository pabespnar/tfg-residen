from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from config.archivos import RutaAleatoria

class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El correo electrónico es un campo obligatorio')
        if not password:
            raise ValueError('La contraseña es un campo obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')
        return self.create_user(email, password, **extra_fields)


class Rol(models.TextChoices):
    RESIDENTES = 'residentes', 'Gestor de residentes'
    ALMACEN = 'almacen', 'Gestor de almacén'
    ADMINISTRACION = 'administracion', 'Gestor de administración'

class Usuario(AbstractUser):
    username = None
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    telefono = models.CharField(max_length=9)
    email = models.EmailField(unique=True)
    dni = models.CharField(max_length=9, unique=True)
    rol = models.CharField(max_length=30, choices = Rol.choices)
    imagen_perfil = models.ImageField(upload_to=RutaAleatoria('usuarios'), null=True, blank=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido', 'telefono', 'dni']

    def __str__(self):
        return self.email

    