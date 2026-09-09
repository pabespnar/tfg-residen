from django.utils import timezone

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


from .models import Residente
from modulos.models import Habitacion
from .serializers import ResidenteSerializer
from modulos.permissions import EsGestorResidentes
from .permissions import EsGestorResidentesOAlmacen


class ListaResidentesView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentesOAlmacen]

    def get(self, request):

        residentes = Residente.objects.filter(activo=True)

        pack_id = request.query_params.get('pack_id')

        serializer = ResidenteSerializer(
            residentes,
            many=True,
            context={
                'pack_id': pack_id
            }
        )

        return Response(serializer.data)

class CrearResidenteView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = ResidenteSerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save(
                f_alta=timezone.now().date()
            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )

class DetalleResidenteView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def get(self, request, id):
        try:
            residente = Residente.objects.get(id=id)
        except Residente.DoesNotExist:
            return Response(
                {'error': 'El residente no existe.'},
                status=404
            )

        serializer = ResidenteSerializer(
            residente,
            context={'request': request}
        )

        return Response(serializer.data)


class EditarResidenteView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, id):
        try:
            residente = Residente.objects.get(id=id)
        except Residente.DoesNotExist:
            return Response(
                {'error': 'El residente no existe.'},
                status=404
            )

        serializer = ResidenteSerializer(
            residente,
            data=request.data,
            partial=True,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )

class DarDeBajaResidenteView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def post(self, request, id):
        try:
            residente = Residente.objects.get(id=id)
        except Residente.DoesNotExist:
            return Response(
                {'error': 'El residente no existe.'},
                status=404
            )

        if not residente.activo:
            return Response(
                {'error': 'El residente ya está dado de baja.'},
                status=400
            )

        residente.activo = False
        residente.f_baja = timezone.now().date()
        residente.habitacion = None
        residente.save()

        serializer = ResidenteSerializer(residente)

        return Response(serializer.data)


class DarDeAltaResidenteView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def post(self, request, id):
        try:
            residente = Residente.objects.get(id=id)
        except Residente.DoesNotExist:
            return Response(
                {'error': 'El residente no existe.'},
                status=404
            )

        if residente.activo:
            return Response(
                {'error': 'El residente ya está dado de alta.'},
                status=400
            )

        habitacion_id = request.data.get('habitacion')

        if not habitacion_id:
            return Response(
                {'habitacion': 'La habitación es obligatoria.'},
                status=400
            )

        try:
            habitacion = Habitacion.objects.get(
                id=habitacion_id
            )
        except Habitacion.DoesNotExist:
            return Response(
                {'habitacion': 'La habitación no existe.'},
                status=404
            )

        if habitacion.residentes.count() >= habitacion.capacidad:
            return Response(
                {
                    'habitacion':
                        'La habitación ha alcanzado su capacidad máxima.'
                },
                status=400
            )

        residente.activo = True
        residente.f_alta = timezone.now().date()
        residente.habitacion = habitacion
        residente.save()

        serializer = ResidenteSerializer(residente)

        return Response(serializer.data)


class ListaHistoricoResidentesView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def get(self, request):
        residentes = Residente.objects.filter(activo=False)

        serializer = ResidenteSerializer(
            residentes,
            many=True
        )

        return Response(serializer.data)