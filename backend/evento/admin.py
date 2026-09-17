from django.contrib import admin
from .models import Notificacion, Historial

@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = (
        'tipo',
        'usuario',
        'leida',
        'fecha',
    )
    search_fields = (
        'tipo',
        'descripcion',
        'usuario__nombre',
        'usuario__apellido',
        'usuario__email',
    )
    list_filter = (
        'leida',
        'fecha',
    )
    ordering = (
        '-fecha',
    )

@admin.register(Historial)
class HistorialAdmin(admin.ModelAdmin):
    list_display = (
        'tipo',
        'rol',
        'usuario',
        'fecha',
    )
    search_fields = (
        'tipo',
        'descripcion',
        'usuario__nombre',
        'usuario__apellido',
        'usuario__email',
    )
    list_filter = (
        'rol',
        'fecha',
    )
    ordering = (
        '-fecha',
    )