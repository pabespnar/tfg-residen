import json
from django.db import transaction
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AltaAlmacen, BajaAlmacen
from suministros.models import Suministro
from .serializers import AltaAlmacenSerializer, BajaAlmacenSerializer
from expedientes.models import Pedido, DetallePedido
from suministros.permissions import EsGestorAlmacen


class ListaBajasAlmacenView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def get(self, request):
        bajas = BajaAlmacen.objects.all().order_by('-fecha', '-id')

        serializer = BajaAlmacenSerializer(
            bajas,
            many=True
        )

        return Response(serializer.data)


class CrearBajaServicioView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def post(self, request):
        suministros = request.data.get('suministros')
        servicio = request.data.get('servicio')
        observaciones = request.data.get('observaciones')

        if not suministros:
            return Response(
                {
                    'suministros':
                    'Debes indicar al menos un suministro.'
                },
                status=400
            )

        if not servicio:
            return Response(
                {
                    'servicio':
                    'Debes seleccionar un servicio.'
                },
                status=400
            )

        if not observaciones or not observaciones.strip():
            return Response(
                {
                    'observaciones':
                    'Las bajas de servicio requieren observaciones.'
                },
                status=400
            )

        if not isinstance(suministros, list):
            return Response(
                {
                    'suministros':
                    'Los suministros no tienen un formato válido.'
                },
                status=400
            )

        suministros_procesados = []

        for datos_suministro in suministros:

            suministro_id = datos_suministro.get('suministro')
            cantidad = datos_suministro.get('cantidad')

            try:
                suministro_id = int(suministro_id)
                cantidad = int(cantidad)
            except (TypeError, ValueError):
                return Response(
                    {
                        'suministros':
                        'Los suministros y las cantidades deben ser válidos.'
                    },
                    status=400
                )

            if cantidad <= 0:
                return Response(
                    {
                        'cantidad':
                        'La cantidad debe ser mayor que 0.'
                    },
                    status=400
                )

            try:
                suministro = Suministro.objects.get(
                    id=suministro_id
                )
            except Suministro.DoesNotExist:
                return Response(
                    {
                        'suministro':
                        'Uno de los suministros no existe.'
                    },
                    status=404
                )

            if suministro.stock < cantidad:
                return Response(
                    {
                        'cantidad':
                        f'No hay stock suficiente de {suministro.nombre} '
                        f'para realizar la baja.'
                    },
                    status=400
                )

            suministros_procesados.append(
                {
                    'suministro': suministro,
                    'cantidad': cantidad
                }
            )

        with transaction.atomic():

            bajas_creadas = []

            for datos_suministro in suministros_procesados:

                suministro = datos_suministro['suministro']
                cantidad = datos_suministro['cantidad']

                suministro.stock -= cantidad

                suministro.save(
                    update_fields=['stock']
                )

                baja = BajaAlmacen.objects.create(
                    suministro=suministro,
                    cantidad=cantidad,
                    servicio=servicio,
                    stock_tras_baja=suministro.stock,
                    tipo=BajaAlmacen.TipoBaja.SERVICIO,
                    observaciones=observaciones.strip()
                )

                bajas_creadas.append(baja)

        serializer = BajaAlmacenSerializer(
            bajas_creadas,
            many=True
        )

        return Response(
            serializer.data,
            status=201
        )


class ListaAltasAlmacenView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def get(self, request):
        altas = AltaAlmacen.objects.all().order_by('-fecha', '-id')

        serializer = AltaAlmacenSerializer(
            altas,
            many=True
        )

        return Response(serializer.data)


class CrearAltaAlmacenView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def post(self, request):

        pedido_id = request.data.get('pedido')
        detalles = request.data.get('detalles')
        albaran = request.FILES.get('factura_albaran')

        if not pedido_id:
            return Response(
                {'pedido': 'Debes seleccionar un pedido.'},
                status=400
            )

        if not detalles:
            return Response(
                {'detalles': 'Debes indicar las cantidades recibidas.'},
                status=400
            )

        try:
            detalles = json.loads(detalles)
        except (TypeError, json.JSONDecodeError):
            return Response(
                {
                    'detalles':
                    'Los detalles recibidos no tienen un formato válido.'
                },
                status=400
            )

        try:
            pedido = Pedido.objects.get(id=pedido_id)
        except Pedido.DoesNotExist:
            return Response(
                {'pedido': 'El pedido no existe.'},
                status=404
            )

        detalles_pedido = DetallePedido.objects.select_related(
            'suministro'
        ).filter(pedido=pedido)

        detalles_por_suministro = {
            detalle.suministro_id: detalle
            for detalle in detalles_pedido
        }

        altas = []

        for detalle in detalles:

            suministro_id = detalle.get('suministro')
            cantidad = detalle.get('cantidad')

            try:
                suministro_id = int(suministro_id)
                cantidad = int(cantidad)
            except (TypeError, ValueError):
                return Response(
                    {
                        'detalles':
                        'Los suministros y las cantidades deben ser válidos.'
                    },
                    status=400
                )

            if cantidad < 0:
                return Response(
                    {
                        'detalles':
                        'Las cantidades no pueden ser negativas.'
                    },
                    status=400
                )

            if suministro_id not in detalles_por_suministro:
                return Response(
                    {
                        'suministro':
                        'El suministro no pertenece al pedido seleccionado.'
                    },
                    status=400
                )

            if cantidad > 0:
                altas.append(
                    {
                        'detalle_pedido':
                        detalles_por_suministro[suministro_id],
                        'cantidad':
                        cantidad
                    }
                )

        if not altas:
            return Response(
                {
                    'detalles':
                    'Debes recibir al menos un suministro.'
                },
                status=400
            )

        observaciones = f'Pertenece al pedido "{pedido.nombre}".'

        with transaction.atomic():

            altas_creadas = []

            for alta in altas:

                detalle_pedido = alta['detalle_pedido']
                cantidad = alta['cantidad']
                suministro = detalle_pedido.suministro

                suministro.stock += cantidad

                suministro.save(
                    update_fields=['stock']
                )

                nueva_alta = AltaAlmacen.objects.create(
                    pedido=pedido,
                    suministro=suministro,
                    cantidad=cantidad,
                    precio_unidad=detalle_pedido.precio_unidad,
                    observaciones=observaciones,
                    factura_albaran=albaran,
                    stock_tras_alta=suministro.stock
                )

                altas_creadas.append(nueva_alta)

            pedido.recibido = True

            pedido.save(
                update_fields=['recibido']
            )

        serializer = AltaAlmacenSerializer(
            altas_creadas,
            many=True
        )

        return Response(
            serializer.data,
            status=201
        )
