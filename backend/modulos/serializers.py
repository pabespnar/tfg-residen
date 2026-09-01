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

    class Meta:
        model = Habitacion
        fields = [
            'id',
            'nombre',
            'info',
            'capacidad',
            'modulo',
        ]
        read_only_fields = [
            'id',
            'modulo',
        ]

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El nombre no puede estar vacío."
            )
        return value

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