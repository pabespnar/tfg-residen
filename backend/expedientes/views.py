from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .permissions import EsGestorAdministracion

from .models import Expediente
from .serializers import ExpedienteSerializer


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
            expediente = serializer.save()

            return Response(
                ExpedienteSerializer(expediente).data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )