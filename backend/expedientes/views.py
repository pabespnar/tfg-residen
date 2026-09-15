from django.db import transaction
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
import json


from .permissions import EsGestorAdministracion, EsGestorAlmacenOAdministracion
from decimal import Decimal, InvalidOperation

from centro.models import Centro
from .models import Expediente, Pedido, DetallePedido, Proveedor, DetalleExpediente
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
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):

        datos_expediente = {
            'nombre': request.data.get('nombre'),
            'detalles': request.data.get('detalles'),
            'fecha_inicio': request.data.get('fecha_inicio'),
            'fecha_final': request.data.get('fecha_final'),
            'proveedor': request.data.get('proveedor'),
            'presupuesto': request.data.get('presupuesto'),
        }

        if request.data.get('contrato'):
            datos_expediente['contrato'] = request.data.get('contrato')

        suministros = request.data.get('suministros', '[]')

        try:
            if isinstance(suministros, str):
                suministros = json.loads(suministros)
        except json.JSONDecodeError:
            return Response(
                {
                    'error':
                        'Los suministros enviados no tienen un formato válido.'
                },
                status=400
            )

        if not isinstance(suministros, list) or not suministros:
            return Response(
                {
                    'error':
                        'Debes indicar al menos un suministro.'
                },
                status=400
            )

        serializer = ExpedienteSerializer(
            data=datos_expediente
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=400
            )

        suministros_ids = []

        for suministro in suministros:

            if not isinstance(suministro, dict):
                return Response(
                    {
                        'error':
                            'Los datos de los suministros no son válidos.'
                    },
                    status=400
                )

            suministro_id = suministro.get('suministro')
            precio_unidad = suministro.get('precio_unidad')

            if not suministro_id:
                return Response(
                    {
                        'error':
                            'Todos los suministros deben estar seleccionados.'
                    },
                    status=400
                )

            try:
                suministro_id = int(suministro_id)
            except (TypeError, ValueError):
                return Response(
                    {
                        'error':
                            'El identificador del suministro no es válido.'
                    },
                    status=400
                )

            if suministro_id in suministros_ids:
                return Response(
                    {
                        'error':
                            'No se puede añadir el mismo suministro más de una vez.'
                    },
                    status=400
                )

            suministros_ids.append(suministro_id)

            if precio_unidad is None or precio_unidad == '':
                return Response(
                    {
                        'error':
                            'Todos los suministros deben tener un precio por unidad.'
                    },
                    status=400
                )

            try:
                suministro_obj = Suministro.objects.get(
                    id=suministro_id
                )
            except Suministro.DoesNotExist:
                return Response(
                    {
                        'error':
                            'Uno de los suministros seleccionados no existe.'
                    },
                    status=400
                )
            hoy = timezone.now().date()

            if DetalleExpediente.objects.filter(
                suministro=suministro_obj,
                expediente__fecha_inicio__lte=hoy,
                expediente__fecha_final__gte=hoy
            ).exists():
                return Response(
                    {
                        'error':
                            (
                                f'El suministro "{suministro_obj.nombre}" '
                                'ya está asociado a un expediente activo.'
                            )
                    },
                    status=400
                )
        with transaction.atomic():

            expediente = serializer.save(
                presupuesto_restante=serializer.validated_data['presupuesto']
            )

            for suministro in suministros:

                detalle_serializer = DetalleExpedienteSerializer(
                    data={
                        'expediente': expediente.id,
                        'suministro': suministro['suministro'],
                        'precio_unidad': suministro['precio_unidad'],
                    }
                )

                detalle_serializer.is_valid(raise_exception=True)
                detalle_serializer.save()

        return Response(
            {
                'expediente': ExpedienteSerializer(
                    expediente
                ).data,
                'detalles': DetalleExpedienteSerializer(
                    expediente.detalles_expediente.all().order_by('id'),
                    many=True
                ).data,
            },
            status=201
        )

