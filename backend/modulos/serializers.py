from rest_framework import serializers

from .models import Modulo, Habitacion


class ModuloSerializer(serializers.ModelSerializer):

    class Meta:
        model = Modulo
        fields = [
            'id',
            'nombre',
            'descripcion',
            'num_habitaciones_max',
        ]
        read_only_fields = ['id']

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El nombre no puede estar vacío."
            )
        return value

    def validate_descripcion(self, value):
        if value and not value.strip():
            raise serializers.ValidationError(
                "La descripción no puede estar formada únicamente por espacios."
            )
        return value

    def validate_num_habitaciones_max(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "El número máximo de habitaciones debe ser como mínimo 1."
            )
        return value


class HabitacionSerializer(serializers.ModelSerializer):

    modulo_nombre = serializers.CharField(
        source='modulo.nombre',
        read_only=True
    )

    residentes_actuales = serializers.SerializerMethodField()

    class Meta:
        model = Habitacion
        fields = [
            'id',
            'nombre',
            'info',
            'capacidad',
            'modulo',
            'modulo_nombre',
            'residentes_actuales',
        ]
        read_only_fields = [
            'id',
            'modulo',
            'modulo_nombre',
            'residentes_actuales',
        ]

    def get_residentes_actuales(self, obj):
        return obj.residentes.filter(activo=True).count()

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El nombre no puede estar vacío."
            )
        return value

    def validate(self, data):

        modulo = data.get('modulo')

        if modulo is None and self.instance is not None:
            modulo = self.instance.modulo

        nombre = data.get(
            'nombre',
            self.instance.nombre if self.instance else None
        )

        if Habitacion.objects.filter(
            modulo=modulo,
            nombre__iexact=nombre.strip()
        ).exclude(
            id=self.instance.id if self.instance else None
        ).exists():

            raise serializers.ValidationError({
                'nombre': 'Ya existe una habitación con ese nombre en este módulo.'
            })

        return data

    def validate_info(self, value):
        if value and not value.strip():
            raise serializers.ValidationError(
                "La información no puede estar formada únicamente por espacios."
            )
        return value

    def validate_capacidad(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "La capacidad debe ser como mínimo 1."
            )
        return value

    def validate_modulo(self, value):

        if self.instance is not None:
            return value

        if value.habitaciones.count() >= value.num_habitaciones_max:
            raise serializers.ValidationError(
                "El módulo ha alcanzado el número máximo de habitaciones."
            )

        return value