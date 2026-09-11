from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BajaAlmacen
from .serializers import BajaAlmacenSerializer
from suministros.permissions import EsGestorAlmacen


class ListaBajasAlmacenView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def get(self, request):
        bajas = BajaAlmacen.objects.all().order_by('-fecha', '-id')

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

            suministro = serializer.validated_data['suministro']
            cantidad = serializer.validated_data['cantidad']

            if suministro.stock < cantidad:
                return Response(
                    {
                        'cantidad':
                        'No hay stock suficiente para realizar la baja.'
                    },
                    status=400
                )

            suministro.stock -= cantidad
            suministro.save(update_fields=['stock'])

            datos_baja = serializer.validated_data.copy()
            datos_baja['stock_tras_baja'] = suministro.stock

            baja = BajaAlmacen.objects.create(
                **datos_baja
            )

            serializer = BajaAlmacenSerializer(baja)

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )