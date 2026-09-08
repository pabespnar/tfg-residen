from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Categoria, Suministro, Pack, ContenidoPack, EntregaPack
from .serializers import CategoriaSerializer, SuministroSerializer, PackSerializer, ContenidoPackSerializer, EntregaPackSerializer
from .permissions import EsGestorAlmacen


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