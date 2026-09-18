from datetime import date, datetime, timezone as dt_timezone
from decimal import Decimal

from django.db import transaction

from centro.models import Centro
from usuarios.models import Usuario, Rol
from modulos.models import Modulo, Habitacion
from residentes.models import Residente, Genero
from suministros.models import (
    Categoria,
    Suministro,
    Pack,
    ContenidoPack,
    EntregaPack,
)
from almacen.models import AltaAlmacen, BajaAlmacen
from expedientes.models import (
    Proveedor,
    Expediente,
    DetalleExpediente,
    Pedido,
    DetallePedido,
)
from evento.models import Historial, Notificacion


HOY = date(2026, 9, 16)


def _fijar_fecha(objeto, fecha):
    """Los modelos de evento.Evento usan auto_now_add, así que la fecha
    pasada a .objects.create() se ignora. Este helper la fija después,
    con un UPDATE que no pasa por save() y por tanto no la sobrescribe.
    `fecha` puede ser date o datetime; si es date se fija a mediodía UTC."""
    if isinstance(fecha, date) and not isinstance(fecha, datetime):
        fecha = datetime(
            fecha.year, fecha.month, fecha.day, 12, 0,
            tzinfo=dt_timezone.utc,
        )
    type(objeto).objects.filter(pk=objeto.pk).update(fecha=fecha)


def limpiar_base_datos():
    Notificacion.objects.all().delete()
    Historial.objects.all().delete()
    BajaAlmacen.objects.all().delete()
    AltaAlmacen.objects.all().delete()
    EntregaPack.objects.all().delete()
    ContenidoPack.objects.all().delete()
    DetallePedido.objects.all().delete()
    DetalleExpediente.objects.all().delete()
    Pedido.objects.all().delete()
    Expediente.objects.all().delete()
    Proveedor.objects.all().delete()
    Residente.objects.all().delete()
    Habitacion.objects.all().delete()
    Modulo.objects.all().delete()
    Pack.objects.all().delete()
    Suministro.objects.all().delete()
    Categoria.objects.all().delete()
    Usuario.objects.all().delete()
    Centro.objects.all().delete()


def crear_centro():
    centro = Centro.get_solo()
    centro.nombre = 'Residencia Los Olivos'
    centro.presupuesto_referencia = Decimal('60000.00')
    centro.presupuesto = Decimal('47843.50')
    centro.correo = 'contacto@residencialosolivos.es'
    centro.save()
    return centro


def crear_usuarios():
    usuarios = {}

    usuarios['residentes'] = Usuario.objects.create_user(
        email='residentes@tfg.com',
        password='Test1234!',
        nombre='Laura',
        apellido='García López',
        telefono='600100001',
        dni='11111111A',
        rol=Rol.RESIDENTES,
    )

    usuarios['residentes2'] = Usuario.objects.create_user(
        email='residentes2@tfg.com',
        password='Test1234!',
        nombre='Ana',
        apellido='Torres Vidal',
        telefono='600100005',
        dni='55555555E',
        rol=Rol.RESIDENTES,
    )

    usuarios['almacen'] = Usuario.objects.create_user(
        email='almacen@tfg.com',
        password='Test1234!',
        nombre='Carlos',
        apellido='Martínez Ruiz',
        telefono='600100002',
        dni='22222222B',
        rol=Rol.ALMACEN,
    )

    usuarios['almacen2'] = Usuario.objects.create_user(
        email='almacen2@tfg.com',
        password='Test1234!',
        nombre='Pedro',
        apellido='Ibáñez Cruz',
        telefono='600100006',
        dni='66666666F',
        rol=Rol.ALMACEN,
    )

    usuarios['administracion'] = Usuario.objects.create_user(
        email='administracion@tfg.com',
        password='Test1234!',
        nombre='Marta',
        apellido='Sánchez Díaz',
        telefono='600100003',
        dni='33333333C',
        rol=Rol.ADMINISTRACION,
    )

    usuarios['administracion2'] = Usuario.objects.create_user(
        email='administracion2@tfg.com',
        password='Test1234!',
        nombre='Elena',
        apellido='Roldán Peña',
        telefono='600100007',
        dni='77777777G',
        rol=Rol.ADMINISTRACION,
    )

    usuarios['admin'] = Usuario.objects.create_superuser(
        email='admin@tfg.com',
        password='Admin1234!',
        nombre='Administrador',
        apellido='Sistema',
        telefono='600100004',
        dni='44444444D',
        rol=Rol.ADMINISTRACION,
    )

    return usuarios


def crear_modulos_y_habitaciones():
    modulo1 = Modulo.objects.create(
        nombre='Módulo A',
        descripcion='Zona residencial principal.',
        num_habitaciones_max=3,
    )

    modulo2 = Modulo.objects.create(
        nombre='Módulo B',
        descripcion='Zona residencial secundaria.',
        num_habitaciones_max=2,
    )

    modulo3 = Modulo.objects.create(
        nombre='Módulo C',
        descripcion='Zona residencial de menor capacidad.',
        num_habitaciones_max=2,
    )

    modulo4 = Modulo.objects.create(
        nombre='Módulo D',
        descripcion='Ampliación reciente, en proceso de puesta en marcha.',
        num_habitaciones_max=3,
    )

    habitaciones = {}

    habitaciones['A1'] = Habitacion.objects.create(
        nombre='Habitación 1',
        info='Habitación de cuatro plazas.',
        capacidad=4,
        f_alta=date(2024, 1, 10),
        modulo=modulo1,
    )

    habitaciones['A2'] = Habitacion.objects.create(
        nombre='Habitación 2',
        info='Habitación de cuatro plazas.',
        capacidad=4,
        f_alta=date(2024, 1, 10),
        modulo=modulo1,
    )

    habitaciones['A3'] = Habitacion.objects.create(
        nombre='Habitación 3',
        info='Habitación actualmente disponible.',
        capacidad=4,
        f_alta=date(2024, 1, 10),
        modulo=modulo1,
    )

    habitaciones['B1'] = Habitacion.objects.create(
        nombre='Habitación 1',
        info='Habitación de tres plazas.',
        capacidad=3,
        f_alta=date(2024, 2, 15),
        modulo=modulo2,
    )

    habitaciones['B2'] = Habitacion.objects.create(
        nombre='Habitación 2',
        info='Habitación de tres plazas.',
        capacidad=3,
        f_alta=date(2024, 2, 15),
        modulo=modulo2,
    )

    habitaciones['C1'] = Habitacion.objects.create(
        nombre='Habitación 1',
        info='Habitación de dos plazas.',
        capacidad=2,
        f_alta=date(2024, 3, 20),
        modulo=modulo3,
    )

    habitaciones['C2'] = Habitacion.objects.create(
        nombre='Habitación 2',
        info='Habitación de dos plazas.',
        capacidad=2,
        f_alta=date(2024, 3, 20),
        modulo=modulo3,
    )

    habitaciones['D1'] = Habitacion.objects.create(
        nombre='Habitación 1',
        info='Habitación recién acondicionada, pendiente de asignar.',
        capacidad=3,
        f_alta=date(2026, 8, 1),
        modulo=modulo4,
    )

    return habitaciones


