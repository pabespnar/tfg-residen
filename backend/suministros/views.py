from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from residentes.permissions import EsGestorResidentesOAlmacen
from expedientes.permissions import EsGestorAlmacenOAdministracion, EsGestorAdministracion

from .models import Categoria, Suministro, Pack, ContenidoPack, EntregaPack
from residentes.models import Residente
from almacen.models import BajaAlmacen
from .serializers import CategoriaSerializer, SuministroSerializer, PackSerializer, ContenidoPackSerializer, EntregaPackSerializer
from .permissions import EsGestorAlmacen
from django.db import transaction
from evento.models import Historial


class ListaSuministrosView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacenOAdministracion]

    def get(self, request):
        suministros = Suministro.objects.all()

        serializer = SuministroSerializer(
            suministros,
            many=True
        )

        return Response(serializer.data)


class DetalleSuministroView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def get(self, request, id):
        try:
            suministro = Suministro.objects.get(id=id)
        except Suministro.DoesNotExist:
            return Response(
                {"error": "El suministro no existe."},
                status=404
            )

        serializer = SuministroSerializer(
            suministro
        )

        return Response(serializer.data)


class EditarSuministroView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def patch(self, request, id):
        try:
            suministro = Suministro.objects.get(id=id)
        except Suministro.DoesNotExist:
            return Response(
                {"error": "El suministro no existe."},
                status=404
            )

        campos = {
            'detalles': 'Detalles',
            'stock_minimo': 'Stock mínimo',
            'categoria': 'Categoría'
        }

        valores_anteriores = {}

        for campo in campos:
            if campo in request.data:
                if campo == 'categoria':
                    categoria_anterior = suministro.categoria
                    valores_anteriores[campo] = (
                        categoria_anterior.nombre
                        if categoria_anterior
                        else 'Sin asignar'
                    )
                else:
                    valores_anteriores[campo] = getattr(
                        suministro,
                        campo
                    )

        datos = {}

        if 'detalles' in request.data:
            datos['detalles'] = request.data['detalles']

        if 'stock_minimo' in request.data:
            datos['stock_minimo'] = request.data['stock_minimo']

        if 'categoria' in request.data:
            datos['categoria'] = request.data['categoria']

        if not datos:
            return Response(
                {
                    "error": (
                        "Se debe indicar al menos uno de los campos "
                        "que se pueden modificar."
                    )
                },
                status=400
            )

        serializer = SuministroSerializer(
            suministro,
            data=datos,
            partial=True
        )

        if serializer.is_valid():
            suministro = serializer.save()

            cambios = []

            for campo, nombre_campo in campos.items():
                if campo not in request.data:
                    continue

                if campo == 'categoria':
                    categoria_nueva = suministro.categoria
                    valor_nuevo = (
                        categoria_nueva.nombre
                        if categoria_nueva
                        else 'Sin asignar'
                    )
                else:
                    valor_nuevo = getattr(
                        suministro,
                        campo
                    )

                valor_anterior = valores_anteriores[campo]

                if str(valor_anterior) != str(valor_nuevo):
                    if valor_anterior in [None, '']:
                        valor_anterior = 'Sin especificar'

                    if valor_nuevo in [None, '']:
                        valor_nuevo = 'Sin especificar'

                    cambios.append(
                        f'{nombre_campo}: '
                        f'{valor_anterior} → {valor_nuevo}'
                    )

            if cambios:
                descripcion_cambios = '\n'.join(cambios)
            else:
                descripcion_cambios = (
                    'No se han producido cambios en los datos '
                    'del suministro.'
                )

            Historial.objects.create(
                tipo='Edición de suministro',
                descripcion=(
                    f'Se han modificado los datos del suministro '
                    f'{suministro.nombre}.\n'
                    f'{descripcion_cambios}'
                ),
                rol=request.user.rol,
                usuario=request.user
            )

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )


class CrearCategoriaView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def post(self, request):
        serializer = CategoriaSerializer(
            data=request.data
        )

        if serializer.is_valid():
            categoria = serializer.save()

            Historial.objects.create(
                tipo='Alta de categoría',
                descripcion=(
                    f'Se ha creado la categoría '
                    f'{categoria.nombre}.\n'
                    f'Descripción: '
                    f'{categoria.descripcion or "Sin especificar"}.'
                ),
                rol=request.user.rol,
                usuario=request.user
            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )


