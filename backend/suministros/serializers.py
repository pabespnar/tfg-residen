from rest_framework import serializers

from .models import Categoria, Suministro, Pack, ContenidoPack, EntregaPack


class SuministroSerializer(serializers.ModelSerializer):

    categoria = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        allow_null=True,
        required=False
    )

    categoria_nombre = serializers.CharField(
        source='categoria.nombre',
        read_only=True
    )

    packs = serializers.SerializerMethodField()

    class Meta:
        model = Suministro

        fields = [
            'id',
            'nombre',
            'detalles',
            'stock',
            'unidad',
            'stock_minimo',
            'categoria',
            'categoria_nombre',
            'f_alta',
            'packs',
        ]

        read_only_fields = [
            'id',
            'categoria_nombre',
            'f_alta',
            'packs',
        ]

    def get_packs(self, obj):
        contenidos = ContenidoPack.objects.filter(
            suministro=obj
        ).select_related('pack')

        return [
            {
                'id': contenido.pack.id,
                'nombre': contenido.pack.nombre,
                'cantidad': contenido.cantidad,
            }
            for contenido in contenidos
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

class CategoriaSerializer(serializers.ModelSerializer):

    suministros = SuministroSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Categoria

        fields = [
            'id',
            'nombre',
            'descripcion',
            'suministros',
        ]

        read_only_fields = [
            'id',
            'suministros',
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
        if value and len(value) > 500:
            raise serializers.ValidationError(
                "La descripción no puede superar los 500 caracteres."
            )

        return value


class ContenidoPackSerializer(serializers.ModelSerializer):

    suministro_nombre = serializers.CharField(
        source='suministro.nombre',
        read_only=True
    )
    
    suministro_unidad = serializers.CharField(
        source='suministro.unidad',
        read_only=True
    )

    class Meta:
        model = ContenidoPack

        fields = [
            'id',
            'pack',
            'suministro',
            'suministro_nombre',
            'suministro_unidad',
            'cantidad',
        ]

        read_only_fields = [
            'id',
            'suministro_nombre',
        ]

    def validate_pack(self, value):
        if not Pack.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(
                "El pack especificado no existe."
            )
            
        return value

    def validate_suministro(self, value):
        if not Suministro.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(
                "El suministro especificado no existe."
            )
        return value

    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "La cantidad debe ser un número positivo."
            )
        return value


class PackSerializer(serializers.ModelSerializer):

    contenido = ContenidoPackSerializer(
        source='contenidopack_set',
        many=True,
        read_only=True
    )

    residentes_recibidos = serializers.SerializerMethodField()

    class Meta:
        model = Pack

        fields = [
            'id',
            'nombre',
            'descripcion',
            'contenido',
            'residentes_recibidos',
        ]

        read_only_fields = [
            'id',
            'contenido',
            'residentes_recibidos',
        ]

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El nombre no puede estar vacío."
            )
        if Pack.objects.filter(nombre=value).exists():
            raise serializers.ValidationError(
                "Ya existe un pack con este nombre."
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

    def get_residentes_recibidos(self, pack):
        return pack.entregapack_set.count()

    
class EntregaPackSerializer(serializers.ModelSerializer):

    class Meta:
        model = EntregaPack

        fields = [
            'id',
            'pack',
            'residente',
            'fecha_entrega',
        ]

        read_only_fields = [
            'id',
            'fecha_entrega',
        ]

    def validate_pack(self, value):
        if not Pack.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(
                "El pack especificado no existe."
            )
        return value

    def validate_residente(self, value):
        if not value:
            raise serializers.ValidationError(
                "El residente especificado no existe."
            )
        elif not value.activo:
            raise serializers.ValidationError(
                "El residente no está activo."
            )
        return value