def crear_residentes(habitaciones):
    residentes = {}

    datos = [
        (
            'Ahmed',
            'Benali',
            '600200001',
            'ahmed@example.com',
            date(1992, 5, 14),
            date(2026, 1, 15),
            None,
            'Marruecos',
            'X0000001A',
            True,
            habitaciones['A1'],
            Genero.MASCULINO,
        ),
        (
            'Youssef',
            'El Amrani',
            '600200002',
            'youssef@example.com',
            date(1988, 9, 21),
            date(2026, 2, 3),
            None,
            'Marruecos',
            'X0000002B',
            True,
            habitaciones['A1'],
            Genero.MASCULINO,
        ),
        (
            'Omar',
            'Haddad',
            '600200003',
            'omar@example.com',
            date(1995, 3, 8),
            date(2026, 2, 18),
            None,
            'Argelia',
            'X0000003C',
            True,
            habitaciones['A1'],
            Genero.MASCULINO,
        ),
        (
            'Samir',
            'Nasser',
            '600200004',
            'samir@example.com',
            date(1979, 11, 2),
            date(2026, 3, 10),
            None,
            'Egipto',
            'X0000004D',
            True,
            habitaciones['A1'],
            Genero.MASCULINO,
        ),
        (
            'Karim',
            'Amar',
            '600200005',
            'karim@example.com',
            date(1990, 7, 30),
            date(2026, 4, 12),
            None,
            'Marruecos',
            'X0000005E',
            True,
            habitaciones['A2'],
            Genero.MASCULINO,
        ),
        (
            'Moussa',
            'Diallo',
            '600200006',
            'moussa@example.com',
            date(1985, 1, 19),
            date(2026, 4, 25),
            None,
            'Guinea',
            'X0000006F',
            True,
            habitaciones['A2'],
            Genero.MASCULINO,
        ),
        (
            'Amina',
            'Khalil',
            '600200007',
            'amina@example.com',
            date(1998, 12, 11),
            date(2026, 5, 6),
            None,
            'Túnez',
            'X0000007G',
            True,
            habitaciones['B1'],
            Genero.FEMENINO,
        ),
        (
            'Fatima',
            'Zahra',
            '600200008',
            'fatima@example.com',
            date(1993, 6, 4),
            date(2026, 5, 20),
            None,
            'Marruecos',
            'X0000008H',
            True,
            habitaciones['B1'],
            Genero.FEMENINO,
        ),
        (
            'Nadia',
            'Said',
            '600200009',
            'nadia@example.com',
            date(2001, 10, 17),
            date(2026, 6, 1),
            None,
            'Argelia',
            'X0000009I',
            True,
            habitaciones['B1'],
            Genero.FEMENINO,
        ),
        (
            'Hassan',
            'Farouk',
            '600200010',
            'hassan@example.com',
            date(1982, 2, 26),
            date(2026, 6, 14),
            None,
            'Egipto',
            'X0000010J',
            True,
            habitaciones['B2'],
            Genero.MASCULINO,
        ),
        (
            'Sara',
            'Mansour',
            '',
            '',
            date(1997, 8, 9),
            date(2026, 8, 20),
            None,
            'Túnez',
            'X0000011K',
            True,
            habitaciones['A3'],
            Genero.FEMENINO,
        ),
        (
            'Bilal',
            'Rahmani',
            '',
            '',
            date(1991, 4, 13),
            date(2026, 9, 5),
            None,
            'Marruecos',
            'X0000012L',
            True,
            habitaciones['B2'],
            Genero.MASCULINO,
        ),
        (
            'Adil',
            'Mekki',
            '600200013',
            'adil@example.com',
            date(1987, 3, 1),
            date(2025, 1, 10),
            date(2026, 4, 15),
            'Marruecos',
            'X0000013M',
            False,
            None,
            Genero.MASCULINO,
        ),
        (
            'Leila',
            'Boukhris',
            '600200014',
            'leila@example.com',
            date(1994, 5, 27),
            date(2025, 3, 12),
            date(2026, 7, 22),
            'Argelia',
            'X0000014N',
            False,
            None,
            Genero.FEMENINO,
        ),
        (
            'Yusuf',
            'Camara',
            '600200015',
            'yusuf@example.com',
            date(2000, 2, 2),
            date(2026, 2, 1),
            date(2026, 3, 15),
            'Guinea',
            'X0000015O',
            False,
            None,
            Genero.MASCULINO,
        ),
        (
            'Kim',
            'Nguyen',
            '600200016',
            'kim@example.com',
            date(1996, 11, 23),
            date(2026, 7, 1),
            None,
            'Vietnam',
            'X0000016P',
            True,
            habitaciones['C1'],
            Genero.OTRO,
        ),
    ]

    for (
        nombre,
        apellido,
        telefono,
        email,
        f_nacimiento,
        f_alta,
        f_baja,
        pais,
        dni_nie,
        activo,
        habitacion,
        genero,
    ) in datos:
        residente = Residente.objects.create(
            nombre=nombre,
            apellido=apellido,
            telefono=telefono,
            email=email,
            f_nacimiento=f_nacimiento,
            f_alta=f_alta,
            f_baja=f_baja,
            info='Residente de prueba para el entorno de demostración.',
            pais=pais,
            dni_nie=dni_nie,
            activo=activo,
            habitacion=habitacion,
            genero=genero,
        )
        residentes[dni_nie] = residente

    return residentes


