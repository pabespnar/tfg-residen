from rest_framework import serializers

from .models import Notificacion, Historial


class NotificacionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notificacion
        fields = [
            'id',
            'tipo',
            'descripcion',
            'fecha',
            'usuario',
            'leida',
        ]
        read_only_fields = [
            'id',
            'fecha',
            'usuario',
        ]


class HistorialSerializer(serializers.ModelSerializer):

    class Meta:
        model = Historial
        fields = [
            'id',
            'tipo',
            'descripcion',
            'fecha',
            'rol',
        ]
        read_only_fields = [
            'id',
            'fecha',
            'rol',
        ]