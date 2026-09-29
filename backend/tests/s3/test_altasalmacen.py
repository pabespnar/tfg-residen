from decimal import Decimal

from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario, Rol
from suministros.models import Suministro, Categoria
from expedientes.models import Pedido, DetallePedido, Proveedor
from almacen.models import AltaAlmacen

class AltasAlmacenTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email='almacen@test.com',
            password='Password123',
            nombre='Usuario',
            apellido='Almacen',
            dni='12345678A',
            rol=Rol.ALMACEN
        )

        self.usuario_admin = Usuario.objects.create_user(
            email='administracion@test.com',
            password='Password123',
            nombre='Usuario',
            apellido='Administracion',
            dni='87654321B',
            rol=Rol.ADMINISTRACION
        )

        self.categoria = Categoria.objects.create(
            nombre='Alimentacion',
            descripcion='Productos de alimentación'
        )

        self.suministro = Suministro.objects.create(
            nombre='Arroz',
            detalles='Arroz blanco',
            stock=50,
            unidad='kg',
            stock_minimo=10,
            categoria=self.categoria
        )

        self.suministro_2 = Suministro.objects.create(
            nombre='Jabon',
            detalles='Jabon de manos',
            stock=20,
            unidad='unidades',
            stock_minimo=5
        )

        self.proveedor = Proveedor.objects.create(
            nombre='Proveedor Test',
            cif='A12345678',
            correo='proveedor@test.com'
        )

        self.pedido = Pedido.objects.create(
            nombre='Pedido de prueba',
            expediente=None,
            proveedor=self.proveedor,
            tipo_pedido=Pedido.TipoPedido.GENERAL,
            recibido=False
        )

        self.detalle_pedido = DetallePedido.objects.create(
            pedido=self.pedido,
            suministro=self.suministro,
            cantidad=10,
            precio_unidad=Decimal('2.50')
        )

        refresh = RefreshToken.for_user(self.usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_listar_altas(self):
        AltaAlmacen.objects.create(
            pedido=self.pedido,
            suministro=self.suministro,
            cantidad=10,
            precio_unidad=self.detalle_pedido.precio_unidad,
            observaciones='Recepcion del pedido',
            stock_tras_alta=60
        )

        response = self.client.get(
            reverse('lista_altas')
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
            response.data[0]['cantidad'],
            10
        )

    def test_listar_altas_sin_autenticacion(self):
        self.client.credentials()

        response = self.client.get(
            reverse('lista_altas')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_listar_altas_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_admin)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.get(
            reverse('lista_altas')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_crear_alta_correctamente(self):
        response = self.client.post(
            reverse('crear_alta'),
            {
                'pedido': self.pedido.id,
                'detalles': '[{"suministro": %d, "cantidad": 10}]'
                % self.suministro.id
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )
        self.assertEqual(
            AltaAlmacen.objects.count(),
            1
        )

        alta = AltaAlmacen.objects.first()

        self.assertEqual(
            alta.pedido,
            self.pedido
        )
        self.assertEqual(
            alta.suministro,
            self.suministro
        )
        self.assertEqual(
            alta.cantidad,
            10
        )
        self.assertEqual(
            alta.precio_unidad,
            self.detalle_pedido.precio_unidad
        )
        self.assertEqual(
            alta.observaciones,
            'Pertenece al pedido "Pedido de prueba".'
        )
        self.assertEqual(
            alta.stock_tras_alta,
            60
        )

        self.suministro.refresh_from_db()
        self.pedido.refresh_from_db()

        self.assertEqual(
            self.suministro.stock,
            60
        )
        self.assertTrue(
            self.pedido.recibido
        )

    def test_crear_alta_con_varios_suministros(self):
        detalle_pedido_2 = DetallePedido.objects.create(
            pedido=self.pedido,
            suministro=self.suministro_2,
            cantidad=5,
            precio_unidad=Decimal('3.00')
        )

        response = self.client.post(
            reverse('crear_alta'),
            {
                'pedido': self.pedido.id,
                'detalles': (
                    '[{"suministro": %d, "cantidad": 10}, '
                    '{"suministro": %d, "cantidad": 5}]'
                    % (
                        self.suministro.id,
                        self.suministro_2.id
                    )
                )
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )
        self.assertEqual(
            AltaAlmacen.objects.count(),
            2
        )

        alta_1 = AltaAlmacen.objects.get(
            suministro=self.suministro
        )
        alta_2 = AltaAlmacen.objects.get(
            suministro=self.suministro_2
        )

        self.assertEqual(
            alta_1.cantidad,
            10
        )
        self.assertEqual(
            alta_1.precio_unidad,
            self.detalle_pedido.precio_unidad
        )
        self.assertEqual(
            alta_1.stock_tras_alta,
            60
        )

        self.assertEqual(
            alta_2.cantidad,
            5
        )
        self.assertEqual(
            alta_2.precio_unidad,
            detalle_pedido_2.precio_unidad
        )
        self.assertEqual(
            alta_2.stock_tras_alta,
            25
        )

        self.suministro.refresh_from_db()
        self.suministro_2.refresh_from_db()

        self.assertEqual(
            self.suministro.stock,
            60
        )
        self.assertEqual(
            self.suministro_2.stock,
            25
        )

        self.pedido.refresh_from_db()

        self.assertTrue(
            self.pedido.recibido
        )

    def test_crear_alta_sin_pedido(self):
        response = self.client.post(
            reverse('crear_alta'),
            {
                'detalles': '[{"suministro": %d, "cantidad": 10}]'
                % self.suministro.id
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'pedido',
            response.data
        )
        self.assertEqual(
            AltaAlmacen.objects.count(),
            0
        )

    def test_crear_alta_sin_detalles(self):
        response = self.client.post(
            reverse('crear_alta'),
            {
                'pedido': self.pedido.id
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'detalles',
            response.data
        )
        self.assertEqual(
            AltaAlmacen.objects.count(),
            0
        )

    def test_crear_alta_detalles_formato_invalido(self):
        response = self.client.post(
            reverse('crear_alta'),
            {
                'pedido': self.pedido.id,
                'detalles': 'invalido'
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'detalles',
            response.data
        )
        self.assertEqual(
            AltaAlmacen.objects.count(),
            0
        )

    def test_crear_alta_pedido_inexistente(self):
        response = self.client.post(
            reverse('crear_alta'),
            {
                'pedido': 9999,
                'detalles': '[{"suministro": %d, "cantidad": 10}]'
                % self.suministro.id
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )
        self.assertIn(
            'pedido',
            response.data
        )
        self.assertEqual(
            AltaAlmacen.objects.count(),
            0
        )

    def test_crear_alta_cantidad_invalida(self):
        response = self.client.post(
            reverse('crear_alta'),
            {
                'pedido': self.pedido.id,
                'detalles': (
                    '[{"suministro": %d, "cantidad": "invalida"}]'
                    % self.suministro.id
                )
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'detalles',
            response.data
        )
        self.assertEqual(
            AltaAlmacen.objects.count(),
            0
        )

    def test_crear_alta_cantidad_negativa(self):
        response = self.client.post(
            reverse('crear_alta'),
            {
                'pedido': self.pedido.id,
                'detalles': (
                    '[{"suministro": %d, "cantidad": -1}]'
                    % self.suministro.id
                )
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'detalles',
            response.data
        )
        self.assertEqual(
            AltaAlmacen.objects.count(),
            0
        )

    def test_crear_alta_suministro_no_pertenece_al_pedido(self):
        suministro_no_pedido = Suministro.objects.create(
            nombre='Leche',
            detalles='Leche',
            stock=10,
            unidad='litros',
            stock_minimo=2
        )

        response = self.client.post(
            reverse('crear_alta'),
            {
                'pedido': self.pedido.id,
                'detalles': (
                    '[{"suministro": %d, "cantidad": 5}]'
                    % suministro_no_pedido.id
                )
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'suministro',
            response.data
        )
        self.assertEqual(
            AltaAlmacen.objects.count(),
            0
        )

        suministro_no_pedido.refresh_from_db()

        self.assertEqual(
            suministro_no_pedido.stock,
            10
        )

    def test_crear_alta_sin_suministros_recibidos(self):
        response = self.client.post(
            reverse('crear_alta'),
            {
                'pedido': self.pedido.id,
                'detalles': (
                    '[{"suministro": %d, "cantidad": 0}]'
                    % self.suministro.id
                )
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'detalles',
            response.data
        )
        self.assertEqual(
            AltaAlmacen.objects.count(),
            0
        )

        self.suministro.refresh_from_db()

        self.assertEqual(
            self.suministro.stock,
            50
        )

    def test_crear_alta_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_admin)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse('crear_alta'),
            {
                'pedido': self.pedido.id,
                'detalles': '[{"suministro": %d, "cantidad": 10}]'
                % self.suministro.id
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )
        self.assertEqual(
            AltaAlmacen.objects.count(),
            0
        )