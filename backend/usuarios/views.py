from django.shortcuts import render

# Create your views here.
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from .serializers import UsuarioSerializer


class UsuarioActualView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        serializer = UsuarioSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = UsuarioSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class CambiarContrasenaView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        contrasena_actual = request.data.get('contrasena_actual')
        nueva_contrasena = request.data.get('nueva_contrasena')

        if not contrasena_actual:
            return Response(
                {'contrasena_actual': 'La contraseña actual es obligatoria.'},
                status=400
            )

        if not nueva_contrasena:
            return Response(
                {'nueva_contrasena': 'La nueva contraseña es obligatoria.'},
                status=400
            )

        if not request.user.check_password(contrasena_actual):
            return Response(
                {'contrasena_actual': 'La contraseña actual no es correcta.'},
                status=400
            )

        if len(nueva_contrasena) < 8:
            return Response(
                {'nueva_contrasena': 'La nueva contraseña debe tener al menos 8 caracteres.'},
                status=400
            )

        if contrasena_actual == nueva_contrasena:
            return Response(
                {'nueva_contrasena': 'La nueva contraseña debe ser diferente de la actual.'},
                status=400
            )

        request.user.set_password(nueva_contrasena)
        request.user.save()

        return Response(
            {'mensaje': 'Contraseña actualizada correctamente.'}
        )