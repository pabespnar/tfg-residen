from django.contrib import admin
from .models import Categoria, Suministro, Pack, ContenidoPack, EntregaPack

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = (
        'nombre',
        'descripcion',
    )
    search_fields = (
        'nombre',
        'descripcion',
    )
    ordering = (
        'nombre',
    )

@admin.register(Suministro)
class SuministroAdmin(admin.ModelAdmin):
    list_display = (
        'nombre',
        'categoria',
        'stock',
        'unidad',
        'stock_minimo',
        'f_alta',
    )
    search_fields = (
        'nombre',
        'detalles',
        'categoria__nombre',
    )
    list_filter = (
        'categoria',
        'unidad',
        'f_alta',
    )
    ordering = (
        'nombre',
    )

@admin.register(Pack)
class PackAdmin(admin.ModelAdmin):
    list_display = (
        'nombre',
        'descripcion',
    )
    search_fields = (
        'nombre',
        'descripcion',
    )
    ordering = (
        'nombre',
    )

@admin.register(ContenidoPack)
class ContenidoPackAdmin(admin.ModelAdmin):
    list_display = (
        'pack',
        'suministro',
        'cantidad',
    )
    search_fields = (
        'pack__nombre',
        'suministro__nombre',
    )
    list_filter = (
        'pack',
        'suministro',
    )
    ordering = (
        'pack',
        'suministro',
    )

@admin.register(EntregaPack)
class EntregaPackAdmin(admin.ModelAdmin):
    list_display = (
        'pack',
        'residente',
        'fecha_entrega',
    )
    search_fields = (
        'pack__nombre',
        'residente__nombre',
        'residente__apellido',
        'residente__dni_nie',
    )
    list_filter = (
        'pack',
        'fecha_entrega',
    )
    ordering = (
        '-fecha_entrega',
    )