def crear_categorias():
    categorias = {}

    categorias['Higiene'] = Categoria.objects.create(
        nombre='Higiene',
        descripcion='Productos de higiene y cuidado personal.',
    )

    categorias['Alimentación'] = Categoria.objects.create(
        nombre='Alimentación',
        descripcion='Productos destinados a la alimentación.',
    )

    categorias['Limpieza'] = Categoria.objects.create(
        nombre='Limpieza',
        descripcion='Productos de limpieza y mantenimiento.',
    )

    categorias['Textil'] = Categoria.objects.create(
        nombre='Textil',
        descripcion='Ropa de cama, toallas y otros productos textiles.',
    )

    categorias['Sanitario'] = Categoria.objects.create(
        nombre='Sanitario',
        descripcion='Material sanitario y de protección.',
    )

    categorias['Farmacia'] = Categoria.objects.create(
        nombre='Farmacia',
        descripcion='Medicamentos y material de botiquín (pendiente de alta).',
    )

    return categorias


def crear_suministros(categorias):
    suministros = {}

    suministros['jabon'] = Suministro.objects.create(
        nombre='Jabón corporal',
        detalles='Jabón líquido para higiene personal.',
        stock=103,
        unidad='unidades',
        stock_minimo=30,
        categoria=categorias['Higiene'],
    )

    suministros['pasta'] = Suministro.objects.create(
        nombre='Pasta de dientes',
        detalles='Pasta dental de uso diario.',
        stock=38,
        unidad='unidades',
        stock_minimo=15,
        categoria=categorias['Higiene'],
    )

    suministros['cepillo'] = Suministro.objects.create(
        nombre='Cepillo de dientes',
        detalles='Cepillo dental individual.',
        stock=15,
        unidad='unidades',
        stock_minimo=15,
        categoria=categorias['Higiene'],
    )

    suministros['papel'] = Suministro.objects.create(
        nombre='Papel higiénico',
        detalles='Rollos de papel higiénico.',
        stock=1400,
        unidad='rollos',
        stock_minimo=500,
        categoria=categorias['Higiene'],
    )

    suministros['arroz'] = Suministro.objects.create(
        nombre='Arroz',
        detalles='Arroz blanco de consumo habitual.',
        stock=68,
        unidad='kg',
        stock_minimo=30,
        categoria=categorias['Alimentación'],
    )

    suministros['leche'] = Suministro.objects.create(
        nombre='Leche',
        detalles='Leche de consumo habitual.',
        stock=78,
        unidad='litros',
        stock_minimo=40,
        categoria=categorias['Alimentación'],
    )

    suministros['detergente'] = Suministro.objects.create(
        nombre='Detergente',
        detalles='Detergente para limpieza general.',
        stock=735,
        unidad='litros',
        stock_minimo=200,
        categoria=categorias['Limpieza'],
    )

    suministros['guantes'] = Suministro.objects.create(
        nombre='Guantes desechables',
        detalles='Guantes para tareas de limpieza.',
        stock=1040,
        unidad='pares',
        stock_minimo=300,
        categoria=categorias['Limpieza'],
    )
    suministros['mantas'] = Suministro.objects.create(
        nombre='Mantas',
        detalles='Mantas para residentes.',
        stock=0,
        unidad='unidades',
        stock_minimo=10,
        categoria=categorias['Textil'],
    )

    suministros['toallas'] = Suministro.objects.create(
        nombre='Toallas',
        detalles='Toallas de baño.',
        stock=190,
        unidad='unidades',
        stock_minimo=50,
        categoria=categorias['Textil'],
    )

    suministros['mascarillas'] = Suministro.objects.create(
        nombre='Mascarillas',
        detalles='Mascarillas de protección.',
        stock=1950,
        unidad='unidades',
        stock_minimo=500,
        categoria=categorias['Sanitario'],
    )

    suministros['guantes_nitrilo'] = Suministro.objects.create(
        nombre='Guantes de nitrilo',
        detalles='Guantes sanitarios de nitrilo.',
        stock=2000,
        unidad='pares',
        stock_minimo=500,
        categoria=categorias['Sanitario'],
    )

    suministros['termometros'] = Suministro.objects.create(
        nombre='Termómetros digitales',
        detalles='Termómetros de uso individual, pendientes de categorizar.',
        stock=12,
        unidad='unidades',
        stock_minimo=5,
        categoria=None,
    )

    return suministros


def crear_packs(suministros):
    pack_higiene = Pack.objects.create(
        nombre='Pack de higiene',
        descripcion='Pack básico de higiene personal.',
    )

    ContenidoPack.objects.create(
        pack=pack_higiene,
        suministro=suministros['jabon'],
        cantidad=1,
    )

    ContenidoPack.objects.create(
        pack=pack_higiene,
        suministro=suministros['pasta'],
        cantidad=1,
    )

    ContenidoPack.objects.create(
        pack=pack_higiene,
        suministro=suministros['cepillo'],
        cantidad=1,
    )

    pack_alimentacion = Pack.objects.create(
        nombre='Pack de alimentación',
        descripcion='Pack básico de productos alimentarios.',
    )

    ContenidoPack.objects.create(
        pack=pack_alimentacion,
        suministro=suministros['arroz'],
        cantidad=2,
    )

    ContenidoPack.objects.create(
        pack=pack_alimentacion,
        suministro=suministros['leche'],
        cantidad=2,
    )

    pack_completo = Pack.objects.create(
        nombre='Pack de bienvenida',
        descripcion='Pack inicial para nuevos residentes.',
    )

    ContenidoPack.objects.create(
        pack=pack_completo,
        suministro=suministros['jabon'],
        cantidad=1,
    )

    ContenidoPack.objects.create(
        pack=pack_completo,
        suministro=suministros['pasta'],
        cantidad=1,
    )

    ContenidoPack.objects.create(
        pack=pack_completo,
        suministro=suministros['cepillo'],
        cantidad=1,
    )

    return pack_higiene, pack_alimentacion, pack_completo