class ListaPedidosView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def get(self, request):
        pedidos = Pedido.objects.select_related(
            'expediente',
            'proveedor'
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
            'expediente',
            'proveedor'
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
            expediente = Expediente.objects.select_related(
                'proveedor'
            ).get(
                pk=pk
            )
        except Expediente.DoesNotExist:
            return Response(
                {"error": "El expediente no existe."},
                status=404
            )

        hoy = timezone.now().date()

        if not (
            expediente.fecha_inicio <= hoy <= expediente.fecha_final
        ):
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
                proveedor=expediente.proveedor,
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
            f'Hola, {expediente.proveedor.nombre}.\n\n'
            f'Hemos realizado un nuevo pedido asociado al expediente '
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
            + f'\nEl coste del pedido, con los precios acordados en el expediente, es de {total:.2f} €\n\n'
            f'Gracias de antemano.\n'
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
                'expediente',
                'proveedor'
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
        proveedor_id = request.data.get('proveedor')
        suministros = request.data.get('suministros', {})

        if not nombre or not nombre.strip():
            return Response(
                {"error": "El nombre del pedido no puede estar vacío."},
                status=400
            )

        if len(nombre.strip()) > 50:
            return Response(
                {
                    "error":
                    "El nombre del pedido no puede superar los 50 caracteres."
                },
                status=400
            )

        if not proveedor_id:
            return Response(
                {"error": "Debes seleccionar un proveedor."},
                status=400
            )

        try:
            proveedor_id = int(proveedor_id)
        except (TypeError, ValueError):
            return Response(
                {"error": "El proveedor seleccionado no es válido."},
                status=400
            )

        try:
            proveedor = Proveedor.objects.get(
                id=proveedor_id
            )
        except Proveedor.DoesNotExist:
            return Response(
                {"error": "El proveedor seleccionado no existe."},
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
        total = Decimal('0.00')

        for suministro_id, datos in suministros.items():

            try:
                suministro_id = int(suministro_id)
            except (TypeError, ValueError):
                return Response(
                    {
                        "error":
                        "El identificador del suministro no es válido."
                    },
                    status=400
                )

            if suministro_id not in suministros_disponibles:
                return Response(
                    {
                        "error":
                        "Uno de los suministros seleccionados no está "
                        "disponible para pedidos generales."
                    },
                    status=400
                )

            try:
                cantidad = int(datos.get('cantidad'))
                precio_unidad = Decimal(
                    str(datos.get('precio_unidad'))
                )
            except (
                TypeError,
                ValueError,
                AttributeError,
                InvalidOperation
            ):
                return Response(
                    {
                        "error":
                        "La cantidad y el precio deben ser valores "
                        "numéricos válidos."
                    },
                    status=400
                )

            if cantidad <= 0:
                return Response(
                    {
                        "error":
                        "La cantidad debe ser mayor que cero."
                    },
                    status=400
                )

            if precio_unidad < 0:
                return Response(
                    {
                        "error":
                        "El precio por unidad no puede ser negativo."
                    },
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
                {
                    "error":
                    "Debes indicar al menos un suministro."
                },
                status=400
            )

        with transaction.atomic():

            centro = Centro.objects.select_for_update().get(
                pk=Centro.get_solo().pk
            )
            
            if total > centro.presupuesto:
                return Response(
                    {
                        "error":
                        "El importe del pedido supera el presupuesto "
                        "restante del centro.",
                        "presupuesto_restante":
                            centro.presupuesto,
                        "total":
                            total,
                        "diferencia":
                            centro.presupuesto - total,
                    },
                    status=400
                )

            presupuesto_restante = (
                centro.presupuesto - total
            )

            pedido = Pedido.objects.create(
                nombre=nombre.strip(),
                expediente=None,
                proveedor=proveedor,
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

            centro.presupuesto = presupuesto_restante
            centro.save(
                update_fields=['presupuesto']
            )

        send_mail(
            f'Nuevo pedido: {pedido.nombre}',
            f'Hola, {proveedor.nombre}.\n\n'
            f'Le realizamos un nuevo pedido.\n\n'
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
            + f'\nEl coste total del pedido, con los precios que ustedes '
            f'marcan, es de {total:.2f} €\n\n'
            f'Gracias de antemano.\n'
            f'Un saludo.',
            None,
            [proveedor.correo],
        )

        return Response(
            {
                'pedido': PedidoSerializer(pedido).data,
                'total': total,
                'presupuesto_restante':
                    presupuesto_restante,
                'diferencia':
                    -total,
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
    parser_classes = [MultiPartParser, FormParser]

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

class EliminarProveedorView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def delete(self, request, pk):

        try:
            proveedor = Proveedor.objects.get(pk=pk)
        except Proveedor.DoesNotExist:
            return Response(
                {"error": "El proveedor no existe."},
                status=404
            )

        if Expediente.objects.filter(proveedor=proveedor).exists():
            return Response(
                {
                    "error": (
                        "No se puede eliminar un proveedor que ya tiene "
                        "expedientes asociados."
                    )
                },
                status=400
            )

        if Pedido.objects.filter(proveedor=proveedor).exists():
            return Response(
                {
                    "error": (
                        "No se puede eliminar un proveedor que ya tiene "
                        "pedidos asociados."
                    )
                },
                status=400
            )

        proveedor.delete()

        return Response(
            {"mensaje": "Proveedor eliminado correctamente."},
            status=200
        )
class CrearProveedorView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):

        serializer = ProveedorSerializer(
            data=request.data
        )

        if serializer.is_valid():
            proveedor = serializer.save()

            return Response(
                ProveedorSerializer(proveedor).data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )