from datetime import timedelta

from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from residentes.models import Residente
from modulos.models import Habitacion
from modulos.permissions import EsGestorResidentes


class DashboardResidentesView(APIView):
    permission_classes = [IsAuthenticated, EsGestorResidentes]

    def get(self, request):
        hoy = timezone.now().date()
        hace_30_dias = hoy - timedelta(days=30)

        residentes_activos = Residente.objects.filter(activo=True)
        residentes_inactivos = Residente.objects.filter(activo=False)

        residentes_actuales = residentes_activos.count()

        capacidad_total = Habitacion.objects.aggregate(
            total=Sum('capacidad')
        )['total'] or 0

        plazas_libres = capacidad_total - residentes_actuales

        if capacidad_total:
            ocupacion_porcentaje = round(
                (residentes_actuales / capacidad_total) * 100,
                2
            )
        else:
            ocupacion_porcentaje = 0

        altas_ultimos_30_dias = Residente.objects.filter(
            f_alta__gte=hace_30_dias,
            f_alta__lte=hoy
        ).count()

        bajas_ultimos_30_dias = residentes_inactivos.filter(
            f_baja__gte=hace_30_dias,
            f_baja__lte=hoy
        ).count()

        total_generos = residentes_activos.count()

        generos = {
            'M': 0,
            'F': 0,
            'O': 0,
        }

        if total_generos:
            conteo_generos = residentes_activos.values(
                'genero'
            ).annotate(
                total=Count('id')
            )

            for genero in conteo_generos:
                generos[genero['genero']] = round(
                    (genero['total'] / total_generos) * 100,
                    2
                )

        estancias = residentes_inactivos.filter(
            f_alta__isnull=False,
            f_baja__isnull=False
        )

        estancia_media_dias = 0

        if estancias.exists():
            total_dias = 0

            for residente in estancias:
                total_dias += (
                    residente.f_baja - residente.f_alta
                ).days

            estancia_media_dias = round(
                total_dias / estancias.count(),
                2
            )

        edades = {}

        for residente in residentes_activos:
            edad = hoy.year - residente.f_nacimiento.year

            if (
                hoy.month,
                hoy.day
            ) < (
                residente.f_nacimiento.month,
                residente.f_nacimiento.day
            ):
                edad -= 1

            if edad < 0:
                continue

            intervalo_inicio = (edad // 10) * 10
            intervalo_fin = intervalo_inicio + 9
            intervalo = f'{intervalo_inicio}-{intervalo_fin}'

            edades[intervalo] = edades.get(intervalo, 0) + 1

        edades = dict(
            sorted(
                edades.items(),
                key=lambda item: int(item[0].split('-')[0])
            )
        )

        habitaciones_totales = Habitacion.objects.count()

        habitaciones_vacias = 0
        habitaciones_parciales = 0
        habitaciones_completas = 0

        for habitacion in Habitacion.objects.all():
            residentes_actuales_habitacion = habitacion.residentes.filter(
                activo=True
            ).count()

            if residentes_actuales_habitacion == 0:
                habitaciones_vacias += 1

            elif residentes_actuales_habitacion >= habitacion.capacidad:
                habitaciones_completas += 1

            else:
                habitaciones_parciales += 1

        return Response({
            'resumen': {
                'residentes_actuales': residentes_actuales,
                'capacidad_total': capacidad_total,
                'plazas_libres': plazas_libres,
                'ocupacion_porcentaje': ocupacion_porcentaje,
            },

            'residentes': {
                'altas_ultimos_30_dias': altas_ultimos_30_dias,
                'bajas_ultimos_30_dias': bajas_ultimos_30_dias,
                'generos': generos,
                'estancia_media_dias': estancia_media_dias,
                'edades': edades,
            },

            'habitaciones': {
                'totales': habitaciones_totales,
                'vacias': habitaciones_vacias,
                'parciales': habitaciones_parciales,
                'completas': habitaciones_completas,
            },
        })