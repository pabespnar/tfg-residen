import json
from decimal import Decimal

from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario, Rol
from expedientes.models import Proveedor, Expediente, DetalleExpediente
from suministros.models import Suministro


class ExpedientesTests(APITestCase):

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

        refresh = RefreshToken.for_user(self.usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_listar_expedientes(self):
        Expediente.objects.create(
            nombre='Expediente Test',
            detalles='Expediente de prueba',
            fecha_inicio='2026-01-01',
            fecha_final='2026-12-31',
            proveedor=self.proveedor,
            presupuesto=1000,
            presupuesto_restante=1000
        )

        response = self.client.get(
            reverse('lista_expedientes')
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], 'Expediente Test')
        self.assertEqual(response.data[0]['detalles'], 'Expediente de prueba')
        self.assertEqual(response.data[0]['proveedor'], self.proveedor.id)
        self.assertEqual(response.data[0]['presupuesto'], '1000.00')
        self.assertEqual(response.data[0]['presupuesto_restante'], '1000.00')

    def test_listar_expedientes_sin_autenticacion(self):
        self.client.credentials()

        response = self.client.get(
            reverse('lista_expedientes')
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_listar_expedientes_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.get(
            reverse('lista_expedientes')
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_crear_expediente_correctamente(self):
        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Nuevo Expediente',
                'detalles': 'Nuevo expediente de prueba',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '1500.00',
                'suministros': json.dumps([
                    {
                        'suministro': self.suministro.id,
                        'precio_unidad': '25.50'
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Expediente.objects.count(), 1)
        self.assertEqual(DetalleExpediente.objects.count(), 1)

        expediente = Expediente.objects.get(
            nombre='Nuevo Expediente'
        )

        self.assertEqual(expediente.detalles, 'Nuevo expediente de prueba')
        self.assertEqual(expediente.proveedor, self.proveedor)
        self.assertEqual(expediente.presupuesto, Decimal('1500.00'))
        self.assertEqual(
            expediente.presupuesto_restante,
            Decimal('1500.00')
        )

        detalle = DetalleExpediente.objects.get(
            expediente=expediente
        )

        self.assertEqual(detalle.suministro, self.suministro)
        self.assertEqual(detalle.precio_unidad, Decimal('25.50'))

        self.assertEqual(
            response.data['expediente']['nombre'],
            'Nuevo Expediente'
        )
        self.assertEqual(
            len(response.data['detalles']),
            1
        )

    def test_crear_expediente_con_varios_suministros(self):
        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Expediente Suministros',
                'detalles': 'Expediente con varios suministros',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '2000.00',
                'suministros': json.dumps([
                    {
                        'suministro': self.suministro.id,
                        'precio_unidad': '25.00'
                    },
                    {
                        'suministro': self.suministro_2.id,
                        'precio_unidad': '40.00'
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Expediente.objects.count(), 1)
        self.assertEqual(DetalleExpediente.objects.count(), 2)

        expediente = Expediente.objects.get(
            nombre='Expediente Suministros'
        )

        self.assertTrue(
            DetalleExpediente.objects.filter(
                expediente=expediente,
                suministro=self.suministro,
                precio_unidad='25.00'
            ).exists()
        )

        self.assertTrue(
            DetalleExpediente.objects.filter(
                expediente=expediente,
                suministro=self.suministro_2,
                precio_unidad='40.00'
            ).exists()
        )

    def test_crear_expediente_sin_nombre(self):
        response = self.client.post(
            reverse('crear_expediente'),
            {
                'detalles': 'Expediente de prueba',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '1000.00',
                'suministros': json.dumps([
                    {
                        'suministro': self.suministro.id,
                        'precio_unidad': '25.00'
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('nombre', response.data)
        self.assertEqual(Expediente.objects.count(), 0)

    def test_crear_expediente_con_nombre_duplicado(self):
        Expediente.objects.create(
            nombre='Expediente Test',
            detalles='Expediente existente',
            fecha_inicio='2026-01-01',
            fecha_final='2026-12-31',
            proveedor=self.proveedor,
            presupuesto=1000,
            presupuesto_restante=1000
        )

        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Expediente Test',
                'detalles': 'Otro expediente',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '1500.00',
                'suministros': json.dumps([
                    {
                        'suministro': self.suministro.id,
                        'precio_unidad': '25.00'
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('nombre', response.data)
        self.assertEqual(Expediente.objects.count(), 1)

    def test_crear_expediente_sin_detalles(self):
        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Nuevo Expediente',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '1000.00',
                'suministros': json.dumps([
                    {
                        'suministro': self.suministro.id,
                        'precio_unidad': '25.00'
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detalles', response.data)
        self.assertEqual(Expediente.objects.count(), 0)

    def test_crear_expediente_con_fecha_final_anterior(self):
        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Nuevo Expediente',
                'detalles': 'Expediente de prueba',
                'fecha_inicio': '2026-12-31',
                'fecha_final': '2026-01-01',
                'proveedor': self.proveedor.id,
                'presupuesto': '1000.00',
                'suministros': json.dumps([
                    {
                        'suministro': self.suministro.id,
                        'precio_unidad': '25.00'
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('fecha_final', response.data)
        self.assertEqual(Expediente.objects.count(), 0)

    def test_crear_expediente_con_presupuesto_negativo(self):
        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Nuevo Expediente',
                'detalles': 'Expediente de prueba',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '-100.00',
                'suministros': json.dumps([
                    {
                        'suministro': self.suministro.id,
                        'precio_unidad': '25.00'
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('presupuesto', response.data)
        self.assertEqual(Expediente.objects.count(), 0)

    def test_crear_expediente_sin_suministros(self):
        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Expediente sin suministros',
                'detalles': 'Expediente sin suministros',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '1000.00',
                'suministros': json.dumps([])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Expediente.objects.count(), 0)
        self.assertEqual(DetalleExpediente.objects.count(), 0)

    def test_crear_expediente_con_suministro_duplicado(self):
        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Nuevo Expediente',
                'detalles': 'Expediente de prueba',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '1000.00',
                'suministros': json.dumps([
                    {
                        'suministro': self.suministro.id,
                        'precio_unidad': '25.00'
                    },
                    {
                        'suministro': self.suministro.id,
                        'precio_unidad': '30.00'
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Expediente.objects.count(), 0)
        self.assertEqual(DetalleExpediente.objects.count(), 0)

    def test_crear_expediente_con_suministro_inexistente(self):
        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Nuevo Expediente',
                'detalles': 'Expediente de prueba',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '1000.00',
                'suministros': json.dumps([
                    {
                        'suministro': 9999,
                        'precio_unidad': '25.00'
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Expediente.objects.count(), 0)
        self.assertEqual(DetalleExpediente.objects.count(), 0)

    def test_crear_expediente_con_suministro_sin_precio(self):
        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Nuevo Expediente',
                'detalles': 'Expediente de prueba',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '1000.00',
                'suministros': json.dumps([
                    {
                        'suministro': self.suministro.id
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Expediente.objects.count(), 0)
        self.assertEqual(DetalleExpediente.objects.count(), 0)

    def test_crear_expediente_con_precio_negativo(self):
        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Nuevo Expediente',
                'detalles': 'Expediente de prueba',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '1000.00',
                'suministros': json.dumps([
                    {
                        'suministro': self.suministro.id,
                        'precio_unidad': '-25.00'
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Expediente.objects.count(), 0)
        self.assertEqual(DetalleExpediente.objects.count(), 0)

    def test_crear_expediente_con_suministro_en_expediente_activo(self):
        Expediente.objects.create(
            nombre='Expediente Activo',
            detalles='Expediente activo',
            fecha_inicio='2026-01-01',
            fecha_final='2026-12-31',
            proveedor=self.proveedor,
            presupuesto=1000,
            presupuesto_restante=1000
        )

        expediente_activo = Expediente.objects.get(
            nombre='Expediente Activo'
        )

        DetalleExpediente.objects.create(
            expediente=expediente_activo,
            suministro=self.suministro,
            precio_unidad='20.00'
        )

        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Nuevo Expediente',
                'detalles': 'Segundo expediente',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '1000.00',
                'suministros': json.dumps([
                    {
                        'suministro': self.suministro.id,
                        'precio_unidad': '25.00'
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Expediente.objects.count(), 1)
        self.assertEqual(DetalleExpediente.objects.count(), 1)

    def test_crear_expediente_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse('crear_expediente'),
            {
                'nombre': 'Nuevo Expediente',
                'detalles': 'Expediente de prueba',
                'fecha_inicio': '2026-01-01',
                'fecha_final': '2026-12-31',
                'proveedor': self.proveedor.id,
                'presupuesto': '1000.00',
                'suministros': json.dumps([
                    {
                        'suministro': self.suministro.id,
                        'precio_unidad': '25.00'
                    }
                ])
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Expediente.objects.count(), 0)

    def test_ver_expediente_correctamente(self):
        expediente = Expediente.objects.create(
            nombre='Expediente Test',
            detalles='Expediente de prueba',
            fecha_inicio='2026-01-01',
            fecha_final='2026-12-31',
            proveedor=self.proveedor,
            presupuesto=1000,
            presupuesto_restante=1000
        )

        DetalleExpediente.objects.create(
            expediente=expediente,
            suministro=self.suministro,
            precio_unidad='25.00'
        )

        response = self.client.get(
            reverse(
                'detalle_expediente',
                kwargs={'pk': expediente.id}
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data['expediente']['nombre'],
            'Expediente Test'
        )
        self.assertEqual(
            response.data['expediente']['proveedor'],
            self.proveedor.id
        )
        self.assertEqual(
            len(response.data['detalles']),
            1
        )
        self.assertEqual(
            response.data['detalles'][0]['suministro'],
            self.suministro.id
        )
        self.assertEqual(
            response.data['detalles'][0]['precio_unidad'],
            '25.00'
        )
        self.assertEqual(
            response.data['pedidos'],
            []
        )

    def test_ver_expediente_inexistente(self):
        response = self.client.get(
            reverse(
                'detalle_expediente',
                kwargs={'pk': 9999}
            )
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

    def test_ver_expediente_sin_permiso(self):
        expediente = Expediente.objects.create(
            nombre='Expediente Test',
            detalles='Expediente de prueba',
            fecha_inicio='2026-01-01',
            fecha_final='2026-12-31',
            proveedor=self.proveedor,
            presupuesto=1000,
            presupuesto_restante=1000
        )

        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.get(
            reverse(
                'detalle_expediente',
                kwargs={'pk': expediente.id}
            )
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ver_expediente_sin_autenticacion(self):
        expediente = Expediente.objects.create(
            nombre='Expediente Test',
            detalles='Expediente de prueba',
            fecha_inicio='2026-01-01',
            fecha_final='2026-12-31',
            proveedor=self.proveedor,
            presupuesto=1000,
            presupuesto_restante=1000
        )

        self.client.credentials()

        response = self.client.get(
            reverse(
                'detalle_expediente',
                kwargs={'pk': expediente.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )