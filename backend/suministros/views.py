from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Categoria, Suministro, Pack, ContenidoPack, EntregaPack
from residentes.models import Residente
from almacen.models import BajaAlmacen
from .serializers import CategoriaSerializer, SuministroSerializer, PackSerializer, ContenidoPackSerializer, EntregaPackSerializer
from .permissions import EsGestorAlmacen
from django.db import transaction

class ListaSuministrosView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

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

        datos = {}

        if 'detalles' in request.data:
            datos['detalles'] = request.data['detalles']

        if 'stock_minimo' in request.data:
            datos['stock_minimo'] = request.data['stock_minimo']

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
            serializer.save()

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
            serializer.save()

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
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

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
            serializer.save()

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
            serializer.save()

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

        for residente_id in residentes_ids:

            if not Residente.objects.filter(
                id=residente_id,
                activo=True
            ).exists():
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

        pack.delete()

        return Response(
            {"mensaje": "Pack eliminado correctamente."},
            status=200
        )