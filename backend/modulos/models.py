from django.db import models
from django.core.validators import MinValueValidator

# Create your models here.
class Modulo(models.Model):

    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    num_habitaciones_max = models.IntegerField(validators=[MinValueValidator(1)])
    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Módulo'
        verbose_name_plural = 'Módulos'

class Habitacion(models.Model):

    nombre = models.CharField(max_length=100)
    info = models.TextField(blank=True)
    capacidad = models.IntegerField(
        validators=[MinValueValidator(1)]
    )
    f_alta = models.DateField()
    modulo = models.ForeignKey(
        Modulo,
        on_delete=models.CASCADE,
        related_name='habitaciones'
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['modulo', 'nombre'],
                name='unique_habitacion_por_modulo'
            )
        ]
        verbose_name = 'Habitación'
        verbose_name_plural = 'Habitaciones'

    def __str__(self):
        return self.nombre