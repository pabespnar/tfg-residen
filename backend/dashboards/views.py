from datetime import timedelta

from django.db.models import Count, Sum, F
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from residentes.models import Residente
from modulos.models import Habitacion
from modulos.permissions import EsGestorResidentes
from suministros.models import Suministro, Categoria, Pack, EntregaPack
from almacen.models import AltaAlmacen, BajaAlmacen
from expedientes.models import Expediente, Pedido, Proveedor
from suministros.permissions import EsGestorAlmacen
from expedientes.permissions import EsGestorAdministracion


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

        paises = {}

        conteo_paises = residentes_activos.values(
            'pais'
        ).annotate(
            total=Count('id')
        ).order_by(
            '-total'
        )

        for pais in conteo_paises:
            nombre_pais = pais['pais'] or 'Sin especificar'
            paises[nombre_pais] = pais['total']

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

        estancias_por_intervalo = {
            'Menos de 1 mes': 0,
            '1-3 meses': 0,
            '3-6 meses': 0,
            '6-12 meses': 0,
            '12 meses o más': 0,
        }

        for residente in estancias:
            dias_estancia = (
                residente.f_baja - residente.f_alta
            ).days

            if dias_estancia < 30:
                estancias_por_intervalo['Menos de 1 mes'] += 1
            elif dias_estancia < 90:
                estancias_por_intervalo['1-3 meses'] += 1
            elif dias_estancia < 180:
                estancias_por_intervalo['3-6 meses'] += 1
            elif dias_estancia < 365:
                estancias_por_intervalo['6-12 meses'] += 1
            else:
                estancias_por_intervalo['12 meses o más'] += 1

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

        modulos = {}

        for habitacion in Habitacion.objects.select_related(
            'modulo'
        ).all():
            nombre_modulo = habitacion.modulo.nombre

            if nombre_modulo not in modulos:
                modulos[nombre_modulo] = {
                    'id': habitacion.modulo.id,
                    'nombre': nombre_modulo,
                    'capacidad': 0,
                    'residentes': 0,
                }

            residentes_habitacion = habitacion.residentes.filter(
                activo=True
            ).count()

            modulos[nombre_modulo]['capacidad'] += habitacion.capacidad
            modulos[nombre_modulo]['residentes'] += residentes_habitacion

        for modulo in modulos.values():
            if modulo['capacidad']:
                modulo['ocupacion_porcentaje'] = round(
                    (
                        modulo['residentes'] /
                        modulo['capacidad']
                    ) * 100,
                    2
                )
            else:
                modulo['ocupacion_porcentaje'] = 0

        modulos_mas_poblados = sorted(
            modulos.values(),
            key=lambda modulo: (
                -modulo['residentes'],
                modulo['nombre']
            )
        )[:3]

        modulos_menos_poblados = sorted(
            modulos.values(),
            key=lambda modulo: (
                modulo['residentes'],
                modulo['nombre']
            )
        )[:3]

        meses = []

        año = hoy.year
        mes = hoy.month

        for _ in range(12):
            meses.append({
                'año': año,
                'mes': mes,
            })

            mes -= 1

            if mes == 0:
                mes = 12
                año -= 1

        meses.reverse()

        evolucion_mensual = []

        for periodo in meses:
            año = periodo['año']
            mes = periodo['mes']

            if mes == 12:
                siguiente_año = año + 1
                siguiente_mes = 1
            else:
                siguiente_año = año
                siguiente_mes = mes + 1

            inicio_mes = hoy.replace(
                year=año,
                month=mes,
                day=1
            )

            inicio_siguiente_mes = hoy.replace(
                year=siguiente_año,
                month=siguiente_mes,
                day=1
            )

            altas = Residente.objects.filter(
                f_alta__gte=inicio_mes,
                f_alta__lt=inicio_siguiente_mes
            ).count()

            bajas = Residente.objects.filter(
                f_baja__gte=inicio_mes,
                f_baja__lt=inicio_siguiente_mes
            ).count()

            evolucion_mensual.append({
                'mes': f'{año}-{mes:02d}',
                'altas': altas,
                'bajas': bajas,
            })

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
                'paises': paises,
                'estancia_media_dias': estancia_media_dias,
                'estancias': estancias_por_intervalo,
                'edades': edades,
                'evolucion_mensual': evolucion_mensual,
            },

            'habitaciones': {
                'totales': habitaciones_totales,
                'vacias': habitaciones_vacias,
                'parciales': habitaciones_parciales,
                'completas': habitaciones_completas,
            },

            'modulos': {
                'mas_poblados': modulos_mas_poblados,
                'menos_poblados': modulos_menos_poblados,
            },
        })