def crear_entregas_y_bajas_packs(
    pack_higiene,
    pack_alimentacion,
    residentes,
    suministros,
):
    residente1 = residentes['X0000001A']
    residente2 = residentes['X0000002B']
    residente3 = residentes['X0000007G']

    entrega1 = EntregaPack.objects.create(
        pack=pack_higiene,
        residente=residente1,
    )

    entrega2 = EntregaPack.objects.create(
        pack=pack_higiene,
        residente=residente2,
    )

    entrega3 = EntregaPack.objects.create(
        pack=pack_alimentacion,
        residente=residente3,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['jabon'],
        cantidad=1,
        tipo=BajaAlmacen.TipoBaja.PACK,
        entrega_pack=entrega1,
        observaciones='Baja causada por la asignación de Pack de higiene a 1 residentes.',
        stock_tras_baja=129,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['pasta'],
        cantidad=1,
        tipo=BajaAlmacen.TipoBaja.PACK,
        entrega_pack=entrega1,
        observaciones='Baja causada por la asignación de Pack de higiene a 1 residentes.',
        stock_tras_baja=39,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['cepillo'],
        cantidad=1,
        tipo=BajaAlmacen.TipoBaja.PACK,
        entrega_pack=entrega1,
        observaciones='Baja causada por la asignación de Pack de higiene a 1 residentes.',
        stock_tras_baja=16,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['jabon'],
        cantidad=1,
        tipo=BajaAlmacen.TipoBaja.PACK,
        entrega_pack=entrega2,
        observaciones='Baja causada por la asignación de Pack de higiene a 1 residentes.',
        stock_tras_baja=128,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['pasta'],
        cantidad=1,
        tipo=BajaAlmacen.TipoBaja.PACK,
        entrega_pack=entrega2,
        observaciones='Baja causada por la asignación de Pack de higiene a 1 residentes.',
        stock_tras_baja=38,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['cepillo'],
        cantidad=1,
        tipo=BajaAlmacen.TipoBaja.PACK,
        entrega_pack=entrega2,
        observaciones='Baja causada por la asignación de Pack de higiene a 1 residentes.',
        stock_tras_baja=15,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['arroz'],
        cantidad=2,
        tipo=BajaAlmacen.TipoBaja.PACK,
        entrega_pack=entrega3,
        observaciones='Baja causada por la asignación de Pack de alimentación a 1 residentes.',
        stock_tras_baja=78,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['leche'],
        cantidad=2,
        tipo=BajaAlmacen.TipoBaja.PACK,
        entrega_pack=entrega3,
        observaciones='Baja causada por la asignación de Pack de alimentación a 1 residentes.',
        stock_tras_baja=98,
    )

    return entrega1, entrega2, entrega3


def crear_proveedores():
    proveedores = {}

    proveedores['limpieza'] = Proveedor.objects.create(
        nombre='Higiene Integral S.L.',
        cif='B10000001',
        correo='contacto@higieneintegral.es',
    )

    proveedores['alimentacion'] = Proveedor.objects.create(
        nombre='Alimentos del Sur S.L.',
        cif='B10000002',
        correo='pedidos@alimentossur.es',
    )

    proveedores['textil'] = Proveedor.objects.create(
        nombre='Textiles Mediterráneo S.L.',
        cif='B10000003',
        correo='ventas@textilesmediterraneo.es',
    )

    proveedores['sanitario'] = Proveedor.objects.create(
        nombre='Suministros Sanitarios Ibéricos S.L.',
        cif='B10000004',
        correo='ventas@ssi.es',
    )

    proveedores['farmacia'] = Proveedor.objects.create(
        nombre='Farmacéutica Levante S.L.',
        cif='B10000005',
        correo='contacto@farmaceuticalevante.es',
    )

    return proveedores


def crear_expedientes(proveedores):
    expediente1 = Expediente.objects.create(
        nombre='EXP-LIMPIEZA-2026',
        detalles='Contrato de suministro de productos de limpieza.',
        fecha_inicio=date(2026, 1, 1),
        fecha_final=date(2027, 1, 1),
        proveedor=proveedores['limpieza'],
        presupuesto=Decimal('12000.00'),
        presupuesto_restante=Decimal('3900.00'),
    )

    expediente2 = Expediente.objects.create(
        nombre='EXP-TEXTIL-2026',
        detalles='Contrato de suministro de productos textiles.',
        fecha_inicio=date(2026, 3, 1),
        fecha_final=date(2026, 12, 31),
        proveedor=proveedores['textil'],
        presupuesto=Decimal('9000.00'),
        presupuesto_restante=Decimal('2240.00'),
    )

    expediente3 = Expediente.objects.create(
        nombre='EXP-SANITARIO-2025',
        detalles='Contrato de suministro de material sanitario.',
        fecha_inicio=date(2025, 1, 1),
        fecha_final=date(2025, 12, 31),
        proveedor=proveedores['sanitario'],
        presupuesto=Decimal('7000.00'),
        presupuesto_restante=Decimal('0.00'),
    )

    expediente4 = Expediente.objects.create(
        nombre='EXP-FARMACIA-2027',
        detalles='Contrato de suministro de material de botiquín, pendiente de inicio.',
        fecha_inicio=date(2027, 1, 1),
        fecha_final=date(2027, 12, 31),
        proveedor=proveedores['farmacia'],
        presupuesto=Decimal('3000.00'),
        presupuesto_restante=Decimal('3000.00'),
    )

    return expediente1, expediente2, expediente3, expediente4


def crear_detalles_expedientes(
    expediente1,
    expediente2,
    expediente3,
    expediente4,
    suministros,
):
    DetalleExpediente.objects.create(
        expediente=expediente1,
        suministro=suministros['detergente'],
        precio_unidad=Decimal('8.00'),
    )

    DetalleExpediente.objects.create(
        expediente=expediente1,
        suministro=suministros['guantes'],
        precio_unidad=Decimal('2.00'),
    )

    DetalleExpediente.objects.create(
        expediente=expediente2,
        suministro=suministros['papel'],
        precio_unidad=Decimal('2.50'),
    )

    DetalleExpediente.objects.create(
        expediente=expediente2,
        suministro=suministros['toallas'],
        precio_unidad=Decimal('15.00'),
    )

    DetalleExpediente.objects.create(
        expediente=expediente3,
        suministro=suministros['mascarillas'],
        precio_unidad=Decimal('1.50'),
    )

    DetalleExpediente.objects.create(
        expediente=expediente3,
        suministro=suministros['guantes_nitrilo'],
        precio_unidad=Decimal('2.50'),
    )

    DetalleExpediente.objects.create(
        expediente=expediente4,
        suministro=suministros['termometros'],
        precio_unidad=Decimal('6.50'),
    )


