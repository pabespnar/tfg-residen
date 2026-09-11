from django.db import models
from django.core.validators import MinValueValidator

from suministros.models import Suministro, EntregaPack


class BajaAlmacen(models.Model):

    class TipoBaja(models.TextChoices):
        PACK = 'PACK', 'Pack'
        EXTRAORDINARIA = 'EXTRAORDINARIA', 'Extraordinaria'


    class Servicio(models.TextChoices):
        LIMPIEZA = 'LIMPIEZA', 'Limpieza'
        COMIDA = 'COMIDA', 'Comida'
        SANITARIO = 'SANITARIO', 'Sanitario'
        MANTENIMIENTO = 'MANTENIMIENTO', 'Mantenimiento'
        LAVANDERIA = 'LAVANDERIA', 'Lavandería'
        ADMINISTRACION = 'ADMINISTRACION', 'Administración'
        ATENCION_RESIDENTES = 'ATENCION_RESIDENTES', 'Atención a residentes'
        OTROS = 'OTROS', 'Otros'

    suministro = models.ForeignKey(Suministro, on_delete=models.PROTECT,related_name='bajas')
    cantidad = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    fecha = models.DateField(auto_now_add=True)
    tipo = models.CharField(max_length=20,choices=TipoBaja.choices)
    entrega_pack = models.ForeignKey(EntregaPack, on_delete=models.PROTECT, null=True, blank=True, related_name='bajas')
    observaciones = models.TextField(blank=True, null=True)
    servicio = models.CharField(max_length=20, choices=Servicio.choices, null=True)
    stock_tras_baja = models.PositiveIntegerField()