class ListaCategoriasView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def get(self, request):
        categorias = Categoria.objects.all()

        serializer = CategoriaSerializer(
            categorias,
            many=True
        )

        datos = serializer.data

        suministros_sin_categoria = Suministro.objects.filter(
            categoria__isnull=True
        )

        suministros_serializer = SuministroSerializer(
            suministros_sin_categoria,
            many=True
        )

        if suministros_serializer.data:
            datos.append({
                'id': 'sin-asignar',
                'nombre': 'Sin asignar',
                'descripcion': 'Suministros que todavía no han sido asignados a una categoría.',
                'suministros': suministros_serializer.data,
            })

        return Response(datos)


class ListaPacksView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentesOAlmacen]

    def get(self, request):
        packs = Pack.objects.all()

        serializer = PackSerializer(
            packs,
            many=True
        )

        return Response(serializer.data)


class CrearPackView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def post(self, request):
        serializer = PackSerializer(
            data=request.data
        )

        if serializer.is_valid():
            pack = serializer.save()

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )


class CrearContenidoPackView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def post(self, request):
        serializer = ContenidoPackSerializer(
            data=request.data
        )

        if serializer.is_valid():
            contenido = serializer.save()

            if request.data.get('finalizar'):
                contenidos = ContenidoPack.objects.filter(
                    pack=contenido.pack
                ).select_related('suministro')

                contenido_historial = '\n'.join(
                    (
                        f'{item.cantidad} '
                        f'{item.suministro.unidad} '
                        f'de {item.suministro.nombre}.'
                    )
                    for item in contenidos
                )

                Historial.objects.create(
                    tipo='Alta de pack',
                    descripcion=(
                        f'Se ha creado el pack '
                        f'{contenido.pack.nombre}.\n'
                        f'Descripción: '
                        f'{contenido.pack.descripcion or "Sin especificar"}.\n'
                        f'Contenido:\n'
                        f'{contenido_historial}'
                    ),
                    rol=request.user.rol,
                    usuario=request.user
                )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )


class CrearEntregaPackView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def post(self, request, id):

        residentes_ids = request.data.get('residentes')

        if not residentes_ids:
            return Response(
                {"error": "Se debe seleccionar al menos un residente."},
                status=400
            )

        try:
            pack = Pack.objects.get(id=id)
        except Pack.DoesNotExist:
            return Response(
                {"error": "El pack no existe."},
                status=404
            )

        contenidos = pack.contenidopack_set.select_related(
            'suministro'
        ).all()

        if not contenidos.exists():
            return Response(
                {"error": "El pack no contiene suministros."},
                status=400
            )

        residentes = []

        for residente_id in residentes_ids:

            try:
                residente = Residente.objects.get(
                    id=residente_id,
                    activo=True
                )
            except Residente.DoesNotExist:
                return Response(
                    {
                        "error": (
                            "El residente no existe o no está activo."
                        )
                    },
                    status=400
                )

            if EntregaPack.objects.filter(
                pack=pack,
                residente_id=residente_id
            ).exists():
                return Response(
                    {
                        "error": (
                            "Uno de los residentes seleccionados "
                            "ya ha recibido este pack."
                        )
                    },
                    status=400
                )

            residentes.append(residente)

        numero_residentes = len(residentes_ids)

        for contenido in contenidos:

            cantidad_necesaria = (
                contenido.cantidad * numero_residentes
            )

            if contenido.suministro.stock < cantidad_necesaria:
                return Response(
                    {
                        "error": (
                            f"No hay stock suficiente de "
                            f"{contenido.suministro.nombre}."
                        )
                    },
                    status=400
                )

        observaciones = (
            f'Baja causada por la asignación de '
            f'"{pack.nombre}" a {numero_residentes} '
            f'{"residente" if numero_residentes == 1 else "residentes"}.'
        )

        with transaction.atomic():

            for contenido in contenidos:

                cantidad_necesaria = (
                    contenido.cantidad * numero_residentes
                )

                suministro = contenido.suministro

                suministro.stock -= cantidad_necesaria
                suministro.save(update_fields=['stock'])

                BajaAlmacen.objects.create(
                    suministro=suministro,
                    cantidad=cantidad_necesaria,
                    stock_tras_baja=suministro.stock,
                    tipo=BajaAlmacen.TipoBaja.PACK,
                    observaciones=observaciones
                )

            entregas = []

            for residente_id in residentes_ids:

                datos = {
                    'pack': pack.id,
                    'residente': residente_id,
                }

                serializer = EntregaPackSerializer(
                    data=datos
                )

                if not serializer.is_valid():
                    return Response(
                        serializer.errors,
                        status=400
                    )

                entrega = serializer.save()

                entregas.append(entrega)

        nombres_residentes = '\n'.join(
            f'{residente.nombre} {residente.apellido}.'
            for residente in residentes
        )

        contenido_historial = '\n'.join(
            (
                f'{contenido.cantidad * numero_residentes} '
                f'{contenido.suministro.unidad} '
                f'de {contenido.suministro.nombre}.'
            )
            for contenido in contenidos
        )

        Historial.objects.create(
            tipo='Entrega de pack',
            descripcion=(
                f'Se ha asignado el pack "{pack.nombre}".\n\n'
                f'Residentes:\n'
                f'{nombres_residentes}\n\n'
                f'Suministros retirados:\n'
                f'{contenido_historial}'
            ),
            rol=request.user.rol,
            usuario=request.user
        )

        serializer = EntregaPackSerializer(
            entregas,
            many=True
        )

        return Response(
            serializer.data,
            status=201
        )


