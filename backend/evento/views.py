from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notificacion, Historial
from .serializers import NotificacionSerializer, HistorialSerializer


class ListaNotificacionesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notificaciones = Notificacion.objects.filter(
            usuario=request.user
        )

        serializer = NotificacionSerializer(
            notificaciones,
            many=True
        )

        return Response(serializer.data)


class MarcarNotificacionLeidaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            notificacion = Notificacion.objects.get(
                id=id,
                usuario=request.user
            )
        except Notificacion.DoesNotExist:
            return Response(
                {'error': 'La notificación no existe.'},
                status=404
            )

        notificacion.leida = True
        notificacion.save(update_fields=['leida'])

        serializer = NotificacionSerializer(notificacion)

        return Response(serializer.data)


class ListaHistorialView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        historial = Historial.objects.filter(
            rol=request.user.rol
        )

        serializer = HistorialSerializer(
            historial,
            many=True
        )

        return Response(serializer.data)