from django.db import models
from django.core.validators import MinValueValidator

# Create your models here.
class Modulo(models.Model):

    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    num_habitaciones_max = models.IntegerField(validators=[MinValueValidator(1)])
    def __str__(self):
        return self.nombre