class DashboardAlmacenView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAlmacen]

    def get(self, request):
        hoy = timezone.now().date()
        hace_30_dias = hoy - timedelta(days=30)

        suministros = Suministro.objects.all()

        suministros_totales = suministros.count()

        suministros_sin_stock = suministros.filter(
            stock=0
        ).count()

        suministros_bajo_minimo = suministros.filter(
            stock__gt=0,
            stock__lt=F('stock_minimo')
        ).count()

        categorias_totales = Categoria.objects.count()

        packs_totales = Pack.objects.count()

        altas_ultimos_30_dias = AltaAlmacen.objects.filter(
            fecha__gte=hace_30_dias,
            fecha__lte=hoy
        ).count()

        bajas_ultimos_30_dias = BajaAlmacen.objects.filter(
            fecha__gte=hace_30_dias,
            fecha__lte=hoy
        ).count()

        entregas_ultimos_30_dias = EntregaPack.objects.filter(
            fecha_entrega__gte=hace_30_dias,
            fecha_entrega__lte=hoy
        ).count()

        pedidos_pendientes_alta = Pedido.objects.filter(
            recibido=False
        ).count()

        pedidos_recibidos = Pedido.objects.filter(
            recibido=True,
            fecha__gte=hace_30_dias,
            fecha__lte=hoy,
            altas__isnull=False
        ).distinct()

        pedidos_correctos = 0
        pedidos_incorrectos = 0

        for pedido in pedidos_recibidos:
            cantidades_solicitadas = {}

            for detalle in pedido.detalles_pedido.all():
                cantidades_solicitadas[detalle.suministro_id] = (
                    cantidades_solicitadas.get(
                        detalle.suministro_id,
                        0
                    ) + detalle.cantidad
                )

            cantidades_recibidas = {}

            altas = pedido.altas.values(
                'suministro_id'
            ).annotate(
                total=Sum('cantidad')
            )

            for alta in altas:
                cantidades_recibidas[alta['suministro_id']] = alta['total']

            if cantidades_solicitadas == cantidades_recibidas:
                pedidos_correctos += 1
            else:
                pedidos_incorrectos += 1

        bajas_por_servicio = {
            servicio[0]: 0
            for servicio in BajaAlmacen.Servicio.choices
        }

        conteo_servicios = BajaAlmacen.objects.filter(
            fecha__gte=hace_30_dias,
            fecha__lte=hoy,
            tipo=BajaAlmacen.TipoBaja.SERVICIO
        ).values(
            'servicio'
        ).annotate(
            total=Count('id')
        )

        for servicio in conteo_servicios:
            bajas_por_servicio[servicio['servicio']] = servicio['total']

        stock_sin_stock = suministros.filter(
            stock=0
        ).count()

        stock_bajo_minimo = suministros.filter(
            stock__gt=0,
            stock__lt=F('stock_minimo')
        ).count()

        stock_correcto = suministros.filter(
            stock__gt=0,
            stock__gte=F('stock_minimo')
        ).count()

        suministros_bajo_stock = suministros.filter(
            stock__gt=0,
            stock__lt=F('stock_minimo')
        ).order_by(
            'stock'
        )

        suministros_bajo_minimo_lista = []

        for suministro in suministros_bajo_stock:
            suministros_bajo_minimo_lista.append({
                'id': suministro.id,
                'nombre': suministro.nombre,
                'stock': suministro.stock,
                'stock_minimo': suministro.stock_minimo,
                'unidad': suministro.unidad,
            })

        suministros_sin_stock_lista = []

        for suministro in suministros.filter(
            stock=0
        ).order_by(
            'nombre'
        ):
            suministros_sin_stock_lista.append({
                'id': suministro.id,
                'nombre': suministro.nombre,
                'stock': suministro.stock,
                'stock_minimo': suministro.stock_minimo,
                'unidad': suministro.unidad,
            })

        entregas_por_pack = EntregaPack.objects.filter(
            fecha_entrega__gte=hace_30_dias,
            fecha_entrega__lte=hoy
        ).values(
            'pack__id',
            'pack__nombre'
        ).annotate(
            total=Count('id')
        ).order_by(
            '-total'
        )

        packs_entregados = {}

        for pack in entregas_por_pack:
            packs_entregados[pack['pack__nombre']] = pack['total']

        return Response({
            'resumen': {
                'suministros_totales': suministros_totales,
                'categorias_totales': categorias_totales,
                'suministros_sin_stock': suministros_sin_stock,
                'suministros_bajo_minimo': suministros_bajo_minimo,
                'packs_totales': packs_totales,
            },

            'actividad': {
                'altas_ultimos_30_dias': altas_ultimos_30_dias,
                'bajas_ultimos_30_dias': bajas_ultimos_30_dias,
                'entregas_ultimos_30_dias': entregas_ultimos_30_dias,
            },

            'stock': {
                'sin_stock': stock_sin_stock,
                'bajo_minimo': stock_bajo_minimo,
                'correcto': stock_correcto,
                'suministros_bajo_minimo': suministros_bajo_minimo_lista,
                'suministros_sin_stock': suministros_sin_stock_lista,
            },

            'entradas': {
                'pedidos_pendientes_alta': pedidos_pendientes_alta,
                'pedidos_correctos': pedidos_correctos,
                'pedidos_incorrectos': pedidos_incorrectos,
            },

            'bajas': {
                'por_servicio': bajas_por_servicio,
            },

            'packs': {
                'totales': packs_totales,
                'entregas_por_pack': packs_entregados,
            },
        })


