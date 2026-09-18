from rest_framework import serializers
from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id',
            'email',
            'nombre',
            'apellido',
            'telefono',
            'dni',
            'rol',
            'imagen_perfil',
            'is_staff',
            'is_superuser',
        ]
        read_only_fields = [
            'id',
            'rol',
            'is_staff',
            'is_superuser',
        ]

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("El correo electrónico ya está en uso.")
        return value

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nombre no puede estar vacío.")
        return value

    def validate_apellido(self, value):
        if not value.strip():
            raise serializers.ValidationError("El apellido no puede estar vacío.")
        return value

    def validate_telefono(self, value):
        if not value.isdigit() or len(value) != 9:
            raise serializers.ValidationError("El teléfono debe tener 9 dígitos.")
        if not value.strip():
            raise serializers.ValidationError("El teléfono no puede estar vacío.")
        return value

    def validate_dni(self, value):
        if not value.strip():
            raise serializers.ValidationError("El DNI no puede estar vacío.")
        if not value[:-1].isdigit() or len(value) != 9 or not value[-1].isalpha():
            raise serializers.ValidationError("El DNI debe tener 8 dígitos y una letra.")
        return value

    def validate_imagen_perfil(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "La imagen no puede superar los 5 MB."
            )

        if value.content_type not in [
            'image/jpeg',
            'image/png',
            'image/webp',
        ]:
            raise serializers.ValidationError(
                "Solo se permiten imágenes JPG, PNG o WEBP."
            )

        return value