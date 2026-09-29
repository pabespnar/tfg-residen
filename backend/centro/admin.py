from django.contrib import admin
from solo.admin import SingletonModelAdmin
from .models import Centro


@admin.register(Centro)
class CentroAdmin(SingletonModelAdmin):
    list_display = (
        'nombre',
        'correo',
        'presupuesto_referencia',
        'presupuesto',
    )

    search_fields = (
        'nombre',
        'correo',
    )