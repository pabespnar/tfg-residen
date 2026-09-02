from django.utils import timezone

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Residente
from .serializers import ResidenteSerializer
from modulos.permissions import EsGestorResidentes


class ListaResidentesView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def get(self, request):
        residentes = Residente.objects.filter(activo=True)

        serializer = ResidenteSerializer(
            residentes,
            many=True
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