def crear_pedidos(proveedores, expedientes):
    expediente1, expediente2, expediente3, expediente4 = expedientes

    pedidos = {}

    pedidos['exp1_1'] = Pedido.objects.create(
        nombre='PED-EXP1-001',
        expediente=expediente1,
        proveedor=proveedores['limpieza'],
        tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
        recibido=True,
    )

    pedidos['exp1_2'] = Pedido.objects.create(
        nombre='PED-EXP1-002',
        expediente=expediente1,
        proveedor=proveedores['limpieza'],
        tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
        recibido=True,
    )

    pedidos['exp1_3'] = Pedido.objects.create(
        nombre='PED-EXP1-003',
        expediente=expediente1,
        proveedor=proveedores['limpieza'],
        tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
        recibido=True,
    )

    pedidos['exp2_1'] = Pedido.objects.create(
        nombre='PED-EXP2-001',
        expediente=expediente2,
        proveedor=proveedores['textil'],
        tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
        recibido=True,
    )

    pedidos['exp2_2'] = Pedido.objects.create(
        nombre='PED-EXP2-002',
        expediente=expediente2,
        proveedor=proveedores['textil'],
        tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
        recibido=True,
    )

    pedidos['exp2_3'] = Pedido.objects.create(
        nombre='PED-EXP2-003',
        expediente=expediente2,
        proveedor=proveedores['textil'],
        tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
        recibido=False,
    )

    pedidos['exp3_1'] = Pedido.objects.create(
        nombre='PED-EXP3-001',
        expediente=expediente3,
        proveedor=proveedores['sanitario'],
        tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
        recibido=True,
    )

    pedidos['exp3_2'] = Pedido.objects.create(
        nombre='PED-EXP3-002',
        expediente=expediente3,
        proveedor=proveedores['sanitario'],
        tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
        recibido=True,
    )

    pedidos['general_1'] = Pedido.objects.create(
        nombre='PED-GEN-001',
        expediente=None,
        proveedor=proveedores['limpieza'],
        tipo_pedido=Pedido.TipoPedido.GENERAL,
        recibido=True,
    )

    pedidos['general_2'] = Pedido.objects.create(
        nombre='PED-GEN-002',
        expediente=None,
        proveedor=proveedores['alimentacion'],
        tipo_pedido=Pedido.TipoPedido.GENERAL,
        recibido=True,
    )

    pedidos['general_3'] = Pedido.objects.create(
        nombre='PED-GEN-003',
        expediente=None,
        proveedor=proveedores['textil'],
        tipo_pedido=Pedido.TipoPedido.GENERAL,
        recibido=False,
    )

    pedidos['general_4'] = Pedido.objects.create(
        nombre='PED-GEN-004',
        expediente=None,
        proveedor=proveedores['alimentacion'],
        tipo_pedido=Pedido.TipoPedido.GENERAL,
        recibido=False,
    )

    return pedidos


def crear_detalles_pedidos(pedidos, suministros):
    detalles = [
        (
            pedidos['exp1_1'],
            suministros['detergente'],
            500,
            Decimal('8.00'),
        ),
        (
            pedidos['exp1_1'],
            suministros['guantes'],
            500,
            Decimal('2.00'),
        ),
        (
            pedidos['exp1_2'],
            suministros['detergente'],
            250,
            Decimal('8.00'),
        ),
        (
            pedidos['exp1_2'],
            suministros['guantes'],
            500,
            Decimal('2.00'),
        ),
        (
            pedidos['exp1_3'],
            suministros['guantes'],
            50,
            Decimal('2.00'),
        ),
        (
            pedidos['exp2_1'],
            suministros['papel'],
            1000,
            Decimal('2.50'),
        ),
        (
            pedidos['exp2_1'],
            suministros['toallas'],
            100,
            Decimal('15.00'),
        ),
        (
            pedidos['exp2_2'],
            suministros['papel'],
            500,
            Decimal('2.50'),
        ),
        (
            pedidos['exp2_2'],
            suministros['toallas'],
            100,
            Decimal('12.50'),
        ),
        (
            pedidos['exp2_3'],
            suministros['toallas'],
            20,
            Decimal('13.00'),
        ),
        (
            pedidos['exp3_1'],
            suministros['mascarillas'],
            1000,
            Decimal('1.50'),
        ),
        (
            pedidos['exp3_1'],
            suministros['guantes_nitrilo'],
            1000,
            Decimal('1.00'),
        ),
        (
            pedidos['exp3_2'],
            suministros['mascarillas'],
            1000,
            Decimal('2.00'),
        ),
        (
            pedidos['exp3_2'],
            suministros['guantes_nitrilo'],
            1000,
            Decimal('2.50'),
        ),
        (
            pedidos['general_1'],
            suministros['jabon'],
            30,
            Decimal('4.00'),
        ),
        (
            pedidos['general_1'],
            suministros['pasta'],
            40,
            Decimal('2.50'),
        ),
        (
            pedidos['general_1'],
            suministros['leche'],
            100,
            Decimal('0.90'),
        ),
        (
            pedidos['general_2'],
            suministros['arroz'],
            80,
            Decimal('1.80'),
        ),
        (
            pedidos['general_2'],
            suministros['cepillo'],
            25,
            Decimal('3.20'),
        ),
        (
            pedidos['general_3'],
            suministros['mantas'],
            20,
            Decimal('35.00'),
        ),
        (
            pedidos['general_3'],
            suministros['toallas'],
            30,
            Decimal('12.00'),
        ),
        (
            pedidos['general_4'],
            suministros['leche'],
            150,
            Decimal('0.95'),
        ),
        (
            pedidos['general_4'],
            suministros['jabon'],
            100,
            Decimal('4.20'),
        ),
    ]

    for pedido, suministro, cantidad, precio in detalles:
        DetallePedido.objects.create(
            pedido=pedido,
            suministro=suministro,
            cantidad=cantidad,
            precio_unidad=precio,
        )


