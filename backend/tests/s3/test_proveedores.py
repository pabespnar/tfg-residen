from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario, Rol
from expedientes.models import Proveedor, Expediente, Pedido


class ProveedoresTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email='administracion@test.com',
            password='Password123',
            nombre='Usuario',
            apellido='Administracion',
            dni='12345678A',
            rol=Rol.ADMINISTRACION
        )

        self.usuario_almacen = Usuario.objects.create_user(
            email='almacen@test.com',
            password='Password123',
            nombre='Usuario',
            apellido='Almacen',
            dni='87654321B',
            rol=Rol.ALMACEN
        )

        self.proveedor = Proveedor.objects.create(
            nombre='Proveedor Test',
            cif='A12345678',
            correo='proveedor@test.com'
        )

        refresh = RefreshToken.for_user(self.usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_listar_proveedores(self):
        response = self.client.get(
            reverse('lista_proveedores')
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
            response.data[0]['nombre'],
            'Proveedor Test'
        )
        self.assertEqual(
            response.data[0]['cif'],
            'A12345678'
        )
        self.assertEqual(
            response.data[0]['correo'],
            'proveedor@test.com'
        )

    def test_listar_proveedores_sin_autenticacion(self):
        self.client.credentials()

        response = self.client.get(
            reverse('lista_proveedores')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_listar_proveedores_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.get(
            reverse('lista_proveedores')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_crear_proveedor_correctamente(self):
        response = self.client.post(
            reverse('crear_proveedor'),
            {
                'nombre': 'Nuevo Proveedor',
                'cif': 'B12345678',
                'correo': 'nuevo@proveedor.com'
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )
        self.assertEqual(
            Proveedor.objects.count(),
            2
        )

        proveedor = Proveedor.objects.get(
            cif='B12345678'
        )

        self.assertEqual(
            proveedor.nombre,
            'Nuevo Proveedor'
        )
        self.assertEqual(
            proveedor.correo,
            'nuevo@proveedor.com'
        )

        self.assertEqual(
            response.data['nombre'],
            'Nuevo Proveedor'
        )
        self.assertEqual(
            response.data['cif'],
            'B12345678'
        )
        self.assertEqual(
            response.data['correo'],
            'nuevo@proveedor.com'
        )

    def test_crear_proveedor_sin_nombre(self):
        response = self.client.post(
            reverse('crear_proveedor'),
            {
                'cif': 'B12345678',
                'correo': 'nuevo@proveedor.com'
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'nombre',
            response.data
        )
        self.assertEqual(
            Proveedor.objects.count(),
            1
        )

    def test_crear_proveedor_sin_cif(self):
        response = self.client.post(
            reverse('crear_proveedor'),
            {
                'nombre': 'Nuevo Proveedor',
                'correo': 'nuevo@proveedor.com'
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'cif',
            response.data
        )
        self.assertEqual(
            Proveedor.objects.count(),
            1
        )

    def test_crear_proveedor_con_cif_duplicado(self):
        response = self.client.post(
            reverse('crear_proveedor'),
            {
                'nombre': 'Otro Proveedor',
                'cif': 'A12345678',
                'correo': 'otro@proveedor.com'
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'cif',
            response.data
        )
        self.assertEqual(
            Proveedor.objects.count(),
            1
        )

    def test_crear_proveedor_con_correo_invalido(self):
        response = self.client.post(
            reverse('crear_proveedor'),
            {
                'nombre': 'Nuevo Proveedor',
                'cif': 'B12345678',
                'correo': 'correo-invalido'
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'correo',
            response.data
        )
        self.assertEqual(
            Proveedor.objects.count(),
            1
        )

    def test_crear_proveedor_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse('crear_proveedor'),
            {
                'nombre': 'Nuevo Proveedor',
                'cif': 'B12345678',
                'correo': 'nuevo@proveedor.com'
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )
        self.assertEqual(
            Proveedor.objects.count(),
            1
        )

    def test_editar_proveedor_correctamente(self):
        response = self.client.patch(
            reverse(
                'editar_proveedor',
                kwargs={'pk': self.proveedor.id}
            ),
            {
                'nombre': 'Proveedor Modificado',
                'cif': 'C12345678',
                'correo': 'modificado@proveedor.com'
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.proveedor.refresh_from_db()

        self.assertEqual(
            self.proveedor.nombre,
            'Proveedor Modificado'
        )
        self.assertEqual(
            self.proveedor.cif,
            'C12345678'
        )
        self.assertEqual(
            self.proveedor.correo,
            'modificado@proveedor.com'
        )

        self.assertEqual(
            response.data['nombre'],
            'Proveedor Modificado'
        )
        self.assertEqual(
            response.data['cif'],
            'C12345678'
        )
        self.assertEqual(
            response.data['correo'],
            'modificado@proveedor.com'
        )

    def test_editar_proveedor_con_datos_invalidos(self):
        response = self.client.patch(
            reverse(
                'editar_proveedor',
                kwargs={'pk': self.proveedor.id}
            ),
            {
                'correo': 'correo-invalido'
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'correo',
            response.data
        )

        self.proveedor.refresh_from_db()

        self.assertEqual(
            self.proveedor.correo,
            'proveedor@test.com'
        )

    def test_editar_proveedor_inexistente(self):
        response = self.client.patch(
            reverse(
                'editar_proveedor',
                kwargs={'pk': 9999}
            ),
            {
                'nombre': 'Proveedor Modificado'
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )
        self.assertIn(
            'error',
            response.data
        )

    def test_editar_proveedor_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.patch(
            reverse(
                'editar_proveedor',
                kwargs={'pk': self.proveedor.id}
            ),
            {
                'nombre': 'Proveedor Modificado'
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        self.proveedor.refresh_from_db()

        self.assertEqual(
            self.proveedor.nombre,
            'Proveedor Test'
        )

    def test_eliminar_proveedor_correctamente(self):
        proveedor = Proveedor.objects.create(
            nombre='Proveedor Eliminar',
            cif='B12345678',
            correo='eliminar@proveedor.com'
        )

        response = self.client.delete(
            reverse(
                'eliminar_proveedor',
                kwargs={'pk': proveedor.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        self.assertIn(
            'mensaje',
            response.data
        )
        self.assertFalse(
            Proveedor.objects.filter(
                id=proveedor.id
            ).exists()
        )

    def test_eliminar_proveedor_inexistente(self):
        response = self.client.delete(
            reverse(
                'eliminar_proveedor',
                kwargs={'pk': 9999}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )
        self.assertIn(
            'error',
            response.data
        )

    def test_eliminar_proveedor_con_expediente_asociado(self):
        expediente = Expediente.objects.create(
            nombre='Expediente Test',
            detalles='Expediente de prueba',
            fecha_inicio='2026-01-01',
            fecha_final='2026-12-31',
            proveedor=self.proveedor,
            presupuesto=1000,
            presupuesto_restante=1000
        )

        response = self.client.delete(
            reverse(
                'eliminar_proveedor',
                kwargs={'pk': self.proveedor.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'error',
            response.data
        )
        self.assertTrue(
            Proveedor.objects.filter(
                id=self.proveedor.id
            ).exists()
        )
        self.assertTrue(
            Expediente.objects.filter(
                id=expediente.id
            ).exists()
        )

    def test_eliminar_proveedor_con_pedido_asociado(self):
        pedido = Pedido.objects.create(
            nombre='Pedido Test',
            expediente=None,
            proveedor=self.proveedor,
            tipo_pedido=Pedido.TipoPedido.GENERAL,
            recibido=False
        )

        response = self.client.delete(
            reverse(
                'eliminar_proveedor',
                kwargs={'pk': self.proveedor.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'error',
            response.data
        )
        self.assertTrue(
            Proveedor.objects.filter(
                id=self.proveedor.id
            ).exists()
        )
        self.assertTrue(
            Pedido.objects.filter(
                id=pedido.id
            ).exists()
        )

    def test_eliminar_proveedor_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.delete(
            reverse(
                'eliminar_proveedor',
                kwargs={'pk': self.proveedor.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )
        self.assertTrue(
            Proveedor.objects.filter(
                id=self.proveedor.id
            ).exists()
        )