from django.utils import timezone

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Residente
from modulos.models import Habitacion
from .serializers import ResidenteSerializer
from modulos.permissions import EsGestorResidentes
from .permissions import EsGestorResidentesOAlmacen
from evento.models import Historial


class ListaResidentesView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentesOAlmacen]

    def get(self, request):

        residentes = Residente.objects.filter(activo=True)

        pack_id = request.query_params.get('pack_id')

        serializer = ResidenteSerializer(
            residentes,
            many=True,
            context={
                'pack_id': pack_id
            }
        )

        return Response(serializer.data)


class CrearResidenteView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = ResidenteSerializer(
            data=request.data
        )

        if serializer.is_valid():
            residente = serializer.save(
                f_alta=timezone.now().date()
            )

            habitacion = residente.habitacion

            if habitacion:
                habitacion_info = (
                    f'{habitacion.nombre}, '
                    f'Módulo {habitacion.modulo.nombre}'
                )
            else:
                habitacion_info = 'Sin habitación asignada'

            Historial.objects.create(
                tipo='Alta de residente',
                descripcion=(
                    f'Se ha dado de alta al residente '
                    f'{residente.nombre} {residente.apellido} en el centro.\n'
                    f'Fecha de alta: '
                    f'{residente.f_alta.strftime("%d/%m/%Y")}.\n'
                    f'Habitación asignada: {habitacion_info}.\n'
                    f'País: {residente.pais}.'
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


class DetalleResidenteView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def get(self, request, id):
        try:
            residente = Residente.objects.get(id=id)
        except Residente.DoesNotExist:
            return Response(
                {'error': 'El residente no existe.'},
                status=404
            )

        serializer = ResidenteSerializer(
            residente,
            context={'request': request}
        )

        return Response(serializer.data)


class EditarResidenteView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, id):
        try:
            residente = Residente.objects.get(id=id)
        except Residente.DoesNotExist:
            return Response(
                {'error': 'El residente no existe.'},
                status=404
            )

        campos = {
            'nombre': 'Nombre',
            'apellido': 'Apellido',
            'telefono': 'Teléfono',
            'email': 'Correo electrónico',
            'f_nacimiento': 'Fecha de nacimiento',
            'info': 'Información',
            'pais': 'País',
            'dni_nie': 'DNI/NIE',
            'habitacion': 'Habitación',
            'foto': 'Foto',
            'genero': 'Género'
        }

        valores_anteriores = {}

        for campo in campos:
            if campo in request.data:
                if campo == 'habitacion':
                    habitacion_anterior = residente.habitacion

                    if habitacion_anterior:
                        valores_anteriores[campo] = (
                            f'{habitacion_anterior.nombre}, '
                            f'Módulo {habitacion_anterior.modulo.nombre}'
                        )
                    else:
                        valores_anteriores[campo] = 'Sin habitación'
                elif campo == 'foto':
                    valores_anteriores[campo] = bool(residente.foto)
                else:
                    valores_anteriores[campo] = getattr(
                        residente,
                        campo
                    )

        serializer = ResidenteSerializer(
            residente,
            data=request.data,
            partial=True,
            context={'request': request}
        )

        if serializer.is_valid():
            residente = serializer.save()

            cambios = []

            for campo, nombre_campo in campos.items():
                if campo not in request.data:
                    continue

                if campo == 'habitacion':
                    habitacion_nueva = residente.habitacion

                    if habitacion_nueva:
                        valor_nuevo = (
                            f'{habitacion_nueva.nombre}, '
                            f'Módulo {habitacion_nueva.modulo.nombre}'
                        )
                    else:
                        valor_nuevo = 'Sin habitación'

                elif campo == 'foto':
                    valor_nuevo = bool(residente.foto)

                else:
                    valor_nuevo = getattr(
                        residente,
                        campo
                    )

                valor_anterior = valores_anteriores[campo]

                if campo == 'foto':
                    if valor_anterior != valor_nuevo:
                        cambios.append(
                            f'{nombre_campo}: Foto '
                            f'{"añadida" if valor_nuevo else "eliminada"}.'
                        )
                else:
                    if str(valor_anterior) != str(valor_nuevo):
                        if valor_anterior in [None, '']:
                            valor_anterior = 'Sin especificar'

                        if valor_nuevo in [None, '']:
                            valor_nuevo = 'Sin especificar'

                        cambios.append(
                            f'{nombre_campo}: '
                            f'{valor_anterior} → {valor_nuevo}'
                        )

            if cambios:
                descripcion_cambios = '\n'.join(cambios)
            else:
                descripcion_cambios = (
                    'No se han producido cambios en los datos '
                    'del residente.'
                )

            Historial.objects.create(
                tipo='Edición de residente',
                descripcion=(
                    f'Se han modificado los datos del residente '
                    f'{residente.nombre} {residente.apellido}.\n'
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


class DarDeBajaResidenteView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def post(self, request, id):
        try:
            residente = Residente.objects.get(id=id)
        except Residente.DoesNotExist:
            return Response(
                {'error': 'El residente no existe.'},
                status=404
            )

        if not residente.activo:
            return Response(
                {'error': 'El residente ya está dado de baja.'},
                status=400
            )

        habitacion_anterior = residente.habitacion

        if habitacion_anterior:
            habitacion_info = (
                f'{habitacion_anterior.nombre}, '
                f'Módulo {habitacion_anterior.modulo.nombre}'
            )
        else:
            habitacion_info = 'Sin habitación asignada'

        residente.activo = False
        residente.f_baja = timezone.now().date()
        residente.habitacion = None
        residente.save()

        Historial.objects.create(
            tipo='Baja de residente',
            descripcion=(
                f'Se ha dado de baja al residente '
                f'{residente.nombre} {residente.apellido} del centro.\n'
                f'Fecha de baja: '
                f'{residente.f_baja.strftime("%d/%m/%Y")}.\n'
                f'Habitación que ocupaba: {habitacion_info}.'
            ),
            rol=request.user.rol,
            usuario=request.user
        )

        serializer = ResidenteSerializer(residente)

        return Response(serializer.data)


class DarDeAltaResidenteView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def post(self, request, id):
        try:
            residente = Residente.objects.get(id=id)
        except Residente.DoesNotExist:
            return Response(
                {'error': 'El residente no existe.'},
                status=404
            )

        if residente.activo:
            return Response(
                {'error': 'El residente ya está dado de alta.'},
                status=400
            )

        habitacion_id = request.data.get('habitacion')

        if not habitacion_id:
            return Response(
                {'habitacion': 'La habitación es obligatoria.'},
                status=400
            )

        try:
            habitacion = Habitacion.objects.get(
                id=habitacion_id
            )
        except Habitacion.DoesNotExist:
            return Response(
                {'habitacion': 'La habitación no existe.'},
                status=404
            )

        if habitacion.residentes.count() >= habitacion.capacidad:
            return Response(
                {
                    'habitacion':
                        'La habitación ha alcanzado su capacidad máxima.'
                },
                status=400
            )

        residente.activo = True
        residente.f_alta = timezone.now().date()
        residente.habitacion = habitacion
        residente.save()

        habitacion_info = (
            f'{habitacion.nombre}, '
            f'Módulo {habitacion.modulo.nombre}'
        )

        Historial.objects.create(
            tipo='Reingreso de residente',
            descripcion=(
                f'Se ha producido el reingreso del residente '
                f'{residente.nombre} {residente.apellido} en el centro.\n'
                f'Fecha de reingreso: '
                f'{residente.f_alta.strftime("%d/%m/%Y")}.\n'
                f'Nueva habitación asignada: {habitacion_info}.'
            ),
            rol=request.user.rol,
            usuario=request.user
        )

        serializer = ResidenteSerializer(residente)

        return Response(serializer.data)


class ListaHistoricoResidentesView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def get(self, request):
        residentes = Residente.objects.filter(activo=False)

        serializer = ResidenteSerializer(
            residentes,
            many=True
        )

        return Response(serializer.data)