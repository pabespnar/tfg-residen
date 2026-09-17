from django.contrib import admin
from .models import Residente

@admin.register(Residente)
class ResidenteAdmin(admin.ModelAdmin):
    list_display = (
        'nombre',
        'apellido',
        'dni_nie',
        'genero',
        'pais',
        'f_alta',
        'f_baja',
        'activo',
        'habitacion',
    )
    search_fields = (
        'nombre',
        'apellido',
        'dni_nie',
        'email',
        'pais',
    )
    list_filter = (
        'activo',
        'genero',
        'pais',
        'f_alta',
        'f_baja',
    )
    ordering = (
        'apellido',
        'nombre',
    )