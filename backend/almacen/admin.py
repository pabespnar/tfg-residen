from django.contrib import admin
from .models import BajaAlmacen, AltaAlmacen

@admin.register(BajaAlmacen)
class BajaAlmacenAdmin(admin.ModelAdmin):
    list_display = (
        'suministro',
        'cantidad',
        'fecha',
        'tipo',
        'servicio',
        'entrega_pack',
        'stock_tras_baja',
    )
    search_fields = (
        'suministro__nombre',
        'observaciones',
        'entrega_pack__pack__nombre',
        'entrega_pack__residente__nombre',
        'entrega_pack__residente__apellido',
    )
    list_filter = (
        'tipo',
        'servicio',
        'fecha',
    )
    ordering = (
        '-fecha',
    )

@admin.register(AltaAlmacen)
class AltaAlmacenAdmin(admin.ModelAdmin):
    list_display = (
        'pedido',
        'suministro',
        'cantidad',
        'precio_unidad',
        'fecha',
        'stock_tras_alta',
    )
    search_fields = (
        'suministro__nombre',
        'pedido__nombre',
        'observaciones',
    )
    list_filter = (
        'fecha',
    )
    ordering = (
        '-fecha',
    )