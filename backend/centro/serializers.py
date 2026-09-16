from rest_framework import serializers
from .models import Centro


class CentroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centro
        fields = ['nombre', 'logo', 'presupuesto', 'correo']