def crear_altas_almacen(pedidos, suministros):
    altas = [
        (
            pedidos['exp1_1'],
            suministros['detergente'],
            500,
            Decimal('8.00'),
            'Albarán EXP1-001',
            500,
        ),
        (
            pedidos['exp1_1'],
            suministros['guantes'],
            500,
            Decimal('2.00'),
            'Albarán EXP1-001',
            500,
        ),
        (
            pedidos['exp1_2'],
            suministros['detergente'],
            250,
            Decimal('8.00'),
            'Albarán EXP1-002',
            750,
        ),
        (
            pedidos['exp1_2'],
            suministros['guantes'],
            500,
            Decimal('2.00'),
            'Albarán EXP1-002',
            1000,
        ),
        (
            pedidos['exp1_3'],
            suministros['guantes'],
            40,
            Decimal('2.00'),
            'Albarán EXP1-003 (entrega parcial)',
            1040,
        ),
        (
            pedidos['exp2_1'],
            suministros['papel'],
            1000,
            Decimal('2.50'),
            'Albarán EXP2-001',
            1000,
        ),
        (
            pedidos['exp2_1'],
            suministros['toallas'],
            100,
            Decimal('15.00'),
            'Albarán EXP2-001',
            100,
        ),
        (
            pedidos['exp2_2'],
            suministros['papel'],
            500,
            Decimal('2.50'),
            'Albarán EXP2-002',
            1500,
        ),
        (
            pedidos['exp2_2'],
            suministros['toallas'],
            100,
            Decimal('12.50'),
            'Albarán EXP2-002',
            200,
        ),
        (
            pedidos['exp3_1'],
            suministros['mascarillas'],
            1000,
            Decimal('1.50'),
            'Albarán EXP3-001',
            1000,
        ),
        (
            pedidos['exp3_1'],
            suministros['guantes_nitrilo'],
            1000,
            Decimal('1.00'),
            'Albarán EXP3-001',
            1000,
        ),
        (
            pedidos['exp3_2'],
            suministros['mascarillas'],
            1000,
            Decimal('2.00'),
            'Albarán EXP3-002',
            2000,
        ),
        (
            pedidos['exp3_2'],
            suministros['guantes_nitrilo'],
            1000,
            Decimal('2.50'),
            'Albarán EXP3-002',
            2000,
        ),
        (
            pedidos['general_1'],
            suministros['jabon'],
            30,
            Decimal('4.00'),
            'Albarán GEN-001',
            30,
        ),
        (
            pedidos['general_1'],
            suministros['pasta'],
            40,
            Decimal('2.50'),
            'Albarán GEN-001',
            40,
        ),
        (
            pedidos['general_1'],
            suministros['leche'],
            100,
            Decimal('0.90'),
            'Albarán GEN-001',
            100,
        ),
        (
            pedidos['general_2'],
            suministros['arroz'],
            80,
            Decimal('1.80'),
            'Albarán GEN-002',
            80,
        ),
        (
            pedidos['general_2'],
            suministros['cepillo'],
            25,
            Decimal('3.20'),
            'Albarán GEN-002',
            25,
        ),
    ]

    for (
        pedido,
        suministro,
        cantidad,
        precio,
        observaciones,
        stock_tras_alta,
    ) in altas:
        AltaAlmacen.objects.create(
            pedido=pedido,
            suministro=suministro,
            cantidad=cantidad,
            precio_unidad=precio,
            observaciones=observaciones,
            stock_tras_alta=stock_tras_alta,
        )


def crear_bajas_servicio(suministros):

    BajaAlmacen.objects.create(
        suministro=suministros['jabon'],
        cantidad=20,
        tipo=BajaAlmacen.TipoBaja.SERVICIO,
        servicio=BajaAlmacen.Servicio.LIMPIEZA,
        observaciones='Consumo de productos para tareas de limpieza.',
        stock_tras_baja=108,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['leche'],
        cantidad=20,
        tipo=BajaAlmacen.TipoBaja.SERVICIO,
        servicio=BajaAlmacen.Servicio.COMIDA,
        observaciones='Consumo para servicio de alimentación.',
        stock_tras_baja=80,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['arroz'],
        cantidad=10,
        tipo=BajaAlmacen.TipoBaja.SERVICIO,
        servicio=BajaAlmacen.Servicio.COMIDA,
        observaciones='Consumo para servicio de alimentación.',
        stock_tras_baja=68,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['jabon'],
        cantidad=5,
        tipo=BajaAlmacen.TipoBaja.SERVICIO,
        servicio=BajaAlmacen.Servicio.OTROS,
        observaciones='Consumo extraordinario de productos de higiene.',
        stock_tras_baja=103,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['mascarillas'],
        cantidad=50,
        tipo=BajaAlmacen.TipoBaja.SERVICIO,
        servicio=BajaAlmacen.Servicio.SANITARIO,
        observaciones='Consumo de material de protección en curas rutinarias.',
        stock_tras_baja=1950,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['detergente'],
        cantidad=15,
        tipo=BajaAlmacen.TipoBaja.SERVICIO,
        servicio=BajaAlmacen.Servicio.MANTENIMIENTO,
        observaciones='Consumo en tareas de mantenimiento general.',
        stock_tras_baja=735,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['toallas'],
        cantidad=10,
        tipo=BajaAlmacen.TipoBaja.SERVICIO,
        servicio=BajaAlmacen.Servicio.LAVANDERIA,
        observaciones='Reposición del servicio de lavandería.',
        stock_tras_baja=190,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['papel'],
        cantidad=100,
        tipo=BajaAlmacen.TipoBaja.SERVICIO,
        servicio=BajaAlmacen.Servicio.ADMINISTRACION,
        observaciones='Consumo de oficina del área de administración.',
        stock_tras_baja=1400,
    )

    BajaAlmacen.objects.create(
        suministro=suministros['cepillo'],
        cantidad=3,
        tipo=BajaAlmacen.TipoBaja.SERVICIO,
        servicio=BajaAlmacen.Servicio.ATENCION_RESIDENTES,
        observaciones='Reparto directo a residentes fuera de pack.',
        stock_tras_baja=12,
    )


