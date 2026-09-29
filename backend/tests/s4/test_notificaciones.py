from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario, Rol
from residentes.models import Residente, Genero
from modulos.models import Modulo, Habitacion
from expedientes.models import (
    Proveedor,
    Expediente,
    DetalleExpediente
)
from suministros.models import (
    Suministro,
    Pack,
    ContenidoPack
)
from centro.models import Centro
from evento.models import Notificacion


class NotificacionesTests(APITestCase):

    def setUp(self):
        self.usuario_residentes = Usuario.objects.create_user(
            email='residentes@tfg.com',
            password='Password123',
            nombre='Usuario',
            apellido='Residentes',
            dni='12345678A',
            rol=Rol.RESIDENTES
        )

        self.usuario_residentes_2 = Usuario.objects.create_user(
            email='residentes2@tfg.com',
            password='Password123',
            nombre='Segundo',
            apellido='Residentes',
            dni='22334455D',
            rol=Rol.RESIDENTES
        )

        self.usuario_almacen = Usuario.objects.create_user(
            email='almacen@test.com',
            password='Password123',
            nombre='Usuario',
            apellido='Almacen',
            dni='87654321B',
            rol=Rol.ALMACEN
        )

        self.usuario_almacen_2 = Usuario.objects.create_user(
            email='almacen2@test.com',
            password='Password123',
            nombre='Segundo',
            apellido='Almacen',
            dni='33445566E',
            rol=Rol.ALMACEN
        )

        self.usuario_administracion = Usuario.objects.create_user(
            email='administracion@test.com',
            password='Password123',
            nombre='Usuario',
            apellido='Administracion',
            dni='11223344C',
            rol=Rol.ADMINISTRACION
        )

        self.usuario_administracion_2 = Usuario.objects.create_user(
            email='administracion2@test.com',
            password='Password123',
            nombre='Segundo',
            apellido='Administracion',
            dni='44556677F',
            rol=Rol.ADMINISTRACION
        )

        self.modulo = Modulo.objects.create(
            nombre='Modulo 1',
            descripcion='Descripcion del modulo',
            num_habitaciones_max=5
        )

        self.habitacion = Habitacion.objects.create(
            nombre='Habitacion 1',
            info='Informacion de la habitacion',
            capacidad=4,
            f_alta='2026-09-10',
            modulo=self.modulo
        )

        self.genero = Genero.MASCULINO

        self.residente = Residente.objects.create(
            nombre='Juan',
            apellido='Perez',
            telefono='600123456',
            email='juan@test.com',
            f_nacimiento='1990-01-01',
            f_alta='2026-09-10',
            pais='España',
            dni_nie='12345678X',
            activo=True,
            habitacion=self.habitacion,
            genero=self.genero
        )

        self.proveedor = Proveedor.objects.create(
            nombre='Proveedor Test',
            cif='A12345678',
            correo='proveedor@test.com'
        )

        self.suministro = Suministro.objects.create(
            nombre='Suministro Test',
            detalles='Suministro de prueba',
            stock=10,
            unidad='unidades',
            stock_minimo=2
        )

        self.suministro_2 = Suministro.objects.create(
            nombre='Suministro Test 2',
            detalles='Segundo suministro de prueba',
            stock=20,
            unidad='unidades',
            stock_minimo=5
        )

        self.expediente = Expediente.objects.create(
            nombre='Expediente Test',
            detalles='Expediente de prueba',
            fecha_inicio='2026-01-01',
            fecha_final='2026-12-31',
            proveedor=self.proveedor,
            presupuesto=1000,
            presupuesto_restante=1000
        )

        DetalleExpediente.objects.create(
            expediente=self.expediente,
            suministro=self.suministro,
            precio_unidad='25.00'
        )

        Centro.objects.create(
            nombre='Centro Test',
            presupuesto_referencia=5000,
            presupuesto=5000,
            correo='centro@test.com'
        )

        self.pack = Pack.objects.create(
            nombre='Pack Higiene',
            descripcion='Pack de higiene personal'
        )

        self.contenido = ContenidoPack.objects.create(
            pack=self.pack,
            suministro=self.suministro,
            cantidad=2
        )

        refresh = RefreshToken.for_user(
            self.usuario_residentes
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_crear_residente_genera_notificacion_ocupacion_50(self):
        url = reverse('crear_residente')

        data = {
            'nombre': 'Maria',
            'apellido': 'Gomez',
            'f_nacimiento': '1995-05-10',
            'pais': 'España',
            'dni_nie': '87654321Y',
            'activo': True,
            'habitacion': self.habitacion.id,
            'genero': self.genero
        }

        response = self.client.post(
            url,
            data,
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Ocupación de habitación al 50 %'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_residentes
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_residentes_2
            ).exists()
        )

        for notificacion in notificaciones:
            self.assertEqual(
                notificacion.descripcion,
                'La habitación Habitacion 1 del módulo '
                'Modulo 1 ha alcanzado el 50 % de ocupación.'
            )

    def test_crear_residente_genera_notificacion_ocupacion_75(self):
        Residente.objects.create(
            nombre='Pedro',
            apellido='Lopez',
            f_nacimiento='1992-03-15',
            f_alta='2026-09-10',
            pais='España',
            dni_nie='22222222A',
            activo=True,
            habitacion=self.habitacion,
            genero=self.genero
        )

        url = reverse('crear_residente')

        data = {
            'nombre': 'Maria',
            'apellido': 'Gomez',
            'f_nacimiento': '1995-05-10',
            'pais': 'España',
            'dni_nie': '87654321Y',
            'activo': True,
            'habitacion': self.habitacion.id,
            'genero': self.genero
        }

        response = self.client.post(
            url,
            data,
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Ocupación de habitación al 75 %'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_residentes
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_residentes_2
            ).exists()
        )

    def test_crear_residente_genera_notificacion_ocupacion_90(self):
        Residente.objects.create(
            nombre='Pedro',
            apellido='Lopez',
            f_nacimiento='1992-03-15',
            f_alta='2026-09-10',
            pais='España',
            dni_nie='22222222A',
            activo=True,
            habitacion=self.habitacion,
            genero=self.genero
        )

        Residente.objects.create(
            nombre='Ana',
            apellido='Garcia',
            f_nacimiento='1993-06-20',
            f_alta='2026-09-10',
            pais='España',
            dni_nie='33333333B',
            activo=True,
            habitacion=self.habitacion,
            genero=self.genero
        )

        url = reverse('crear_residente')

        data = {
            'nombre': 'Maria',
            'apellido': 'Gomez',
            'f_nacimiento': '1995-05-10',
            'pais': 'España',
            'dni_nie': '87654321Y',
            'activo': True,
            'habitacion': self.habitacion.id,
            'genero': self.genero
        }

        response = self.client.post(
            url,
            data,
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Ocupación de habitación al 90 %'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_residentes
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_residentes_2
            ).exists()
        )

    def test_editar_residente_genera_notificacion_ocupacion(self):
        habitacion_2 = Habitacion.objects.create(
            nombre='Habitacion 2',
            info='Otra habitacion',
            capacidad=2,
            f_alta='2026-09-10',
            modulo=self.modulo
        )

        url = reverse(
            'editar_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.patch(
            url,
            {
                'habitacion': habitacion_2.id
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Ocupación de habitación al 50 %'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_residentes
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_residentes_2
            ).exists()
        )

    def test_dar_de_alta_residente_genera_notificaciones_ocupacion(self):
        habitacion_2 = Habitacion.objects.create(
            nombre='Habitacion 2',
            info='Otra habitacion',
            capacidad=1,
            f_alta='2026-09-10',
            modulo=self.modulo
        )

        self.residente.activo = False
        self.residente.habitacion = None
        self.residente.f_baja = '2026-09-10'
        self.residente.save()

        url = reverse(
            'dar_de_alta_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.post(
            url,
            {
                'habitacion': habitacion_2.id
            }
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        notificaciones = Notificacion.objects.all()

        self.assertEqual(
            notificaciones.count(),
            6
        )

        self.assertEqual(
            notificaciones.filter(
                tipo='Ocupación de habitación al 50 %'
            ).count(),
            2
        )

        self.assertEqual(
            notificaciones.filter(
                tipo='Ocupación de habitación al 75 %'
            ).count(),
            2
        )

        self.assertEqual(
            notificaciones.filter(
                tipo='Ocupación de habitación al 90 %'
            ).count(),
            2
        )

    def test_crear_pedido_expediente_genera_notificacion_nuevo_pedido(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': self.expediente.id}
            ),
            {
                'nombre': 'Nuevo Pedido Expediente',
                'cantidades': {
                    str(self.suministro.id): 1
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Nuevo pedido'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_almacen
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_almacen_2
            ).exists()
        )

        for notificacion in notificaciones:
            self.assertEqual(
                notificacion.descripcion,
                'Se ha solicitado el pedido '
                '"Nuevo Pedido Expediente" y está pendiente de recepción.'
            )

    def test_crear_pedido_expediente_genera_notificacion_presupuesto_50(self):
        self.expediente.presupuesto_restante = Decimal('600.00')
        self.expediente.save(
            update_fields=['presupuesto_restante']
        )

        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': self.expediente.id}
            ),
            {
                'nombre': 'Pedido 50',
                'cantidades': {
                    str(self.suministro.id): 4
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Presupuesto de expediente al 50 %'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_administracion
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_administracion_2
            ).exists()
        )

    def test_crear_pedido_expediente_genera_notificacion_presupuesto_25(self):
        self.expediente.presupuesto_restante = Decimal('300.00')
        self.expediente.save(
            update_fields=['presupuesto_restante']
        )

        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': self.expediente.id}
            ),
            {
                'nombre': 'Pedido 25',
                'cantidades': {
                    str(self.suministro.id): 2
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Presupuesto de expediente al 25 %'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_administracion
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_administracion_2
            ).exists()
        )

    def test_crear_pedido_expediente_genera_notificacion_presupuesto_agotado(self):
        self.expediente.presupuesto_restante = Decimal('100.00')
        self.expediente.save(
            update_fields=['presupuesto_restante']
        )

        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': self.expediente.id}
            ),
            {
                'nombre': 'Pedido Agotado',
                'cantidades': {
                    str(self.suministro.id): 4
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Presupuesto de expediente agotado'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_administracion
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_administracion_2
            ).exists()
        )

    def test_crear_pedido_general_genera_notificacion_nuevo_pedido(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse('crear_pedido_general'),
            {
                'nombre': 'Nuevo Pedido General',
                'proveedor': self.proveedor.id,
                'suministros': {
                    str(self.suministro_2.id): {
                        'cantidad': 5,
                        'precio_unidad': '40.00'
                    }
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Nuevo pedido'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_almacen
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_almacen_2
            ).exists()
        )

    def test_crear_pedido_general_genera_notificacion_presupuesto_50(self):
        centro = Centro.get_solo()
        centro.presupuesto = Decimal('3000.00')
        centro.save(
            update_fields=['presupuesto']
        )

        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse('crear_pedido_general'),
            {
                'nombre': 'Pedido General 50',
                'proveedor': self.proveedor.id,
                'suministros': {
                    str(self.suministro_2.id): {
                        'cantidad': 5,
                        'precio_unidad': '100.00'
                    }
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Presupuesto general al 50 %'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_administracion
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_administracion_2
            ).exists()
        )

    def test_crear_pedido_general_genera_notificacion_presupuesto_25(self):
        centro = Centro.get_solo()
        centro.presupuesto = Decimal('1500.00')
        centro.save(
            update_fields=['presupuesto']
        )

        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse('crear_pedido_general'),
            {
                'nombre': 'Pedido General 25',
                'proveedor': self.proveedor.id,
                'suministros': {
                    str(self.suministro_2.id): {
                        'cantidad': 5,
                        'precio_unidad': '50.00'
                    }
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Presupuesto general al 25 %'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_administracion
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_administracion_2
            ).exists()
        )

    def test_crear_pedido_general_genera_notificacion_presupuesto_agotado(self):
        centro = Centro.get_solo()
        centro.presupuesto = Decimal('500.00')
        centro.save(
            update_fields=['presupuesto']
        )

        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse('crear_pedido_general'),
            {
                'nombre': 'Pedido General Agotado',
                'proveedor': self.proveedor.id,
                'suministros': {
                    str(self.suministro_2.id): {
                        'cantidad': 10,
                        'precio_unidad': '50.00'
                    }
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Presupuesto general agotado'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_administracion
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_administracion_2
            ).exists()
        )

    def test_entregar_pack_genera_notificacion_sin_stock(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        self.suministro.stock = 2
        self.suministro.save(
            update_fields=['stock']
        )

        response = self.client.post(
            reverse(
                'crear_entrega_pack',
                kwargs={'id': self.pack.id}
            ),
            {
                'residentes': [self.residente.id]
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Suministro sin stock'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_almacen
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_almacen_2
            ).exists()
        )

        for notificacion in notificaciones:
            self.assertEqual(
                notificacion.descripcion,
                'El suministro Suministro Test ha quedado sin stock.'
            )

    def test_entregar_pack_genera_notificacion_por_debajo_stock_minimo(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        self.suministro.stock = 3
        self.suministro.save(
            update_fields=['stock']
        )

        response = self.client.post(
            reverse(
                'crear_entrega_pack',
                kwargs={'id': self.pack.id}
            ),
            {
                'residentes': [self.residente.id]
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Suministro por debajo del stock mínimo'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_almacen
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_almacen_2
            ).exists()
        )

        for notificacion in notificaciones:
            self.assertEqual(
                notificacion.descripcion,
                'El suministro Suministro Test ha quedado por debajo '
                'de su stock mínimo (2 unidades).'
            )

    def test_entregar_pack_genera_notificacion_asignacion_pack(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse(
                'crear_entrega_pack',
                kwargs={'id': self.pack.id}
            ),
            {
                'residentes': [self.residente.id]
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        notificaciones = Notificacion.objects.filter(
            tipo='Asignación de pack'
        )

        self.assertEqual(
            notificaciones.count(),
            2
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_residentes
            ).exists()
        )

        self.assertTrue(
            notificaciones.filter(
                usuario=self.usuario_residentes_2
            ).exists()
        )

        for notificacion in notificaciones:
            self.assertEqual(
                notificacion.descripcion,
                'Se ha asignado el pack "Pack Higiene" a 1 residente.'
            )