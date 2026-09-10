from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BajaAlmacen
from .serializers import BajaAlmacenSerializer
from suministros.permissions import EsGestorAlmacen


class ListaBajasAlmacenView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def get(self, request):
        bajas = BajaAlmacen.objects.all()

        serializer = BajaAlmacenSerializer(
            bajas,
            many=True
        )

        return Response(serializer.data)


class CrearBajaExtraordinariaView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def post(self, request):
        datos = request.data.copy()

        datos['tipo'] = BajaAlmacen.TipoBaja.EXTRAORDINARIA

        serializer = BajaAlmacenSerializer(
            data=datos
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