def crear_historial(usuarios, residentes, habitaciones, expedientes, pedidos):
    expediente1, expediente2, expediente3, expediente4 = expedientes

    entradas = [
        (
            date(2026, 6, 1),
            'Alta de residente',
            'Se ha dado de alta al residente Amina Khalil en la habitación 1 del Módulo B.',
            Rol.RESIDENTES,
            usuarios['residentes'],
        ),
        (
            date(2026, 7, 22),
            'Baja de residente',
            'Se ha dado de baja a la residente Leila Boukhris.',
            Rol.RESIDENTES,
            usuarios['residentes2'],
        ),
        (
            date(2026, 8, 20),
            'Alta de residente',
            'Se ha dado de alta a la residente Sara Mansour en la habitación 3 del Módulo A.',
            Rol.RESIDENTES,
            usuarios['residentes'],
        ),
        (
            date(2026, 8, 25),
            'Movimiento de habitación',
            'La residente Nadia Said ha sido trasladada de la habitación 2 a la habitación 1 del Módulo B.',
            Rol.RESIDENTES,
            usuarios['residentes2'],
        ),
        (
            date(2026, 7, 1),
            'Alta de residente',
            'Se ha dado de alta a la residente Kim Nguyen en la habitación 1 del Módulo C.',
            Rol.RESIDENTES,
            usuarios['residentes'],
        ),
        (
            date(2026, 6, 10),
            'Entrega de pack',
            'Se ha asignado el pack "Pack de higiene" a Ahmed Benali.',
            Rol.ALMACEN,
            usuarios['almacen'],
        ),
        (
            date(2026, 6, 12),
            'Entrega de pack',
            'Se ha asignado el pack "Pack de alimentación" a Amina Khalil.',
            Rol.ALMACEN,
            usuarios['almacen2'],
        ),
        (
            date(2026, 7, 5),
            'Alta de pack',
            'Se ha creado el pack "Pack de bienvenida".',
            Rol.ALMACEN,
            usuarios['almacen'],
        ),
        (
            date(2026, 8, 1),
            'Baja de almacén',
            'Se ha realizado una baja de almacén para el servicio Limpieza.\n\nSuministros retirados:\n20 unidades de Jabón corporal.',
            Rol.ALMACEN,
            usuarios['almacen2'],
        ),
        (
            date(2026, 8, 3),
            'Edición de suministro',
            'Se han modificado los datos del suministro Mantas.\nStock mínimo: 5 → 10.',
            Rol.ALMACEN,
            usuarios['almacen'],
        ),
        (
            date(2026, 5, 15),
            'Alta de categoría',
            'Se ha creado la categoría Farmacia.\nDescripción: Medicamentos y material de botiquín (pendiente de alta).',
            Rol.ALMACEN,
            usuarios['almacen2'],
        ),
        (
            date(2026, 8, 15),
            'Alta de suministro',
            'Se ha creado el suministro Termómetros digitales.\nUnidad: unidades.',
            Rol.ALMACEN,
            usuarios['almacen'],
        ),
        (
            date(2026, 1, 1),
            'Alta de expediente',
            'Se ha creado el expediente EXP-LIMPIEZA-2026 con el proveedor Higiene Integral S.L.',
            Rol.ADMINISTRACION,
            usuarios['administracion'],
        ),
        (
            date(2026, 3, 1),
            'Alta de expediente',
            'Se ha creado el expediente EXP-TEXTIL-2026 con el proveedor Textiles Mediterráneo S.L.',
            Rol.ADMINISTRACION,
            usuarios['administracion2'],
        ),
        (
            date(2026, 9, 1),
            'Alta de expediente',
            'Se ha creado el expediente EXP-FARMACIA-2027 con el proveedor Farmacéutica Levante S.L.',
            Rol.ADMINISTRACION,
            usuarios['administracion'],
        ),
        (
            date(2026, 8, 10),
            'Alta de pedido',
            'Se ha creado el pedido PED-EXP1-003.\n\nExpediente:\nEXP-LIMPIEZA-2026.\n\nProveedor:\nHigiene Integral S.L.\n\nSuministros solicitados:\n50 pares de Guantes desechables a 2.00 € por unidad.\n\nCoste total:\n100.00 €.',
            Rol.ADMINISTRACION,
            usuarios['administracion2'],
        ),
        (
            date(2026, 8, 18),
            'Alta de almacén',
            'Se ha registrado la recepción del pedido PED-EXP1-003.\n\nSuministros recibidos:\n40 pares de Guantes desechables.\n\nResultado esperado: Erróneo.',
            Rol.ALMACEN,
            usuarios['almacen2'],
        ),
        (
            date(2026, 9, 2),
            'Alta de pedido',
            'Se ha creado el pedido PED-EXP2-003.\n\nExpediente:\nEXP-TEXTIL-2026.\n\nProveedor:\nTextiles Mediterráneo S.L.\n\nSuministros solicitados:\n20 unidades de Toallas a 13.00 € por unidad.\n\nCoste total:\n260.00 €.',
            Rol.ADMINISTRACION,
            usuarios['administracion'],
        ),
        (
            date(2026, 6, 20),
            'Edición de proveedor',
            'Se han modificado los datos del proveedor Alimentos del Sur S.L.\nCorreo: pedidos@alimentossur.antiguo.es → pedidos@alimentossur.es.',
            Rol.ADMINISTRACION,
            usuarios['administracion2'],
        ),
        (
            date(2026, 4, 2),
            'Baja de suministro',
            'Se ha eliminado el suministro Alcohol en gel (usuario que realizó la acción ya no existe en el sistema).',
            Rol.ALMACEN,
            None,
        ),
    ]

    for fecha, tipo, descripcion, rol, usuario in entradas:
        historial = Historial.objects.create(
            tipo=tipo,
            descripcion=descripcion,
            rol=rol,
            usuario=usuario,
        )
        _fijar_fecha(historial, fecha)


