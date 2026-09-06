from django.db import models

# Create your models here.
class Suministro(models.Model):
    nombre = models.CharField(max_length=100)
    detalles = models.TextField()
    stock = models.PositiveIntegerField()
    unidad = models.CharField(max_length=50)
    stock_minimo = models.PositiveIntegerField()

    def __str__(self):
        return self.nombre