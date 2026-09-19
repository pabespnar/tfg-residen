from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Modulo, Habitacion
from .serializers import ModuloSerializer, HabitacionSerializer
from .permissions import EsGestorResidentes
from django.utils import timezone
from evento.models import Historial


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
            modulo = serializer.save()

            Historial.objects.create(
                tipo='Alta de módulo',
                descripcion=(
                    f'Se ha creado el módulo {modulo.nombre}.\n'
                    f'Descripción: '
                    f'{modulo.descripcion or "Sin especificar"}.\n'
                    f'Número máximo de habitaciones: '
                    f'{modulo.num_habitaciones_max}.'
                ),
                rol=request.user.rol,
                usuario=request.user
            )

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

        valores_anteriores = {
            'nombre': modulo.nombre,
            'descripcion': modulo.descripcion,
            'num_habitaciones_max': modulo.num_habitaciones_max
        }

        serializer = ModuloSerializer(
            modulo,
            data=request.data
        )

        if serializer.is_valid():
            modulo = serializer.save()

            cambios = []

            if str(valores_anteriores['nombre']) != str(modulo.nombre):
                cambios.append(
                    f'Nombre: {valores_anteriores["nombre"]} → '
                    f'{modulo.nombre}'
                )

            descripcion_anterior = (
                valores_anteriores['descripcion']
                if valores_anteriores['descripcion']
                else 'Sin especificar'
            )
            descripcion_nueva = (
                modulo.descripcion
                if modulo.descripcion
                else 'Sin especificar'
            )

            if str(descripcion_anterior) != str(descripcion_nueva):
                cambios.append(
                    f'Descripción: {descripcion_anterior} → '
                    f'{descripcion_nueva}'
                )

            if (
                valores_anteriores['num_habitaciones_max']
                != modulo.num_habitaciones_max
            ):
                cambios.append(
                    f'Número máximo de habitaciones: '
                    f'{valores_anteriores["num_habitaciones_max"]} → '
                    f'{modulo.num_habitaciones_max}'
                )

            if cambios:
                descripcion_cambios = '\n'.join(cambios)
            else:
                descripcion_cambios = (
                    'No se han producido cambios en los datos del módulo.'
                )

            Historial.objects.create(
                tipo='Edición de módulo',
                descripcion=(
                    f'Se han modificado los datos del módulo '
                    f'{modulo.nombre}.\n'
                    f'{descripcion_cambios}'
                ),
                rol=request.user.rol,
                usuario=request.user
            )

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

        nombre_modulo = modulo.nombre

        modulo.delete()

        Historial.objects.create(
            tipo='Baja de módulo',
            descripcion=(
                f'Se ha eliminado el módulo {nombre_modulo}.'
            ),
            rol=request.user.rol,
            usuario=request.user
        )

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
            habitacion = serializer.save(
                modulo=modulo,
                f_alta=timezone.now().date()
            )

            Historial.objects.create(
                tipo='Alta de habitación',
                descripcion=(
                    f'Se ha creado la habitación {habitacion.nombre} '
                    f'en el módulo {modulo.nombre}.\n'
                    f'Información: '
                    f'{habitacion.info or "Sin especificar"}.\n'
                    f'Capacidad: {habitacion.capacidad}.'
                ),
                rol=request.user.rol,
                usuario=request.user
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


class EditarHabitacionView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def put(self, request, modulo_pk, habitacion_pk):
        try:
            habitacion = Habitacion.objects.get(
                pk=habitacion_pk,
                modulo_id=modulo_pk
            )
        except Habitacion.DoesNotExist:
            return Response(
                {"error": "La habitación no existe."},
                status=404
            )

        nombre = request.data.get(
            "nombre",
            habitacion.nombre
        ).strip()

        if Habitacion.objects.filter(
            modulo=habitacion.modulo,
            nombre__iexact=nombre
        ).exclude(
            pk=habitacion.pk
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

        capacidad = request.data.get(
            "capacidad",
            habitacion.capacidad
        )

        if int(capacidad) < habitacion.residentes.count():
            return Response(
                {
                    "capacidad": (
                        "La capacidad no puede ser inferior "
                        "al número de residentes actuales."
                    )
                },
                status=400
            )

        valores_anteriores = {
            'nombre': habitacion.nombre,
            'info': habitacion.info,
            'capacidad': habitacion.capacidad
        }

        serializer = HabitacionSerializer(
            habitacion,
            data=request.data
        )

        if serializer.is_valid():
            habitacion = serializer.save()

            cambios = []

            if str(valores_anteriores['nombre']) != str(habitacion.nombre):
                cambios.append(
                    f'Nombre: {valores_anteriores["nombre"]} → '
                    f'{habitacion.nombre}'
                )

            info_anterior = (
                valores_anteriores['info']
                if valores_anteriores['info']
                else 'Sin especificar'
            )
            info_nueva = (
                habitacion.info
                if habitacion.info
                else 'Sin especificar'
            )

            if str(info_anterior) != str(info_nueva):
                cambios.append(
                    f'Información: {info_anterior} → {info_nueva}'
                )

            if valores_anteriores['capacidad'] != habitacion.capacidad:
                cambios.append(
                    f'Capacidad: {valores_anteriores["capacidad"]} → '
                    f'{habitacion.capacidad}'
                )

            if cambios:
                descripcion_cambios = '\n'.join(cambios)
            else:
                descripcion_cambios = (
                    'No se han producido cambios en los datos '
                    'de la habitación.'
                )

            Historial.objects.create(
                tipo='Edición de habitación',
                descripcion=(
                    f'Se han modificado los datos de la habitación '
                    f'{habitacion.nombre}.\n'
                    f'{descripcion_cambios}'
                ),
                rol=request.user.rol,
                usuario=request.user
            )

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=400
        )


class EliminarHabitacionView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def delete(self, request, modulo_pk, habitacion_pk):
        try:
            habitacion = Habitacion.objects.get(
                pk=habitacion_pk,
                modulo_id=modulo_pk
            )
        except Habitacion.DoesNotExist:
            return Response(
                {"error": "La habitación no existe."},
                status=404
            )

        if habitacion.residentes.exists():
            return Response(
                {
                    "error": (
                        "No se puede eliminar una habitación "
                        "que tiene residentes asociados."
                    )
                },
                status=400
            )

        nombre_habitacion = habitacion.nombre
        nombre_modulo = habitacion.modulo.nombre

        habitacion.delete()

        Historial.objects.create(
            tipo='Baja de habitación',
            descripcion=(
                f'Se ha eliminado la habitación {nombre_habitacion} '
                f'del módulo {nombre_modulo}.'
            ),
            rol=request.user.rol,
            usuario=request.user
        )

        return Response(
            status=204
        )