def crear_notificaciones(usuarios):
    notificaciones = [
        (
            date(2026, 6, 1),
            'Ocupación de habitación al 50 %',
            'La habitación 1 del módulo B ha alcanzado el 50 % de ocupación.',
            usuarios['residentes'],
            True,
        ),
        (
            date(2026, 6, 1),
            'Ocupación de habitación al 50 %',
            'La habitación 1 del módulo B ha alcanzado el 50 % de ocupación.',
            usuarios['residentes2'],
            False,
        ),
        (
            date(2026, 6, 12),
            'Ocupación de habitación al 75 %',
            'La habitación 1 del módulo B ha alcanzado el 75 % de ocupación.',
            usuarios['residentes'],
            True,
        ),
        (
            date(2026, 5, 20),
            'Ocupación de habitación al 100 %',
            'La habitación 1 del módulo A ha alcanzado el 100 % de ocupación.',
            usuarios['residentes'],
            True,
        ),
        (
            date(2026, 5, 20),
            'Ocupación de habitación al 100 %',
            'La habitación 1 del módulo A ha alcanzado el 100 % de ocupación.',
            usuarios['residentes2'],
            True,
        ),
        (
            date(2026, 9, 5),
            'Ocupación de habitación al 90 %',
            'La habitación 2 del módulo B ha alcanzado el 90 % de ocupación.',
            usuarios['residentes2'],
            False,
        ),
        (
            date(2026, 8, 3),
            'Suministro por debajo del stock mínimo',
            'El suministro Mantas ha quedado por debajo de su stock mínimo (10 unidades).',
            usuarios['almacen'],
            False,
        ),
        (
            date(2026, 8, 3),
            'Suministro por debajo del stock mínimo',
            'El suministro Mantas ha quedado por debajo de su stock mínimo (10 unidades).',
            usuarios['almacen2'],
            True,
        ),
        (
            date(2026, 8, 3),
            'Suministro sin stock',
            'El suministro Mantas ha quedado sin stock.',
            usuarios['almacen'],
            False,
        ),
        (
            date(2026, 8, 18),
            'Diferencia entre pedido y alta de almacén',
            'La recepción del pedido "PED-EXP1-003" no coincide con las cantidades solicitadas.\n\nDiferencias:\nGuantes desechables: se solicitaron 50 pares y se han recibido 40 pares.',
            usuarios['administracion'],
            False,
        ),
        (
            date(2026, 8, 18),
            'Diferencia entre pedido y alta de almacén',
            'La recepción del pedido "PED-EXP1-003" no coincide con las cantidades solicitadas.\n\nDiferencias:\nGuantes desechables: se solicitaron 50 pares y se han recibido 40 pares.',
            usuarios['administracion2'],
            False,
        ),
        (
            date(2026, 9, 2),
            'Nuevo pedido',
            'Se ha solicitado el pedido "PED-EXP2-003" y está pendiente de recepción.',
            usuarios['administracion'],
            True,
        ),
        (
            date(2026, 7, 18),
            'Presupuesto de expediente al 50 %',
            'El presupuesto restante del expediente EXP-TEXTIL-2026 ha alcanzado el 50 %.',
            usuarios['administracion'],
            True,
        ),
        (
            date(2026, 8, 30),
            'Presupuesto de expediente al 25 %',
            'El presupuesto restante del expediente EXP-TEXTIL-2026 ha alcanzado el 25 %.',
            usuarios['administracion2'],
            False,
        ),
        (
            date(2025, 12, 20),
            'Presupuesto de expediente agotado',
            'El presupuesto del expediente EXP-SANITARIO-2025 se ha agotado.',
            usuarios['administracion'],
            True,
        ),
    ]

    for fecha, tipo, descripcion, usuario, leida in notificaciones:
        notificacion = Notificacion.objects.create(
            tipo=tipo,
            descripcion=descripcion,
            usuario=usuario,
            leida=leida,
        )
        _fijar_fecha(notificacion, fecha)


@transaction.atomic
def cargar_datos():
    limpiar_base_datos()

    crear_centro()
    usuarios = crear_usuarios()

    habitaciones = crear_modulos_y_habitaciones()
    residentes = crear_residentes(habitaciones)

    categorias = crear_categorias()
    suministros = crear_suministros(categorias)

    pack_higiene, pack_alimentacion, pack_completo = crear_packs(
        suministros
    )

    crear_entregas_y_bajas_packs(
        pack_higiene,
        pack_alimentacion,
        residentes,
        suministros,
    )

    proveedores = crear_proveedores()

    expediente1, expediente2, expediente3, expediente4 = crear_expedientes(
        proveedores
    )

    crear_detalles_expedientes(
        expediente1,
        expediente2,
        expediente3,
        expediente4,
        suministros,
    )

    pedidos = crear_pedidos(
        proveedores,
        (expediente1, expediente2, expediente3, expediente4),
    )

    crear_detalles_pedidos(
        pedidos,
        suministros,
    )

    crear_altas_almacen(
        pedidos,
        suministros,
    )

    crear_bajas_servicio(
        suministros,
    )

    crear_historial(
        usuarios,
        residentes,
        habitaciones,
        (expediente1, expediente2, expediente3, expediente4),
        pedidos,
    )

    crear_notificaciones(
        usuarios,
    )

    print('Sample data cargado correctamente.')
    print(f'Usuarios: {Usuario.objects.count()}')
    print(f'Módulos: {Modulo.objects.count()}')
    print(f'Habitaciones: {Habitacion.objects.count()}')
    print(f'Residentes: {Residente.objects.count()}')
    print(f'Categorías: {Categoria.objects.count()}')
    print(f'Suministros: {Suministro.objects.count()}')
    print(f'Packs: {Pack.objects.count()}')
    print(f'Entregas de packs: {EntregaPack.objects.count()}')
    print(f'Proveedores: {Proveedor.objects.count()}')
    print(f'Expedientes: {Expediente.objects.count()}')
    print(f'Pedidos: {Pedido.objects.count()}')
    print(f'Altas de almacén: {AltaAlmacen.objects.count()}')
    print(f'Bajas de almacén: {BajaAlmacen.objects.count()}')
    print(f'Historial: {Historial.objects.count()}')
    print(f'Notificaciones: {Notificacion.objects.count()}')


cargar_datos()