class DashboardAdministracionView(APIView):
    permission_classes = [IsAuthenticated, EsGestorAdministracion]

    def get(self, request):
        hoy = timezone.now().date()
        hace_30_dias = hoy - timedelta(days=30)

        presupuesto_total_expedientes = Expediente.objects.aggregate(
            total=Sum('presupuesto')
        )['total'] or 0

        presupuesto_restante_expedientes = Expediente.objects.aggregate(
            total=Sum('presupuesto_restante')
        )['total'] or 0

        presupuesto_gastado_expedientes = (
            presupuesto_total_expedientes -
            presupuesto_restante_expedientes
        )

        expedientes_totales = Expediente.objects.count()

        expedientes_activos = Expediente.objects.filter(
            fecha_inicio__lte=hoy,
            fecha_final__gte=hoy
        ).count()

        expedientes_inactivos = (
            expedientes_totales -
            expedientes_activos
        )

        from centro.models import Centro

        centro = Centro.get_solo()

        presupuesto_gasto_corriente = centro.presupuesto

        pedidos_totales = Pedido.objects.count()

        pedidos_expediente = Pedido.objects.filter(
            tipo_pedido=Pedido.TipoPedido.EXPEDIENTE
        ).count()

        pedidos_generales = Pedido.objects.filter(
            tipo_pedido=Pedido.TipoPedido.GENERAL
        ).count()

        pedidos_ultimos_30_dias = Pedido.objects.filter(
            fecha__gte=hace_30_dias,
            fecha__lte=hoy
        ).count()

        pedidos_pendientes = Pedido.objects.filter(
            recibido=False
        ).count()

        importe_pedidos_generales = (
            Pedido.objects.filter(
                tipo_pedido=Pedido.TipoPedido.GENERAL
            ).aggregate(
                total=Sum(
                    F('detalles_pedido__cantidad') *
                    F('detalles_pedido__precio_unidad')
                )
            )['total'] or 0
        )

        importe_pedidos_generales_pendientes = (
            Pedido.objects.filter(
                tipo_pedido=Pedido.TipoPedido.GENERAL,
                recibido=False
            ).aggregate(
                total=Sum(
                    F('detalles_pedido__cantidad') *
                    F('detalles_pedido__precio_unidad')
                )
            )['total'] or 0
        )

        pedidos_generales_pendientes = Pedido.objects.filter(
            tipo_pedido=Pedido.TipoPedido.GENERAL,
            recibido=False
        ).count()

        importe_pedidos_generales_30_dias = (
            Pedido.objects.filter(
                tipo_pedido=Pedido.TipoPedido.GENERAL,
                fecha__gte=hace_30_dias,
                fecha__lte=hoy
            ).aggregate(
                total=Sum(
                    F('detalles_pedido__cantidad') *
                    F('detalles_pedido__precio_unidad')
                )
            )['total'] or 0
        )

        proveedores_totales = Proveedor.objects.count()

        proveedores_por_importe = (
            Proveedor.objects.filter(
                pedidos__isnull=False
            ).values(
                'id',
                'nombre'
            ).annotate(
                importe=Sum(
                    F('pedidos__detalles_pedido__cantidad') *
                    F('pedidos__detalles_pedido__precio_unidad')
                )
            ).order_by(
                '-importe'
            )[:5]
        )

        proveedores = []

        for proveedor in proveedores_por_importe:
            proveedores.append({
                'id': proveedor['id'],
                'nombre': proveedor['nombre'],
                'importe': proveedor['importe'] or 0,
            })

        return Response({
            'resumen': {
                'presupuesto_total_expedientes':
                    presupuesto_total_expedientes,

                'presupuesto_gastado_expedientes':
                    presupuesto_gastado_expedientes,

                'presupuesto_restante_expedientes':
                    presupuesto_restante_expedientes,

                'expedientes_totales':
                    expedientes_totales,

                'expedientes_activos':
                    expedientes_activos,

                'pedidos_totales':
                    pedidos_totales,

                'proveedores_totales':
                    proveedores_totales,

                'presupuesto_gasto_corriente':
                    presupuesto_gasto_corriente,
            },

            'pedidos': {
                'totales':
                    pedidos_totales,

                'con_expediente':
                    pedidos_expediente,

                'generales':
                    pedidos_generales,

                'ultimos_30_dias':
                    pedidos_ultimos_30_dias,

                'pendientes':
                    pedidos_pendientes,

                'generales_pendientes':
                    pedidos_generales_pendientes,

                'importe_generales':
                    importe_pedidos_generales,

                'importe_generales_pendientes':
                    importe_pedidos_generales_pendientes,

                'importe_generales_30_dias':
                    importe_pedidos_generales_30_dias,
            },

            'proveedores': {
                'totales':
                    proveedores_totales,

                'principales':
                    proveedores,
            },
        })