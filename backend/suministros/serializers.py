from rest_framework import serializers
from django.utils import timezone
from django.db.models import Sum, F

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

    importe = serializers.SerializerMethodField()

    packs = serializers.SerializerMethodField()
    expediente_activo = serializers.SerializerMethodField()
    expedientes = serializers.SerializerMethodField()
    pedidos = serializers.SerializerMethodField()

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
            'importe',
            'packs',
            'expediente_activo',
            'expedientes',
            'pedidos',
        ]

        read_only_fields = [
            'id',
            'categoria_nombre',
            'f_alta',
            'importe',
            'packs',
            'expediente_activo',
            'expedientes',
            'pedidos',
        ]

    def get_importe(self, obj):
        return obj.detalles_pedido.aggregate(
            total=Sum(
                F('cantidad') * F('precio_unidad')
            )
        )['total'] or 0

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

    def get_expediente_activo(self, obj):
        hoy = timezone.now().date()

        detalle = obj.detalles_expediente.filter(
            expediente__fecha_inicio__lte=hoy,
            expediente__fecha_final__gte=hoy
        ).select_related(
            'expediente',
            'expediente__proveedor'
        ).first()

        if not detalle:
            return None

        return {
            'id': detalle.expediente.id,
            'nombre': detalle.expediente.nombre,
            'proveedor_nombre': detalle.expediente.proveedor.nombre,
        }

    def get_expedientes(self, obj):
        detalles = obj.detalles_expediente.select_related(
            'expediente',
            'expediente__proveedor'
        ).order_by(
            '-expediente__fecha_inicio'
        )

        hoy = timezone.now().date()

        return [
            {
                'id': detalle.expediente.id,
                'nombre': detalle.expediente.nombre,
                'proveedor_nombre': detalle.expediente.proveedor.nombre,
                'fecha_inicio': detalle.expediente.fecha_inicio,
                'fecha_final': detalle.expediente.fecha_final,
                'precio_unidad': detalle.precio_unidad,
                'activo': (
                    detalle.expediente.fecha_inicio <= hoy <=
                    detalle.expediente.fecha_final
                ),
            }
            for detalle in detalles
        ]

    def get_pedidos(self, obj):
        detalles = obj.detalles_pedido.select_related(
            'pedido',
            'pedido__expediente',
            'pedido__proveedor'
        ).order_by(
            '-pedido__fecha'
        )

        return [
            {
                'id': detalle.pedido.id,
                'nombre': detalle.pedido.nombre,
                'tipo_pedido': detalle.pedido.tipo_pedido,
                'expediente_id': (
                    detalle.pedido.expediente.id
                    if detalle.pedido.expediente
                    else None
                ),
                'expediente_nombre': (
                    detalle.pedido.expediente.nombre
                    if detalle.pedido.expediente
                    else None
                ),
                'proveedor_id': (
                    detalle.pedido.proveedor.id
                    if detalle.pedido.proveedor
                    else None
                ),
                'proveedor_nombre': (
                    detalle.pedido.proveedor.nombre
                    if detalle.pedido.proveedor
                    else None
                ),
                'fecha': detalle.pedido.fecha,
                'recibido': detalle.pedido.recibido,
                'cantidad': detalle.cantidad,
                'precio_unidad': detalle.precio_unidad,
            }
            for detalle in detalles
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
        if value and len(value) > 150:
            raise serializers.ValidationError(
                "Los detalles no pueden superar los 150 caracteres."
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
        if len(value) > 35:
            raise serializers.ValidationError(
                "El nombre no puede superar los 35 caracteres."
            )

        return value

    def validate_descripcion(self, value):
        if value and not value.strip():
            raise serializers.ValidationError(
                "La descripción no puede estar formada únicamente por espacios."
            )
        if value and len(value) > 150:
            raise serializers.ValidationError(
                "La descripción no puede superar los 150 caracteres."
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

    suministro_categoria_nombre = serializers.CharField(
        source='suministro.categoria.nombre',
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
            'suministro_categoria_nombre',
            'cantidad',
        ]

        read_only_fields = [
            'id',
            'suministro_nombre',
            'suministro_categoria_nombre',
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
        if value and len(value) > 150:
            raise serializers.ValidationError(
                "La descripción no puede superar los 150 caracteres."
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