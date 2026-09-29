import json

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario, Rol
from evento.models import Historial
from centro.models import Centro
from modulos.models import Modulo, Habitacion
from residentes.models import Genero
from expedientes.models import Proveedor, Expediente, DetalleExpediente
from suministros.models import Suministro


class HistorialTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email='residentes@tfg.com',
            password='Password123',
            nombre='Usuario',
            apellido='Residentes',
            dni='12345678A',
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

        self.usuario_administracion = Usuario.objects.create_user(
            email='administracion@test.com',
            password='Password123',
            nombre='Usuario',
            apellido='Administracion',
            dni='11223344C',
            rol=Rol.ADMINISTRACION
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

        self.modulo = Modulo.objects.create(
            nombre='Modulo Test',
            descripcion='Modulo de prueba',
            num_habitaciones_max=10
        )

        self.habitacion = Habitacion.objects.create(
            nombre='Habitacion Test',
            info='Habitacion de prueba',
            capacidad=4,
            f_alta=timezone.now().date(),
            modulo=self.modulo
        )

        Centro.objects.create(
            nombre='Centro Test',
            presupuesto_referencia=5000,
            presupuesto=5000,
            correo='centro@test.com'
        )

        self.autenticar(self.usuario)

    def autenticar(self, usuario):
        refresh = RefreshToken.for_user(usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_listar_historial(self):
        Historial.objects.create(
            tipo='Prueba',
            descripcion='Historial de prueba',
            rol=Rol.RESIDENTES,
            usuario=self.usuario
        )

        response = self.client.get(
            reverse('lista_historial')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        self.assertEqual(
            len(response.data),
            1
        )
        self.assertEqual(
            response.data[0]['tipo'],
            'Prueba'
        )

    def test_listar_historial_sin_autenticacion(self):
        self.client.credentials()

        response = self.client.get(
            reverse('lista_historial')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_listar_historial_filtra_por_rol(self):
        Historial.objects.create(
            tipo='Historial residentes',
            descripcion='Historial del gestor de residentes',
            rol=Rol.RESIDENTES,
            usuario=self.usuario
        )

        Historial.objects.create(
            tipo='Historial administracion',
            descripcion='Historial del gestor de administración',
            rol=Rol.ADMINISTRACION,
            usuario=self.usuario_administracion
        )

        response = self.client.get(
            reverse('lista_historial')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        self.assertEqual(
            len(response.data),
            1
        )
        self.assertEqual(
            response.data[0]['tipo'],
            'Historial residentes'
        )

    def test_historial_muestra_datos_del_usuario(self):
        Historial.objects.create(
            tipo='Prueba',
            descripcion='Historial de prueba',
            rol=Rol.RESIDENTES,
            usuario=self.usuario
        )

        response = self.client.get(
            reverse('lista_historial')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data[0]['usuario'],
            self.usuario.id
        )
        self.assertEqual(
            response.data[0]['usuario_nombre'],
            'Usuario'
        )
        self.assertEqual(
            response.data[0]['usuario_apellido'],
            'Residentes'
        )
        self.assertEqual(
            response.data[0]['usuario_email'],
            'residentes@tfg.com'
        )

    def test_crear_modulo_genera_historial(self):
        response = self.client.post(
            reverse('crear_modulo'),
            {
                'nombre': 'Modulo Nuevo',
                'descripcion': 'Nuevo módulo de prueba',
                'num_habitaciones_max': 5
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        historial = Historial.objects.filter(
            tipo='Alta de módulo',
            usuario=self.usuario
        ).first()

        self.assertIsNotNone(historial)
        self.assertIn(
            'Modulo Nuevo',
            historial.descripcion
        )

    def test_crear_habitacion_genera_historial(self):
        response = self.client.post(
            reverse(
                'crear_habitacion',
                kwargs={'pk': self.modulo.id}
            ),
            {
                'nombre': 'Habitacion Nueva',
                'info': 'Nueva habitación de prueba',
                'capacidad': 3
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        historial = Historial.objects.filter(
            tipo='Alta de habitación',
            usuario=self.usuario
        ).first()

        self.assertIsNotNone(historial)
        self.assertIn(
            'Habitacion Nueva',
            historial.descripcion
        )

    def test_crear_residente_genera_historial(self):
        response = self.client.post(
            reverse('crear_residente'),
            {
                'nombre': 'Residente',
                'apellido': 'Prueba',
                'telefono': '600000000',
                'email': 'residente@test.com',
                'f_nacimiento': '1990-01-01',
                'info': 'Residente de prueba',
                'pais': 'España',
                'dni_nie': '12345678Z',
                'activo': True,
                'habitacion': self.habitacion.id,
                'genero': Genero.MASCULINO
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        historial = Historial.objects.filter(
            tipo='Alta de residente',
            usuario=self.usuario
        ).first()

        self.assertIsNotNone(historial)
        self.assertIn(
            'Residente Prueba',
            historial.descripcion
        )

    def test_baja_residente_genera_historial(self):
        response = self.client.post(
            reverse('crear_residente'),
            {
                'nombre': 'Residente Baja',
                'apellido': 'Prueba',
                'telefono': '600000001',
                'email': 'residentebaja@test.com',
                'f_nacimiento': '1990-01-01',
                'info': 'Residente de prueba',
                'pais': 'España',
                'dni_nie': '12345679Z',
                'activo': True,
                'habitacion': self.habitacion.id,
                'genero': Genero.MASCULINO
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        residente_id = response.data['id']

        response = self.client.post(
            reverse(
                'dar_de_baja_residente',
                kwargs={'id': residente_id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        historial = Historial.objects.filter(
            tipo='Baja de residente',
            usuario=self.usuario
        ).first()

        self.assertIsNotNone(historial)
        self.assertIn(
            'Residente Baja Prueba',
            historial.descripcion
        )

    def test_crear_suministro_genera_historial(self):
        self.autenticar(self.usuario_administracion)

        response = self.client.post(
            reverse('crear_suministro'),
            {
                'nombre': 'Suministro Nuevo',
                'unidad': 'unidades'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        historial = Historial.objects.filter(
            tipo='Alta de suministro',
            usuario=self.usuario_administracion
        ).first()

        self.assertIsNotNone(historial)
        self.assertIn(
            'Suministro Nuevo',
            historial.descripcion
        )

    def test_crear_proveedor_genera_historial(self):
        self.autenticar(self.usuario_administracion)

        response = self.client.post(
            reverse('crear_proveedor'),
            {
                'nombre': 'Proveedor Nuevo',
                'cif': 'B12345678',
                'correo': 'proveedornuevo@test.com'
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        historial = Historial.objects.filter(
            tipo='Alta de proveedor',
            usuario=self.usuario_administracion
        ).first()

        self.assertIsNotNone(historial)
        self.assertIn(
            'Proveedor Nuevo',
            historial.descripcion
        )

    def test_crear_expediente_genera_historial(self):
        self.autenticar(self.usuario_administracion)

        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Expediente Nuevo',
                'detalles': 'Nuevo expediente de prueba',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '500.00',
                'suministros': json.dumps([
                    {
                        'suministro': self.suministro_2.id,
                        'precio_unidad': '10.00'
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        historial = Historial.objects.filter(
            tipo='Alta de expediente',
            usuario=self.usuario_administracion
        ).first()

        self.assertIsNotNone(historial)
        self.assertIn(
            'Expediente Nuevo',
            historial.descripcion
        )

    def test_crear_pedido_genera_historial(self):
        self.autenticar(self.usuario_administracion)

        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': self.expediente.id}
            ),
            {
                'nombre': 'Pedido Nuevo',
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

        historial = Historial.objects.filter(
            tipo='Alta de pedido',
            usuario=self.usuario_administracion
        ).first()

        self.assertIsNotNone(historial)
        self.assertIn(
            'Pedido Nuevo',
            historial.descripcion
        )