from django.contrib import admin
from .models import Proveedor, Expediente, DetalleExpediente, Pedido, DetallePedido

@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = (
        'nombre',
        'cif',
        'correo',
    )
    search_fields = (
        'nombre',
        'cif',
        'correo',
    )
    ordering = (
        'nombre',
    )

@admin.register(Expediente)
class ExpedienteAdmin(admin.ModelAdmin):
    list_display = (
        'nombre',
        'proveedor',
        'fecha_inicio',
        'fecha_final',
        'presupuesto',
        'presupuesto_restante',
    )
    search_fields = (
        'nombre',
        'detalles',
        'proveedor__nombre',
        'proveedor__cif',
    )
    list_filter = (
        'proveedor',
        'fecha_inicio',
        'fecha_final',
    )
    ordering = (
        '-fecha_inicio',
    )

@admin.register(DetalleExpediente)
class DetalleExpedienteAdmin(admin.ModelAdmin):
    list_display = (
        'expediente',
        'suministro',
        'precio_unidad',
    )
    search_fields = (
        'expediente__nombre',
        'suministro__nombre',
    )
    list_filter = (
        'expediente',
        'suministro',
    )
    ordering = (
        'expediente',
        'suministro',
    )

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nombre',
        'tipo_pedido',
        'proveedor',
        'expediente',
        'fecha',
        'recibido',
    )
    search_fields = (
        'nombre',
        'proveedor__nombre',
        'proveedor__cif',
        'expediente__nombre',
    )
    list_filter = (
        'tipo_pedido',
        'recibido',
        'proveedor',
        'fecha',
    )
    ordering = (
        '-fecha',
    )

@admin.register(DetallePedido)
class DetallePedidoAdmin(admin.ModelAdmin):
    list_display = (
        'pedido',
        'suministro',
        'cantidad',
        'precio_unidad',
    )
    search_fields = (
        'pedido__nombre',
        'suministro__nombre',
    )
    list_filter = (
        'pedido',
        'suministro',
    )
    ordering = (
        'pedido',
        'suministro',
    )