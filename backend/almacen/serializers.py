from rest_framework import serializers
from .models import AltaAlmacen, BajaAlmacen


class BajaAlmacenSerializer(serializers.ModelSerializer):

    suministro_nombre = serializers.CharField(
        source='suministro.nombre',
        read_only=True
    )

    suministro_unidad = serializers.CharField(
        source='suministro.unidad',
        read_only=True
    )

    class Meta:
        model = BajaAlmacen
        fields = [
            'id',
            'suministro',
            'suministro_nombre',
            'suministro_unidad',
            'cantidad',
            'stock_tras_baja',
            'fecha',
            'tipo',
            'entrega_pack',
            'observaciones',
            'servicio',
        ]
        read_only_fields = [
            'id',
            'fecha',
            'suministro_nombre',
            'suministro_unidad',
            'stock_tras_baja',
        ]

    def validate(self, value):
        tipo = value.get('tipo')
        entrega_pack = value.get('entrega_pack')
        observaciones = value.get('observaciones')
        servicio = value.get('servicio')

        if tipo == BajaAlmacen.TipoBaja.PACK:
            if not entrega_pack:
                raise serializers.ValidationError({
                    'entrega_pack':
                    'Una baja de tipo pack debe estar asociada a una entrega de pack.'
                })
            if servicio:
                raise serializers.ValidationError({
                    'servicio':
                    'Una baja de tipo pack no puede tener un servicio asociado.'
                })

        if tipo == BajaAlmacen.TipoBaja.SERVICIO:
            if not servicio:
                raise serializers.ValidationError({
                    'servicio':
                    'Una baja de servicio debe tener un servicio asociado.'
                })
            if not observaciones or not observaciones.strip():
                raise serializers.ValidationError({
                    'observaciones':
                    'Las bajas de servicio requieren observaciones.'
                })
            if entrega_pack:
                raise serializers.ValidationError({
                    'entrega_pack':
                    'Una baja de servicio no puede estar asociada a una entrega de pack.'
                })

        return value


class AltaAlmacenSerializer(serializers.ModelSerializer):

    pedido_tipo = serializers.CharField(
        source='pedido.tipo_pedido',
        read_only=True
    )

    pedido_nombre = serializers.CharField(
        source='pedido.nombre',
        read_only=True
    )

    suministro_nombre = serializers.CharField(
        source='suministro.nombre',
        read_only=True
    )

    suministro_unidad = serializers.CharField(
        source='suministro.unidad',
        read_only=True
    )

    class Meta:
        model = AltaAlmacen
        fields = [
            'id',
            'pedido',
            'pedido_nombre',
            'pedido_tipo',
            'suministro',
            'suministro_nombre',
            'suministro_unidad',
            'cantidad',
            'precio_unidad',
            'fecha',
            'observaciones',
            'factura_albaran',
            'stock_tras_alta',
        ]
        read_only_fields = [
            'id',
            'pedido_nombre',
            'pedido_tipo',
            'suministro_nombre',
            'suministro_unidad',
            'fecha',
            'stock_tras_alta',
        ]

    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "La cantidad debe ser un número positivo."
            )

        return value

    def validate_precio_unidad(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "El precio por unidad no puede ser negativo."
            )

        return value
