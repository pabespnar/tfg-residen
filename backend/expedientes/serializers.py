from rest_framework import serializers

from .models import Proveedor, Expediente, DetalleExpediente, Pedido, DetallePedido


class ProveedorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Proveedor

        fields = [
            'id',
            'nombre',
            'cif',
            'correo',
            'foto',
        ]

        read_only_fields = [
            'id',
        ]

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El nombre no puede estar vacío."
            )
        if len(value) > 100:
            raise serializers.ValidationError(
                "El nombre no puede superar los 100 caracteres."
            )

        return value

    def validate_cif(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El CIF no puede estar vacío."
            )
        if len(value) != 9:
            raise serializers.ValidationError(
                "El CIF debe tener 9 caracteres."
            )

        return value

    def validate_correo(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El correo no puede estar vacío."
            )

        return value


class ExpedienteSerializer(serializers.ModelSerializer):

    proveedor_nombre = serializers.CharField(
        source='proveedor.nombre',
        read_only=True
    )

    class Meta:
        model = Expediente

        fields = [
            'id',
            'nombre',
            'detalles',
            'activo',
            'fecha_inicio',
            'fecha_final',
            'contrato',
            'proveedor',
            'proveedor_nombre',
            'presupuesto',
            'presupuesto_restante',
        ]

        read_only_fields = [
            'id',
            'proveedor_nombre',
            'presupuesto_restante',
        ]

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El nombre no puede estar vacío."
            )
        if len(value) > 50:
            raise serializers.ValidationError(
                "El nombre no puede superar los 50 caracteres."
            )

        return value

    def validate_detalles(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Los detalles no pueden estar vacíos."
            )
        if len(value) > 200:
            raise serializers.ValidationError(
                "Los detalles no pueden superar los 200 caracteres."
            )

        return value

    def validate(self, data):
        fecha_inicio = data.get('fecha_inicio')
        fecha_final = data.get('fecha_final')
        presupuesto = data.get('presupuesto')

        if fecha_inicio and fecha_final and fecha_final < fecha_inicio:
            raise serializers.ValidationError({
                'fecha_final':
                    'La fecha final no puede ser anterior a la fecha de inicio.'
            })

        if presupuesto is not None and presupuesto < 0:
            raise serializers.ValidationError({
                'presupuesto':
                    'El presupuesto no puede ser negativo.'
            })

        return data


class DetalleExpedienteSerializer(serializers.ModelSerializer):

    suministro_nombre = serializers.CharField(
        source='suministro.nombre',
        read_only=True
    )

    suministro_unidad = serializers.CharField(
        source='suministro.unidad',
        read_only=True
    )

    class Meta:
        model = DetalleExpediente

        fields = [
            'id',
            'expediente',
            'suministro',
            'suministro_nombre',
            'suministro_unidad',
            'precio_unidad',
        ]

        read_only_fields = [
            'id',
            'suministro_nombre',
            'suministro_unidad',
        ]

    def validate_precio_unidad(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "El precio por unidad no puede ser negativo."
            )

        return value


class PedidoSerializer(serializers.ModelSerializer):

    expediente_nombre = serializers.CharField(
        source='expediente.nombre',
        read_only=True
    )

    class Meta:
        model = Pedido

        fields = [
            'id',
            'nombre',
            'tipo_pedido',
            'expediente',
            'expediente_nombre',
            'fecha',
            'recibido',
        ]

        read_only_fields = [
            'id',
            'fecha',
            'expediente_nombre',
        ]

    def validate_nombre(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El nombre no puede estar vacío."
            )
        if len(value) > 50:
            raise serializers.ValidationError(
                "El nombre no puede superar los 50 caracteres."
            )

        return value

    def validate(self, value):
        tipo_pedido = value.get('tipo_pedido')
        expediente = value.get('expediente')

        if tipo_pedido == Pedido.TipoPedido.EXPEDIENTE:
            if not expediente:
                raise serializers.ValidationError({
                    'expediente':
                    'Un pedido con expediente debe estar asociado a un expediente.'
                })

        if tipo_pedido == Pedido.TipoPedido.GENERAL:
            if expediente:
                raise serializers.ValidationError({
                    'expediente':
                    'Un gasto general no puede estar asociado a un expediente.'
                })

        return value


class DetallePedidoSerializer(serializers.ModelSerializer):

    suministro_nombre = serializers.CharField(
        source='suministro.nombre',
        read_only=True
    )

    suministro_unidad = serializers.CharField(
        source='suministro.unidad',
        read_only=True
    )

    class Meta:
        model = DetallePedido

        fields = [
            'id',
            'pedido',
            'suministro',
            'suministro_nombre',
            'suministro_unidad',
            'cantidad',
            'precio_unidad',
        ]

        read_only_fields = [
            'id',
            'suministro_nombre',
            'suministro_unidad',
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
