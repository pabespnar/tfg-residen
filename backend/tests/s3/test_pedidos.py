import json
from decimal import Decimal

from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario, Rol
from centro.models import Centro
from expedientes.models import (
    Proveedor,
    Expediente,
    DetalleExpediente,
    Pedido,
    DetallePedido
)
from suministros.models import Suministro


class PedidosTests(APITestCase):

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

        refresh = RefreshToken.for_user(self.usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_listar_pedidos(self):
        pedido = Pedido.objects.create(
            nombre='Pedido Test',
            expediente=self.expediente,
            proveedor=self.proveedor,
            tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
            recibido=False
        )

        DetallePedido.objects.create(
            pedido=pedido,
            suministro=self.suministro,
            cantidad=5,
            precio_unidad='25.00'
        )

        response = self.client.get(
            reverse('lista_pedidos')
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], 'Pedido Test')
        self.assertEqual(
            response.data[0]['tipo_pedido'],
            Pedido.TipoPedido.EXPEDIENTE
        )
        self.assertEqual(
            response.data[0]['expediente'],
            self.expediente.id
        )
        self.assertEqual(
            response.data[0]['proveedor'],
            self.proveedor.id
        )
        self.assertFalse(response.data[0]['recibido'])

    def test_listar_pedidos_sin_autenticacion(self):
        self.client.credentials()

        response = self.client.get(
            reverse('lista_pedidos')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_listar_pedidos_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.get(
            reverse('lista_pedidos')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_listar_pedidos_recibidos(self):
        pedido_no_recibido = Pedido.objects.create(
            nombre='Pedido No Recibido',
            expediente=self.expediente,
            proveedor=self.proveedor,
            tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
            recibido=False
        )

        Pedido.objects.create(
            nombre='Pedido Recibido',
            expediente=self.expediente,
            proveedor=self.proveedor,
            tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
            recibido=True
        )

        response = self.client.get(
            reverse('lista_pedidos_recibidos')
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]['id'],
            pedido_no_recibido.id
        )
        self.assertFalse(response.data[0]['recibido'])

    def test_listar_pedidos_recibidos_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.get(
            reverse('lista_pedidos_recibidos')
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.get(
            reverse('lista_pedidos_recibidos')
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_listar_detalles_pedido(self):
        pedido = Pedido.objects.create(
            nombre='Pedido Test',
            expediente=self.expediente,
            proveedor=self.proveedor,
            tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
            recibido=False
        )

        detalle = DetallePedido.objects.create(
            pedido=pedido,
            suministro=self.suministro,
            cantidad=5,
            precio_unidad='25.00'
        )

        response = self.client.get(
            reverse(
                'lista_detalles_pedido',
                kwargs={'pedido_id': pedido.id}
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], detalle.id)
        self.assertEqual(
            response.data[0]['suministro'],
            self.suministro.id
        )
        self.assertEqual(response.data[0]['cantidad'], 5)
        self.assertEqual(
            response.data[0]['precio_unidad'],
            '25.00'
        )

    def test_listar_detalles_pedido_sin_permiso(self):
        pedido = Pedido.objects.create(
            nombre='Pedido Test',
            expediente=self.expediente,
            proveedor=self.proveedor,
            tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
            recibido=False
        )

        refresh = RefreshToken.for_user(self.usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.get(
            reverse(
                'lista_detalles_pedido',
                kwargs={'pedido_id': pedido.id}
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.get(
            reverse(
                'lista_detalles_pedido',
                kwargs={'pedido_id': pedido.id}
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_ver_pedido_correctamente(self):
        pedido = Pedido.objects.create(
            nombre='Pedido Test',
            expediente=self.expediente,
            proveedor=self.proveedor,
            tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
            recibido=False
        )

        DetallePedido.objects.create(
            pedido=pedido,
            suministro=self.suministro,
            cantidad=5,
            precio_unidad='25.00'
        )

        response = self.client.get(
            reverse(
                'detalle_pedido',
                kwargs={'pk': pedido.id}
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data['pedido']['nombre'],
            'Pedido Test'
        )
        self.assertEqual(
            response.data['pedido']['tipo_pedido'],
            Pedido.TipoPedido.EXPEDIENTE
        )
        self.assertEqual(
            response.data['pedido']['expediente'],
            self.expediente.id
        )
        self.assertEqual(
            response.data['pedido']['proveedor'],
            self.proveedor.id
        )
        self.assertFalse(response.data['pedido']['recibido'])
        self.assertIsNone(response.data['pedido']['correcto'])

    def test_ver_pedido_recibido_correcto(self):
        pedido = Pedido.objects.create(
            nombre='Pedido Recibido',
            expediente=self.expediente,
            proveedor=self.proveedor,
            tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
            recibido=True
        )

        detalle = DetallePedido.objects.create(
            pedido=pedido,
            suministro=self.suministro,
            cantidad=5,
            precio_unidad='25.00'
        )

        from almacen.models import AltaAlmacen

        AltaAlmacen.objects.create(
            pedido=pedido,
            suministro=self.suministro,
            cantidad=5,
            precio_unidad='25.00',
            stock_tras_alta=15
        )

        response = self.client.get(
            reverse(
                'detalle_pedido',
                kwargs={'pk': pedido.id}
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['pedido']['recibido'])
        self.assertTrue(response.data['pedido']['correcto'])
        self.assertEqual(len(response.data['detalles']), 1)
        self.assertEqual(
            response.data['detalles'][0]['id'],
            detalle.id
        )

    def test_ver_pedido_recibido_con_diferencia(self):
        pedido = Pedido.objects.create(
            nombre='Pedido Recibido',
            expediente=self.expediente,
            proveedor=self.proveedor,
            tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
            recibido=True
        )

        detalle = DetallePedido.objects.create(
            pedido=pedido,
            suministro=self.suministro,
            cantidad=5,
            precio_unidad='25.00'
        )

        from almacen.models import AltaAlmacen

        AltaAlmacen.objects.create(
            pedido=pedido,
            suministro=self.suministro,
            cantidad=3,
            precio_unidad='25.00',
            stock_tras_alta=13
        )

        response = self.client.get(
            reverse(
                'detalle_pedido',
                kwargs={'pk': pedido.id}
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['pedido']['recibido'])
        self.assertFalse(response.data['pedido']['correcto'])
        self.assertEqual(len(response.data['detalles']), 1)
        self.assertEqual(
            response.data['detalles'][0]['cantidad_recibida'],
            3
        )
        self.assertEqual(
            response.data['detalles'][0]['diferencia'],
            -2
        )

    def test_ver_pedido_inexistente(self):
        response = self.client.get(
            reverse(
                'detalle_pedido',
                kwargs={'pk': 9999}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    def test_ver_pedido_sin_permiso(self):
        pedido = Pedido.objects.create(
            nombre='Pedido Test',
            expediente=self.expediente,
            proveedor=self.proveedor,
            tipo_pedido=Pedido.TipoPedido.EXPEDIENTE,
            recibido=False
        )

        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.get(
            reverse(
                'detalle_pedido',
                kwargs={'pk': pedido.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_crear_pedido_expediente_correctamente(self):
        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': self.expediente.id}
            ),
            {
                'nombre': 'Nuevo Pedido Expediente',
                'cantidades': {
                    str(self.suministro.id): 10
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )
        self.assertEqual(Pedido.objects.count(), 1)
        self.assertEqual(DetallePedido.objects.count(), 1)

        pedido = Pedido.objects.get(
            nombre='Nuevo Pedido Expediente'
        )

        self.assertEqual(
            pedido.expediente,
            self.expediente
        )
        self.assertEqual(
            pedido.proveedor,
            self.proveedor
        )
        self.assertEqual(
            pedido.tipo_pedido,
            Pedido.TipoPedido.EXPEDIENTE
        )
        self.assertFalse(pedido.recibido)

        detalle = DetallePedido.objects.get(
            pedido=pedido
        )

        self.assertEqual(
            detalle.suministro,
            self.suministro
        )
        self.assertEqual(detalle.cantidad, 10)
        self.assertEqual(
            detalle.precio_unidad,
            Decimal('25.00')
        )

        self.expediente.refresh_from_db()

        self.assertEqual(
            self.expediente.presupuesto_restante,
            Decimal('750.00')
        )

    def test_crear_pedido_expediente_sin_nombre(self):
        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': self.expediente.id}
            ),
            {
                'cantidades': {
                    str(self.suministro.id): 5
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_expediente_sin_cantidades(self):
        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': self.expediente.id}
            ),
            {
                'nombre': 'Nuevo Pedido'
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_expediente_con_cantidad_negativa(self):
        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': self.expediente.id}
            ),
            {
                'nombre': 'Nuevo Pedido',
                'cantidades': {
                    str(self.suministro.id): -1
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_expediente_con_suministro_no_asociado(self):
        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': self.expediente.id}
            ),
            {
                'nombre': 'Nuevo Pedido',
                'cantidades': {
                    str(self.suministro_2.id): 5
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_expediente_supera_presupuesto(self):
        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': self.expediente.id}
            ),
            {
                'nombre': 'Pedido Excesivo',
                'cantidades': {
                    str(self.suministro.id): 41
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

        self.expediente.refresh_from_db()

        self.assertEqual(
            self.expediente.presupuesto_restante,
            Decimal('1000.00')
        )

    def test_crear_pedido_expediente_con_cantidad_cero(self):
        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': self.expediente.id}
            ),
            {
                'nombre': 'Pedido Cero',
                'cantidades': {
                    str(self.suministro.id): 0
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_expediente_inexistente(self):
        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': 9999}
            ),
            {
                'nombre': 'Nuevo Pedido',
                'cantidades': {
                    str(self.suministro.id): 5
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_expediente_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse(
                'crear_pedido_expediente',
                kwargs={'pk': self.expediente.id}
            ),
            {
                'nombre': 'Nuevo Pedido',
                'cantidades': {
                    str(self.suministro.id): 5
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_general_correctamente(self):
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
        self.assertEqual(Pedido.objects.count(), 1)
        self.assertEqual(DetallePedido.objects.count(), 1)

        pedido = Pedido.objects.get(
            nombre='Nuevo Pedido General'
        )

        self.assertEqual(
            pedido.tipo_pedido,
            Pedido.TipoPedido.GENERAL
        )
        self.assertIsNone(pedido.expediente)
        self.assertEqual(
            pedido.proveedor,
            self.proveedor
        )
        self.assertFalse(pedido.recibido)

        detalle = DetallePedido.objects.get(
            pedido=pedido
        )

        self.assertEqual(
            detalle.suministro,
            self.suministro_2
        )
        self.assertEqual(detalle.cantidad, 5)
        self.assertEqual(
            detalle.precio_unidad,
            Decimal('40.00')
        )

        centro = Centro.get_solo()

        self.assertEqual(
            centro.presupuesto,
            Decimal('4800.00')
        )

    def test_crear_pedido_general_sin_nombre(self):
        response = self.client.post(
            reverse('crear_pedido_general'),
            {
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
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_general_sin_proveedor(self):
        response = self.client.post(
            reverse('crear_pedido_general'),
            {
                'nombre': 'Pedido General',
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
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_general_con_proveedor_inexistente(self):
        response = self.client.post(
            reverse('crear_pedido_general'),
            {
                'nombre': 'Pedido General',
                'proveedor': 9999,
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
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_general_sin_suministros(self):
        response = self.client.post(
            reverse('crear_pedido_general'),
            {
                'nombre': 'Pedido General',
                'proveedor': self.proveedor.id,
                'suministros': {}
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_general_con_cantidad_negativa(self):
        response = self.client.post(
            reverse('crear_pedido_general'),
            {
                'nombre': 'Pedido General',
                'proveedor': self.proveedor.id,
                'suministros': {
                    str(self.suministro_2.id): {
                        'cantidad': -1,
                        'precio_unidad': '40.00'
                    }
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_general_con_precio_negativo(self):
        response = self.client.post(
            reverse('crear_pedido_general'),
            {
                'nombre': 'Pedido General',
                'proveedor': self.proveedor.id,
                'suministros': {
                    str(self.suministro_2.id): {
                        'cantidad': 5,
                        'precio_unidad': '-40.00'
                    }
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_general_con_suministro_no_disponible(self):
        response = self.client.post(
            reverse('crear_pedido_general'),
            {
                'nombre': 'Pedido General',
                'proveedor': self.proveedor.id,
                'suministros': {
                    str(self.suministro.id): {
                        'cantidad': 5,
                        'precio_unidad': '25.00'
                    }
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

    def test_crear_pedido_general_supera_presupuesto(self):
        response = self.client.post(
            reverse('crear_pedido_general'),
            {
                'nombre': 'Pedido General Excesivo',
                'proveedor': self.proveedor.id,
                'suministros': {
                    str(self.suministro_2.id): {
                        'cantidad': 126,
                        'precio_unidad': '40.00'
                    }
                }
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(Pedido.objects.count(), 0)

        centro = Centro.get_solo()

        self.assertEqual(
            centro.presupuesto,
            Decimal('5000.00')
        )

    def test_crear_pedido_general_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse('crear_pedido_general'),
            {
                'nombre': 'Pedido General',
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
            status.HTTP_403_FORBIDDEN
        )
        self.assertEqual(Pedido.objects.count(), 0)

