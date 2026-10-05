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
from evento.models import Historial, Notificacion
from usuarios.models import Usuario, Rol


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

                stock_anterior = suministro.stock
                suministro.stock -= cantidad

                suministro.save(
                    update_fields=['stock']
                )

                usuarios_almacen = Usuario.objects.filter(
                    rol=Rol.ALMACEN
                )

                if stock_anterior > 0 and suministro.stock == 0:
                    for usuario in usuarios_almacen:
                        Notificacion.objects.create(
                            tipo='Suministro sin stock',
                            descripcion=(
                                f'El suministro {suministro.nombre} '
                                f'ha quedado sin stock.'
                            ),
                            usuario=usuario
                        )

                elif (
                    stock_anterior > suministro.stock_minimo
                    and suministro.stock < suministro.stock_minimo
                ):
                    for usuario in usuarios_almacen:
                        Notificacion.objects.create(
                            tipo='Suministro por debajo del stock mínimo',
                            descripcion=(
                                f'El suministro {suministro.nombre} '
                                f'ha quedado por debajo de su stock mínimo '
                                f'({suministro.stock_minimo} '
                                f'{suministro.unidad}).'
                            ),
                            usuario=usuario
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

            servicio_nombre = dict(
                BajaAlmacen.Servicio.choices
            ).get(
                servicio,
                servicio
            )

            contenido_historial = '\n'.join(
                (
                    f'{baja.cantidad} '
                    f'{baja.suministro.unidad} '
                    f'de {baja.suministro.nombre}.'
                )
                for baja in bajas_creadas
            )

            Historial.objects.create(
                tipo='Baja de almacén',
                descripcion=(
                    f'Se ha realizado una baja de almacén '
                    f'para el servicio {servicio_nombre}.\n\n'
                    f'Observaciones:\n'
                    f'{observaciones.strip()}.\n\n'
                    f'Suministros retirados:\n'
                    f'{contenido_historial}'
                ),
                rol=request.user.rol,
                usuario=request.user
            )

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

        if albaran:
            if albaran.size > 5 * 1024 * 1024:
                return Response(
                    {'error': 'El albarán no puede superar los 5 MB.'},
                    status=400
                )
            if albaran.content_type not in [
                'application/pdf', 'image/jpeg', 'image/png', 'image/webp'
            ]:
                return Response(
                    {'error': 'El albarán debe ser un PDF o una imagen JPG, PNG o WEBP.'},
                    status=400
                )

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

        cantidades_recibidas = {
            alta['detalle_pedido'].suministro_id: alta['cantidad']
            for alta in altas
        }

        diferencias = []

        for detalle_pedido in detalles_pedido:

            cantidad_recibida = cantidades_recibidas.get(
                detalle_pedido.suministro_id,
                0
            )

            if cantidad_recibida != detalle_pedido.cantidad:
                diferencias.append(
                    (
                        detalle_pedido.suministro.nombre,
                        detalle_pedido.cantidad,
                        cantidad_recibida,
                        detalle_pedido.suministro.unidad
                    )
                )

        resultado_esperado = not diferencias

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

            contenido_historial = '\n'.join(
                (
                    f'{alta["cantidad"]} '
                    f'{alta["detalle_pedido"].suministro.unidad} '
                    f'de {alta["detalle_pedido"].suministro.nombre}.'
                )
                for alta in altas
            )

            Historial.objects.create(
                tipo='Alta de almacén',
                descripcion=(
                    f'Se ha registrado la recepción del pedido '
                    f'{pedido.nombre}.\n\n'
                    f'Suministros recibidos:\n'
                    f'{contenido_historial}\n\n'
                    f'Resultado esperado: '
                    f'{"Correcto" if resultado_esperado else "Erróneo"}.'
                ),
                rol=request.user.rol,
                usuario=request.user
            )

            if diferencias:
                contenido_diferencias = '\n'.join(
                    (
                        f'{nombre}: solicitado {cantidad_solicitada} '
                        f'{unidad}, recibido {cantidad_recibida} '
                        f'{unidad}.'
                    )
                    for (
                        nombre,
                        cantidad_solicitada,
                        cantidad_recibida,
                        unidad
                    ) in diferencias
                )

                usuarios_administracion = Usuario.objects.filter(
                    rol=Rol.ADMINISTRACION
                )

                for usuario in usuarios_administracion:
                    Notificacion.objects.create(
                        tipo='Diferencia entre pedido y alta de almacén',
                        descripcion=(
                            f'La recepción del pedido "{pedido.nombre}" '
                            f'no coincide con las cantidades solicitadas.\n\n'
                            f'Diferencias:\n'
                            f'{contenido_diferencias}'
                        ),
                        usuario=usuario
                    )

        serializer = AltaAlmacenSerializer(
            altas_creadas,
            many=True
        )

        return Response(
            serializer.data,
            status=201
        )