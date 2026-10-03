from rest_framework import serializers
from .models import Centro


class CentroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centro
        fields = [
            'nombre',
            'logo',
            'presupuesto_referencia',
            'presupuesto',
            'correo',
        ]

    def validate(self, data):
        presupuesto = data.get(
            'presupuesto',
            self.instance.presupuesto
        )

        presupuesto_referencia = data.get(
            'presupuesto_referencia',
            self.instance.presupuesto_referencia
        )

        if presupuesto < 0:
            raise serializers.ValidationError({
                'presupuesto':
                    'El presupuesto no puede ser negativo.'
            })

        if presupuesto_referencia < 0:
            raise serializers.ValidationError({
                'presupuesto_referencia':
                    'El presupuesto de referencia no puede ser negativo.'
            })

        if presupuesto_referencia < presupuesto:
            raise serializers.ValidationError({
                'presupuesto_referencia':
                    'El presupuesto de referencia no puede ser menor que el presupuesto.'
            })

        return data

    def validate_logo(self, value):
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