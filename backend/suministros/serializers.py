from rest_framework import serializers

from .models import Categoria, Suministro


class SuministroSerializer(serializers.ModelSerializer):

    class Meta:
        model = Suministro

        fields = [
            'id',
            'nombre',
            'detalles',
            'stock',
            'unidad',
            'stock_minimo',
        ]

        read_only_fields = [
            'id',
        ]

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El nombre no puede estar vacío."
            )
        if Suministro.objects.filter(nombre=value).exists():
            raise serializers.ValidationError(
                "Ya existe un suministro con este nombre."
            )
        if len(value) > 100:
            raise serializers.ValidationError(
                "El nombre no puede superar los 100 caracteres."
            )

        return value

    def validate_detalles(self, value):
        if value and not value.strip():
            raise serializers.ValidationError(
                "Los detalles no pueden estar formados únicamente por espacios."
            )
        if value and len(value) > 500:
            raise serializers.ValidationError(
                "Los detalles no pueden superar los 500 caracteres."
            )

        return value

    def validate_unidad(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "La unidad no puede estar vacía."
            )

        return value


    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El nombre no puede estar vacío."
            )
        if Categoria.objects.filter(nombre=value).exists():
            raise serializers.ValidationError(
                "Ya existe una categoría con este nombre."
            )
        if len(value) > 100:
            raise serializers.ValidationError(
                "El nombre no puede superar los 100 caracteres."
            )

        return value

    def validate_descripcion(self, value):
        if value and not value.strip():
            raise serializers.ValidationError(
                "La descripción no puede estar formada únicamente por espacios."
            )
        if value and len(value) > 500:
            raise serializers.ValidationError(
                "La descripción no puede superar los 500 caracteres."
            )

        return value


class CategoriaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Categoria

        fields =  [
            'id', 
            'nombre', 
            'descripcion'
        ]
        
        read_only_fields = [
            'id'
        ]

        def validate_nombre(self, value):
            if not value.strip():
                raise serializers.ValidationError(
                    "El nombre no puede estar vacío."
                )
            if Categoria.objects.filter(nombre=value).exists():
                raise serializers.ValidationError(
                    "Ya existe una categoría con este nombre."
                )
            if len(value) > 100:
                raise serializers.ValidationError(
                    "El nombre no puede superar los 100 caracteres."
                )

            return value

        def validate_descripcion(self, value):
            if value and not value.strip():
                raise serializers.ValidationError(
                    "La descripción no puede estar formada únicamente por espacios."
                )

            return value