class EliminarPackView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def delete(self, request, id):

        try:
            pack = Pack.objects.get(id=id)
        except Pack.DoesNotExist:
            return Response(
                {"error": "El pack no existe."},
                status=404
            )

        if EntregaPack.objects.filter(pack=pack).exists():
            return Response(
                {
                    "error": (
                        "No se puede eliminar un pack que ya ha sido "
                        "asignado a un residente."
                    )
                },
                status=400
            )

        nombre_pack = pack.nombre

        pack.delete()

        Historial.objects.create(
            tipo='Baja de pack',
            descripcion=(
                f'Se ha eliminado el pack {nombre_pack}.'
            ),
            rol=request.user.rol,
            usuario=request.user
        )

        return Response(
            {"mensaje": "Pack eliminado correctamente."},
            status=200
        )


class EliminarCategoriaView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def delete(self, request, id):

        try:
            categoria = Categoria.objects.get(id=id)
        except Categoria.DoesNotExist:
            return Response(
                {"error": "La categoría no existe."},
                status=404
            )

        nombre_categoria = categoria.nombre

        categoria.delete()

        Historial.objects.create(
            tipo='Baja de categoría',
            descripcion=(
                f'Se ha eliminado la categoría {nombre_categoria}.'
            ),
            rol=request.user.rol,
            usuario=request.user
        )

        return Response(
            {"mensaje": "Categoría eliminada correctamente."},
            status=200
        )


class CrearSuministroView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def post(self, request):

        datos = {
            'nombre': request.data.get('nombre'),
            'unidad': request.data.get('unidad'),
        }

        serializer = SuministroSerializer(
            data=datos
        )

        if serializer.is_valid():
            suministro = serializer.save()

            Historial.objects.create(
                tipo='Alta de suministro',
                descripcion=(
                    f'Se ha creado el suministro '
                    f'{suministro.nombre}.\n'
                    f'Unidad: {suministro.unidad}.'
                ),
                rol=request.user.rol,
                usuario=request.user
            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )


class EliminarSuministroView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def delete(self, request, id):

        try:
            suministro = Suministro.objects.get(id=id)
        except Suministro.DoesNotExist:
            return Response(
                {
                    'error': 'El suministro no existe.'
                },
                status=404
            )

        if suministro.detalles_expediente.exists():
            return Response(
                {
                    'error': 'No se puede eliminar el suministro porque está asociado a un expediente.'
                },
                status=400
            )

        if suministro.detalles_pedido.exists():
            return Response(
                {
                    'error': 'No se puede eliminar el suministro porque está asociado a un pedido.'
                },
                status=400
            )

        nombre_suministro = suministro.nombre

        suministro.delete()

        Historial.objects.create(
            tipo='Baja de suministro',
            descripcion=(
                f'Se ha eliminado el suministro '
                f'{nombre_suministro}.'
            ),
            rol=request.user.rol,
            usuario=request.user
        )

        return Response(
            {
                'mensaje': 'Suministro eliminado correctamente.'
            },
            status=200
        )