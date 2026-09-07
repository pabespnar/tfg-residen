from django.db import models


class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre

class Suministro(models.Model):
    nombre = models.CharField(max_length=100)
    detalles = models.TextField(blank=True, null=True)
    stock = models.PositiveIntegerField(default=0)
    unidad = models.CharField(max_length=50)
    stock_minimo = models.PositiveIntegerField(default=0)
    f_alta = models.DateField(auto_now_add=True)
    categoria = models.ForeignKey(
        'Categoria',
        on_delete=models.SET_NULL,
        related_name='suministros',
        null=True,
        blank=True
    )


    def __str__(self):
        return self.nombre