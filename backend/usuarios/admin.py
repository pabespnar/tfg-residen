from django.contrib import admin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = (
        'nombre',
        'apellido',
        'email',
        'dni',
        'telefono',
        'rol',
        'is_staff',
        'is_superuser',
    )

    search_fields = (
        'nombre',
        'apellido',
        'email',
        'dni',
        'telefono',
    )

    list_filter = (
        'rol',
        'is_staff',
        'is_superuser',
    )

    ordering = (
        'apellido',
        'nombre',
    )

    def save_model(self, request, obj, form, change):
        if 'password' in form.changed_data:
            obj.set_password(form.cleaned_data['password'])
        super().save_model(request, obj, form, change)