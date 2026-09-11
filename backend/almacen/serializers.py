from rest_framework import serializers
from .models import BajaAlmacen


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

    def validate(self, data):
        tipo = data.get('tipo')
        entrega_pack = data.get('entrega_pack')
        observaciones = data.get('observaciones')
        servicio = data.get('servicio')

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

        if tipo == BajaAlmacen.TipoBaja.EXTRAORDINARIA:
            if not servicio:
                raise serializers.ValidationError({
                    'servicio':
                    'Una baja extraordinaria debe tener un servicio asociado.'
                })
            if not observaciones or not observaciones.strip():
                raise serializers.ValidationError({
                    'observaciones':
                    'Las bajas extraordinarias requieren observaciones.'
                })
            if entrega_pack:
                raise serializers.ValidationError({
                    'entrega_pack':
                    'Una baja extraordinaria no puede estar asociada a una entrega de pack.'
                })

        return data