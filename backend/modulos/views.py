from django.shortcuts import render

# Create your views here.
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Modulo
from .serializers import ModuloSerializer

class ListaModulosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        modulos = Modulo.objects.all()
        serializer = ModuloSerializer(modulos, many=True)

        return Response(serializer.data)

class CrearModuloView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ModuloSerializer(data=request.data)

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

class EditarModuloView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            modulo = Modulo.objects.get(pk=pk)
        except Modulo.DoesNotExist:
            return Response(
                {"error": "El módulo no existe."},
                status=404
            )

        serializer = ModuloSerializer(
            modulo,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=400
        )


class EliminarModuloView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            modulo = Modulo.objects.get(pk=pk)
        except Modulo.DoesNotExist:
            return Response(
                {"error": "El módulo no existe."},
                status=404
            )

        modulo.delete()

        return Response(
            {"mensaje": "Módulo eliminado correctamente."},
            status=204
        )