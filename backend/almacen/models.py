from django.db import models
from django.core.validators import MinValueValidator

from backend.expedientes.models import Pedido
from suministros.models import Suministro, EntregaPack


class BajaAlmacen(models.Model):

    class TipoBaja(models.TextChoices):
        PACK = 'PACK', 'Pack'
        SERVICIO = 'SERVICIO', 'Servicio'

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


class AltaAlmacen(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.PROTECT, related_name='altas')
    suministro = models.ForeignKey('suministros.Suministro', on_delete=models.PROTECT, related_name='altas')
    cantidad = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    precio_unidad = models.DecimalField(max_digits=10,decimal_places=2,validators=[MinValueValidator(0)])
    fecha = models.DateField(auto_now_add=True)
    observaciones = models.TextField(blank=True, null=True)
    factura_albaran = models.FileField(upload_to='facturas_albaranes/', null=True, blank=True)
    stock_tras_alta = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.suministro.nombre} - {self.cantidad}'