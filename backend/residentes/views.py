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

    def post(self, request):
        serializer = ResidenteSerializer(
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