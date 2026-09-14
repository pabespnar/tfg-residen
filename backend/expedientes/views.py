from django.db import transaction
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .permissions import EsGestorAdministracion, EsGestorAlmacenOAdministracion
from decimal import Decimal, InvalidOperation

from .models import Expediente, Pedido, DetallePedido, Proveedor
from .serializers import ExpedienteSerializer, PedidoSerializer, DetallePedidoSerializer, DetalleExpedienteSerializer, ProveedorSerializer
from django.utils import timezone
from suministros.models import Suministro
from suministros.serializers import SuministroSerializer


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
    permission_classes = [IsAuthenticated, EsGestorAlmacenOAdministracion]

    def get(self, request):
        pedidos = Pedido.objects.select_related(
            'expediente'
        ).filter(
            recibido=False
        ).order_by('-fecha', '-id')

        serializer = PedidoSerializer(
            pedidos,
            many=True
        )

        return Response(serializer.data)



class ListaDetallesPedidoView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacenOAdministracion]

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
class VerExpedienteView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def get(self, request, pk):
        try:
            expediente = Expediente.objects.select_related(
                'proveedor'
            ).prefetch_related(
                'detalles_expediente__suministro',
                'pedidos'
            ).get(
                pk=pk
            )

        except Expediente.DoesNotExist:
            return Response(
                {"error": "El expediente no existe."},
                status=404
            )

        expediente_serializer = ExpedienteSerializer(
            expediente
        )

        detalles_serializer = DetalleExpedienteSerializer(
            expediente.detalles_expediente.all().order_by('id'),
            many=True
        )

        pedidos_serializer = PedidoSerializer(
            expediente.pedidos.all().order_by(
                '-fecha',
                '-id'
            ),
            many=True
        )

        return Response({
            'expediente': expediente_serializer.data,
            'detalles': detalles_serializer.data,
            'pedidos': pedidos_serializer.data,
        })
class CrearPedidoExpedienteView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def post(self, request, pk):

        try:
            expediente = Expediente.objects.get(pk=pk)
        except Expediente.DoesNotExist:
            return Response(
                {"error": "El expediente no existe."},
                status=404
            )

        if not expediente.activo:
            return Response(
                {"error": "No se pueden realizar pedidos en un expediente inactivo."},
                status=400
            )

        nombre = request.data.get('nombre')
        cantidades = request.data.get('cantidades', {})

        if not nombre or not nombre.strip():
            return Response(
                {"error": "El nombre del pedido no puede estar vacío."},
                status=400
            )

        if len(nombre.strip()) > 50:
            return Response(
                {"error": "El nombre del pedido no puede superar los 50 caracteres."},
                status=400
            )

        if not cantidades:
            return Response(
                {"error": "Debes indicar al menos un suministro."},
                status=400
            )

        detalles_expediente = {
            detalle.suministro_id: detalle
            for detalle in expediente.detalles_expediente.select_related(
                'suministro'
            ).all()
        }

        detalles_pedido = []
        total = 0

        for suministro_id, cantidad in cantidades.items():

            try:
                suministro_id = int(suministro_id)
                cantidad = int(cantidad)
            except (TypeError, ValueError):
                return Response(
                    {"error": "Las cantidades deben ser números enteros."},
                    status=400
                )

            if cantidad < 0:
                return Response(
                    {"error": "La cantidad no puede ser negativa."},
                    status=400
                )

            if cantidad == 0:
                continue

            if suministro_id not in detalles_expediente:
                return Response(
                    {
                        "error":
                        "El suministro no pertenece a este expediente."
                    },
                    status=400
                )

            detalle_expediente = detalles_expediente[suministro_id]

            subtotal = (
                cantidad *
                detalle_expediente.precio_unidad
            )

            total += subtotal

            detalles_pedido.append({
                'suministro': detalle_expediente.suministro,
                'cantidad': cantidad,
                'precio_unidad': detalle_expediente.precio_unidad,
            })

        if not detalles_pedido:
            return Response(
                {"error": "Debes indicar al menos un suministro."},
                status=400
            )

        if total > expediente.presupuesto_restante:
            return Response(
                {
                    "error":
                    "El importe del pedido supera el presupuesto restante del expediente."
                },
                status=400
            )

        with transaction.atomic():

            pedido = Pedido.objects.create(
                nombre=nombre.strip(),
                expediente=expediente,
                tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
                recibido=False
            )

            for detalle in detalles_pedido:

                DetallePedido.objects.create(
                    pedido=pedido,
                    suministro=detalle['suministro'],
                    cantidad=detalle['cantidad'],
                    precio_unidad=detalle['precio_unidad']
                )

            expediente.presupuesto_restante -= total
            expediente.save(
                update_fields=['presupuesto_restante']
            )

        send_mail(
            f'Nuevo pedido: {pedido.nombre}',
            f'Hola {expediente.proveedor.nombre},\n\n'
            f'Se ha realizado un nuevo pedido asociado al expediente '
            f'{expediente.nombre}.\n\n'
            f'Pedido: {pedido.nombre}\n'
            f'Fecha: {pedido.fecha}\n\n'
            f'Suministros que solicitamos:\n'
            + ''.join(
                f'- {detalle["suministro"].nombre}: '
                f'{detalle["cantidad"]} '
                f'{detalle["suministro"].unidad} '
                f'a {detalle["precio_unidad"]:.2f} € por unidad\n'
                for detalle in detalles_pedido
            )
            + f'\nCoste del pedido con los precios acordados: {total:.2f} €\n\n'
            f'Un saludo.',
            None,
            [expediente.proveedor.correo],
        )

        return Response(
            {
                'pedido': PedidoSerializer(pedido).data,
                'total': total,
                'presupuesto_restante':
                    expediente.presupuesto_restante
            },
            status=201
        )

