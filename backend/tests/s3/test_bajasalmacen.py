from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario, Rol
from suministros.models import Suministro, Categoria
from almacen.models import BajaAlmacen


class BajasAlmacenTests(APITestCase):

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

        refresh = RefreshToken.for_user(self.usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_listar_bajas(self):
        BajaAlmacen.objects.create(
            suministro=self.suministro,
            cantidad=5,
            servicio=BajaAlmacen.Servicio.LIMPIEZA,
            stock_tras_baja=45,
            tipo=BajaAlmacen.TipoBaja.SERVICIO,
            observaciones='Limpieza general'
        )

        response = self.client.get(
            reverse('lista_bajas')
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]['cantidad'],
            5
        )

    def test_listar_bajas_sin_autenticacion(self):
        self.client.credentials()

        response = self.client.get(
            reverse('lista_bajas')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_listar_bajas_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_admin)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.get(
            reverse('lista_bajas')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_crear_baja_servicio_correctamente(self):
        response = self.client.post(
            reverse('crear_baja_servicio'),
            {
                'suministros': [
                    {
                        'suministro': self.suministro.id,
                        'cantidad': 5
                    }
                ],
                'servicio': BajaAlmacen.Servicio.LIMPIEZA,
                'observaciones': 'Limpieza general'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )
        self.assertEqual(
            BajaAlmacen.objects.count(),
            1
        )

        baja = BajaAlmacen.objects.first()

        self.assertEqual(
            baja.suministro,
            self.suministro
        )
        self.assertEqual(
            baja.cantidad,
            5
        )
        self.assertEqual(
            baja.servicio,
            BajaAlmacen.Servicio.LIMPIEZA
        )
        self.assertEqual(
            baja.tipo,
            BajaAlmacen.TipoBaja.SERVICIO
        )
        self.assertEqual(
            baja.observaciones,
            'Limpieza general'
        )
        self.assertEqual(
            baja.stock_tras_baja,
            45
        )

        self.suministro.refresh_from_db()

        self.assertEqual(
            self.suministro.stock,
            45
        )

    def test_crear_baja_servicio_con_varios_suministros(self):
        response = self.client.post(
            reverse('crear_baja_servicio'),
            {
                'suministros': [
                    {
                        'suministro': self.suministro.id,
                        'cantidad': 5
                    },
                    {
                        'suministro': self.suministro_2.id,
                        'cantidad': 3
                    }
                ],
                'servicio': BajaAlmacen.Servicio.LIMPIEZA,
                'observaciones': 'Limpieza general'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )
        self.assertEqual(
            BajaAlmacen.objects.count(),
            2
        )

        self.suministro.refresh_from_db()
        self.suministro_2.refresh_from_db()

        self.assertEqual(
            self.suministro.stock,
            45
        )
        self.assertEqual(
            self.suministro_2.stock,
            17
        )

    def test_crear_baja_sin_suministros(self):
        response = self.client.post(
            reverse('crear_baja_servicio'),
            {
                'servicio': BajaAlmacen.Servicio.LIMPIEZA,
                'observaciones': 'Limpieza general'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'suministros',
            response.data
        )
        self.assertEqual(
            BajaAlmacen.objects.count(),
            0
        )

    def test_crear_baja_sin_servicio(self):
        response = self.client.post(
            reverse('crear_baja_servicio'),
            {
                'suministros': [
                    {
                        'suministro': self.suministro.id,
                        'cantidad': 5
                    }
                ],
                'observaciones': 'Limpieza general'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'servicio',
            response.data
        )
        self.assertEqual(
            BajaAlmacen.objects.count(),
            0
        )

    def test_crear_baja_sin_observaciones(self):
        response = self.client.post(
            reverse('crear_baja_servicio'),
            {
                'suministros': [
                    {
                        'suministro': self.suministro.id,
                        'cantidad': 5
                    }
                ],
                'servicio': BajaAlmacen.Servicio.LIMPIEZA,
                'observaciones': ''
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'observaciones',
            response.data
        )
        self.assertEqual(
            BajaAlmacen.objects.count(),
            0
        )

    def test_crear_baja_observaciones_solo_espacios(self):
        response = self.client.post(
            reverse('crear_baja_servicio'),
            {
                'suministros': [
                    {
                        'suministro': self.suministro.id,
                        'cantidad': 5
                    }
                ],
                'servicio': BajaAlmacen.Servicio.LIMPIEZA,
                'observaciones': '   '
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'observaciones',
            response.data
        )
        self.assertEqual(
            BajaAlmacen.objects.count(),
            0
        )

    def test_crear_baja_suministros_formato_invalido(self):
        response = self.client.post(
            reverse('crear_baja_servicio'),
            {
                'suministros': 'invalido',
                'servicio': BajaAlmacen.Servicio.LIMPIEZA,
                'observaciones': 'Limpieza general'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'suministros',
            response.data
        )
        self.assertEqual(
            BajaAlmacen.objects.count(),
            0
        )

    def test_crear_baja_cantidad_invalida(self):
        response = self.client.post(
            reverse('crear_baja_servicio'),
            {
                'suministros': [
                    {
                        'suministro': self.suministro.id,
                        'cantidad': 'invalida'
                    }
                ],
                'servicio': BajaAlmacen.Servicio.LIMPIEZA,
                'observaciones': 'Limpieza general'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'suministros',
            response.data
        )
        self.assertEqual(
            BajaAlmacen.objects.count(),
            0
        )

    def test_crear_baja_cantidad_cero(self):
        response = self.client.post(
            reverse('crear_baja_servicio'),
            {
                'suministros': [
                    {
                        'suministro': self.suministro.id,
                        'cantidad': 0
                    }
                ],
                'servicio': BajaAlmacen.Servicio.LIMPIEZA,
                'observaciones': 'Limpieza general'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'cantidad',
            response.data
        )
        self.assertEqual(
            BajaAlmacen.objects.count(),
            0
        )

    def test_crear_baja_cantidad_negativa(self):
        response = self.client.post(
            reverse('crear_baja_servicio'),
            {
                'suministros': [
                    {
                        'suministro': self.suministro.id,
                        'cantidad': -1
                    }
                ],
                'servicio': BajaAlmacen.Servicio.LIMPIEZA,
                'observaciones': 'Limpieza general'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'cantidad',
            response.data
        )
        self.assertEqual(
            BajaAlmacen.objects.count(),
            0
        )

    def test_crear_baja_suministro_inexistente(self):
        response = self.client.post(
            reverse('crear_baja_servicio'),
            {
                'suministros': [
                    {
                        'suministro': 9999,
                        'cantidad': 5
                    }
                ],
                'servicio': BajaAlmacen.Servicio.LIMPIEZA,
                'observaciones': 'Limpieza general'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )
        self.assertIn(
            'suministro',
            response.data
        )
        self.assertEqual(
            BajaAlmacen.objects.count(),
            0
        )

    def test_crear_baja_stock_insuficiente(self):
        self.suministro.stock = 3
        self.suministro.save()

        response = self.client.post(
            reverse('crear_baja_servicio'),
            {
                'suministros': [
                    {
                        'suministro': self.suministro.id,
                        'cantidad': 5
                    }
                ],
                'servicio': BajaAlmacen.Servicio.LIMPIEZA,
                'observaciones': 'Limpieza general'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'cantidad',
            response.data
        )
        self.assertEqual(
            BajaAlmacen.objects.count(),
            0
        )

        self.suministro.refresh_from_db()

        self.assertEqual(
            self.suministro.stock,
            3
        )

    def test_crear_baja_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_admin)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse('crear_baja_servicio'),
            {
                'suministros': [
                    {
                        'suministro': self.suministro.id,
                        'cantidad': 5
                    }
                ],
                'servicio': BajaAlmacen.Servicio.LIMPIEZA,
                'observaciones': 'Limpieza general'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )
        self.assertEqual(
            BajaAlmacen.objects.count(),
            0
        )