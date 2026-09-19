from django.contrib import admin
from .models import Modulo, Habitacion

@admin.register(Modulo)
class ModuloAdmin(admin.ModelAdmin):
    list_display = (
        'nombre',
        'num_habitaciones_max',
    )
    search_fields = (
        'nombre',
        'descripcion',
    )
    ordering = (
        'nombre',
    )

@admin.register(Habitacion)
class HabitacionAdmin(admin.ModelAdmin):
    list_display = (
        'nombre',
        'modulo',
        'capacidad',
        'f_alta',
    )
    search_fields = (
        'nombre',
        'info',
        'modulo__nombre',
    )
    list_filter = (
        'modulo',
        'f_alta',
    )
    ordering = (
        'modulo',
        'nombre',
    )