class VerPedidoView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacenOAdministracion]

    def get(self, request, pk):
        try:
            pedido = Pedido.objects.select_related(
                'expediente'
            ).prefetch_related(
                'detalles_pedido__suministro'
            ).get(
                pk=pk
            )

        except Pedido.DoesNotExist:
            return Response(
                {"error": "El pedido no existe."},
                status=404
            )

        pedido_serializer = PedidoSerializer(
            pedido
        )

        detalles_serializer = DetallePedidoSerializer(
            pedido.detalles_pedido.all().order_by('id'),
            many=True
        )

        return Response({
            'pedido': pedido_serializer.data,
            'detalles': detalles_serializer.data,
        })
class ListaSuministrosDisponiblesView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def get(self, request):

        hoy = timezone.now().date()

        suministros_expedientes_activos = Suministro.objects.filter(
            detalles_expediente__expediente__fecha_inicio__lte=hoy,
            detalles_expediente__expediente__fecha_final__gte=hoy
        ).distinct()

        suministros_disponibles = Suministro.objects.exclude(
            id__in=suministros_expedientes_activos.values('id')
        ).order_by('nombre')

        serializer = SuministroSerializer(
            suministros_disponibles,
            many=True
        )

        return Response(serializer.data)


class CrearPedidoGeneralView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def post(self, request):

        nombre = request.data.get('nombre')
        suministros = request.data.get('suministros', {})

        if not nombre or not nombre.strip():
            return Response(
                {"error": "El nombre del pedido no puede estar vacío."},
                status=400
            )

        if len(nombre.strip()) > 50:
            return Response(
                {"error": "El nombre del pedido no puede superar los 50 caracteres."},
                status=400
            )

        if not suministros:
            return Response(
                {"error": "Debes indicar al menos un suministro."},
                status=400
            )

        hoy = timezone.now().date()

        suministros_expedientes_activos = Suministro.objects.filter(
            detalles_expediente__expediente__fecha_inicio__lte=hoy,
            detalles_expediente__expediente__fecha_final__gte=hoy
        ).distinct()

        suministros_disponibles = Suministro.objects.exclude(
            id__in=suministros_expedientes_activos.values('id')
        )

        suministros_disponibles = {
            suministro.id: suministro
            for suministro in suministros_disponibles
        }

        detalles_pedido = []
        total = 0

        for suministro_id, datos in suministros.items():

            try:
                suministro_id = int(suministro_id)
            except (TypeError, ValueError):
                return Response(
                    {"error": "El identificador del suministro no es válido."},
                    status=400
                )

            if suministro_id not in suministros_disponibles:
                return Response(
                    {
                        "error":
                        "Uno de los suministros seleccionados no está disponible para pedidos generales."
                    },
                    status=400
                )

            try:
                cantidad = int(datos.get('cantidad'))
                precio_unidad = Decimal(str(datos.get('precio_unidad')))
            except (TypeError, ValueError, AttributeError, InvalidOperation):
                return Response(
                    {
                        "error":
                        "La cantidad y el precio deben ser valores numéricos válidos."
                    },
                    status=400
                )

            if cantidad <= 0:
                return Response(
                    {"error": "La cantidad debe ser mayor que cero."},
                    status=400
                )

            if precio_unidad < 0:
                return Response(
                    {"error": "El precio por unidad no puede ser negativo."},
                    status=400
                )

            suministro = suministros_disponibles[suministro_id]

            subtotal = cantidad * precio_unidad
            total += subtotal

            detalles_pedido.append({
                'suministro': suministro,
                'cantidad': cantidad,
                'precio_unidad': precio_unidad,
            })

        if not detalles_pedido:
            return Response(
                {"error": "Debes indicar al menos un suministro."},
                status=400
            )

        with transaction.atomic():

            pedido = Pedido.objects.create(
                nombre=nombre.strip(),
                expediente=None,
                tipo_pedido=Pedido.TipoPedido.GENERAL,
                recibido=False
            )

            for detalle in detalles_pedido:

                DetallePedido.objects.create(
                    pedido=pedido,
                    suministro=detalle['suministro'],
                    cantidad=detalle['cantidad'],
                    precio_unidad=detalle['precio_unidad']
                )

        return Response(
            {
                'pedido': PedidoSerializer(pedido).data,
                'total': total,
            },
            status=201
        )
class ListaProveedoresView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def get(self, request):

        proveedores = Proveedor.objects.prefetch_related(
            'expedientes'
        ).all().order_by('nombre')

        serializer = ProveedorSerializer(
            proveedores,
            many=True
        )

        return Response(serializer.data)

class EditarProveedorView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def patch(self, request, pk):

        try:
            proveedor = Proveedor.objects.get(pk=pk)
        except Proveedor.DoesNotExist:
            return Response(
                {'error': 'El proveedor no existe.'},
                status=404
            )

        serializer = ProveedorSerializer(
            proveedor,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                ProveedorSerializer(proveedor).data
            )

        return Response(
            serializer.errors,
            status=400
        )