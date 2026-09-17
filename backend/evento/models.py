from django.db import models

from usuarios.models import Rol


class Evento(models.Model):

    tipo = models.CharField(max_length=100)
    descripcion = models.TextField(max_length=500)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class Notificacion(Evento):
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.CASCADE, related_name='notificaciones')
    leida = models.BooleanField(default=False)

    class Meta:
        ordering = ['-fecha']


class Historial(Evento):
    rol = models.CharField(max_length=30, choices=Rol.choices)

    class Meta:
        ordering = ['-fecha']