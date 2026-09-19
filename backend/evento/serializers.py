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

    usuario_nombre = serializers.CharField(
        source='usuario.nombre',
        read_only=True
    )
    usuario_apellido = serializers.CharField(
        source='usuario.apellido',
        read_only=True
    )
    usuario_email = serializers.EmailField(
        source='usuario.email',
        read_only=True
    )
    usuario_imagen = serializers.ImageField(
        source='usuario.imagen_perfil',
        read_only=True
    )

    class Meta:
        model = Historial
        fields = [
            'id',
            'tipo',
            'descripcion',
            'fecha',
            'rol',
            'usuario',
            'usuario_nombre',
            'usuario_apellido',
            'usuario_email',
            'usuario_imagen',
        ]
        read_only_fields = [
            'id',
            'fecha',
            'rol',
            'usuario',
            'usuario_nombre',
            'usuario_apellido',
            'usuario_email',
            'usuario_imagen',
        ]