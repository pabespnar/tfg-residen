from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .permissions import EsGestorAdministracion
from suministros.permissions import EsGestorAlmacen

from .models import Expediente, Pedido, DetallePedido
from .serializers import ExpedienteSerializer, PedidoSerializer, DetallePedidoSerializer


class ListaExpedientesView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def get(self, request):
        expedientes = Expediente.objects.select_related(
            'proveedor'
        ).all().order_by('-fecha_inicio')

        serializer = ExpedienteSerializer(
            expedientes,
            many=True
        )

        return Response(serializer.data)


class CrearExpedienteView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def post(self, request):
        serializer = ExpedienteSerializer(
            data=request.data
        )

        if serializer.is_valid():
            expediente = serializer.save(
                presupuesto_restante=serializer.validated_data['presupuesto']
            )

            return Response(
                ExpedienteSerializer(expediente).data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )


class ListaPedidosView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def get(self, request):
        pedidos = Pedido.objects.select_related(
            'expediente'
        ).all().order_by('-fecha', '-id')

        serializer = PedidoSerializer(
            pedidos,
            many=True
        )

        return Response(serializer.data)


class ListaPedidosRecibidosView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def get(self, request):
        pedidos = Pedido.objects.select_related(
            'expediente'
        ).filter(
            recibido=True
        ).order_by('-fecha', '-id')

        serializer = PedidoSerializer(
            pedidos,
            many=True
        )

        return Response(serializer.data)


class CrearPedidoView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def post(self, request):
        serializer = PedidoSerializer(
            data=request.data
        )

        if serializer.is_valid():
            pedido = serializer.save()

            return Response(
                PedidoSerializer(pedido).data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )


class ListaDetallesPedidoView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def get(self, request, pedido_id):
        detalles = DetallePedido.objects.select_related(
            'suministro'
        ).filter(
            pedido_id=pedido_id
        ).all().order_by('id')

        serializer = DetallePedidoSerializer(
            detalles,
            many=True
        )

        return Response(serializer.data)


class CrearDetallePedidoView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def post(self, request):
        serializer = DetallePedidoSerializer(
            data=request.data
        )

        if serializer.is_valid():
            detalle = serializer.save()

            return Response(
                DetallePedidoSerializer(detalle).data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )