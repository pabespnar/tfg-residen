from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Modulo, Habitacion
from .serializers import ModuloSerializer, HabitacionSerializer
from .permissions import EsGestorResidentes
from django.utils import timezone


class ListaModulosView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def get(self, request):
        modulos = Modulo.objects.all()
        serializer = ModuloSerializer(modulos, many=True)

        return Response(serializer.data)


class CrearModuloView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

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
    permission_classes = [IsAuthenticated, EsGestorResidentes]

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
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def delete(self, request, pk):
        try:
            modulo = Modulo.objects.get(pk=pk)
        except Modulo.DoesNotExist:
            return Response(
                {"error": "El módulo no existe."},
                status=404
            )

        if modulo.habitaciones.exists():
            return Response(
                {
                    "error": (
                        "No se puede eliminar un módulo "
                        "que tiene habitaciones asociadas."
                    )
                },
                status=400
            )

        modulo.delete()

        return Response(
            status=204
        )


class ListaHabitacionesView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def get(self, request, pk):
        try:
            modulo = Modulo.objects.get(pk=pk)
        except Modulo.DoesNotExist:
            return Response(
                {"error": "El módulo no existe."},
                status=404
            )

        habitaciones = Habitacion.objects.filter(
            modulo=modulo
        )

        serializer = HabitacionSerializer(
            habitaciones,
            many=True
        )

        return Response(serializer.data)


class CrearHabitacionView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def post(self, request, pk):
        try:
            modulo = Modulo.objects.get(pk=pk)
        except Modulo.DoesNotExist:
            return Response(
                {"error": "El módulo no existe."},
                status=404
            )

        if modulo.habitaciones.count() >= modulo.num_habitaciones_max:
            return Response(
                {
                    "error": (
                        "El módulo ha alcanzado el número "
                        "máximo de habitaciones."
                    )
                },
                status=400
            )

        nombre = request.data.get("nombre", "").strip()

        if Habitacion.objects.filter(
            modulo=modulo,
            nombre__iexact=nombre
        ).exists():
            return Response(
                {
                    "nombre": (
                        "Ya existe una habitación con ese nombre "
                        "en este módulo."
                    )
                },
                status=400
            )

        serializer = HabitacionSerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save(
                modulo=modulo,
                f_alta=timezone.now().date()
            )

            return Response(
                serializer.data,
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )

class DetallesHabitacionView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def get(self, request, modulo_pk, habitacion_pk):
        habitacion = Habitacion.objects.get(
            pk=habitacion_pk,
            modulo_id=modulo_pk
        )

        serializer = HabitacionSerializer(
            habitacion,
            context={'request': request}
        )

        return Response(serializer.data)