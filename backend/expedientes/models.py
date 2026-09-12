from django.db import models
from django.core.validators import MinValueValidator


class Proveedor(models.Model):
    nombre = models.CharField(max_length=100)
    cif = models.CharField(max_length=9, unique=True)
    correo = models.EmailField()
    foto = models.ImageField(upload_to='proveedores/', null=True, blank=True)

    def __str__(self):
        return self.nombre


class Expediente(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    detalles = models.CharField(max_length=200)
    activo = models.BooleanField(default=True)
    fecha_inicio = models.DateField()
    fecha_final = models.DateField()
    contrato = models.FileField(upload_to='contratos/', null=True, blank=True)
    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT, related_name='expedientes')
    presupuesto = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    presupuesto_restante = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])

    def __str__(self):
        return self.nombre


class DetalleExpediente(models.Model):
    expediente = models.ForeignKey(Expediente, on_delete=models.CASCADE, related_name='detalles_expediente')
    suministro = models.ForeignKey('suministros.Suministro', on_delete=models.PROTECT, related_name='detalles_expediente')
    precio_unidad = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])

    def __str__(self):
        return f'{self.suministro.nombre}'


class Pedido(models.Model):

    class TipoPedido(models.TextChoices):
        EXPEDIENTE = 'EXPEDIENTE', 'Con expediente'
        GENERAL = 'GENERAL', 'Gasto general'
        
    nombre = models.CharField(max_length=50, unique=True)
    expediente = models.ForeignKey(Expediente, on_delete=models.PROTECT, related_name='pedidos', null=True, blank=True)
    fecha = models.DateField(auto_now_add=True)
    tipo = models.CharField(max_length=20, choices=TipoPedido.choices)


    def __str__(self):
        return f'Pedido {self.id}'


class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='detalles_pedido')
    suministro = models.ForeignKey('suministros.Suministro', on_delete=models.PROTECT, related_name='detalles_pedido')
    cantidad = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    precio_unidad = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])

    def __str__(self):
        return f'{self.suministro.nombre} - {self.cantidad}'