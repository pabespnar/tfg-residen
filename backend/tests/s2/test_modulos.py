from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario
from modulos.models import Modulo, Habitacion


class ModulosTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email='residentes@tfg.com',
            password='Test1234',
            nombre='Usuario',
            apellido='Prueba',
            dni='12345678Z',
            rol='residentes',
        )

        self.usuario_almacen = Usuario.objects.create_user(
            email='almacen@tfg.com',
            password='Test1234',
            nombre='Usuario',
            apellido='Almacen',
            dni='12345678Y',
            rol='almacen',
        )

        refresh = RefreshToken.for_user(self.usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        self.modulo = Modulo.objects.create(
            nombre='Modulo 1',
            descripcion='Descripcion del modulo',
            num_habitaciones_max=5,
        )

    def test_listar_modulos(self):
        Modulo.objects.create(
            nombre='Modulo 2',
            descripcion='Otra descripcion',
            num_habitaciones_max=10,
        )

        response = self.client.get(
            reverse('lista_modulos')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            len(response.data),
            2
        )

    def test_crear_modulo_correctamente(self):
        response = self.client.post(
            reverse('crear_modulo'),
            {
                'nombre': 'Modulo Nuevo',
                'descripcion': 'Descripcion del modulo',
                'num_habitaciones_max': 5,
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            Modulo.objects.filter(
                nombre='Modulo Nuevo'
            ).exists()
        )

        modulo = Modulo.objects.get(
            nombre='Modulo Nuevo'
        )

        self.assertEqual(
            modulo.descripcion,
            'Descripcion del modulo'
        )

        self.assertEqual(
            modulo.num_habitaciones_max,
            5
        )

    def test_crear_modulo_numero_habitaciones_invalido(self):
        response = self.client.post(
            reverse('crear_modulo'),
            {
                'nombre': 'Modulo Nuevo',
                'descripcion': 'Descripcion',
                'num_habitaciones_max': 0,
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertIn(
            'num_habitaciones_max',
            response.data
        )

        self.assertEqual(
            Modulo.objects.count(),
            1
        )

    def test_crear_modulo_nombre_duplicado(self):
        response = self.client.post(
            reverse('crear_modulo'),
            {
                'nombre': 'Modulo 1',
                'descripcion': 'Otra descripcion',
                'num_habitaciones_max': 10,
            },
            format='json'
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
            Modulo.objects.filter(
                nombre='Modulo 1'
            ).count(),
            1
        )

    def test_editar_modulo_correctamente(self):
        response = self.client.put(
            reverse(
                'editar_modulo',
                kwargs={'pk': self.modulo.id}
            ),
            {
                'nombre': 'Modulo Editado',
                'descripcion': 'Nueva descripcion',
                'num_habitaciones_max': 10,
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.modulo.refresh_from_db()

        self.assertEqual(
            self.modulo.nombre,
            'Modulo Editado'
        )

        self.assertEqual(
            self.modulo.descripcion,
            'Nueva descripcion'
        )

        self.assertEqual(
            self.modulo.num_habitaciones_max,
            10
        )

    def test_editar_modulo_reducir_por_debajo_de_habitaciones_existentes(self):
        Habitacion.objects.create(
            nombre='Habitacion 1',
            capacidad=2,
            f_alta='2026-09-10',
            modulo=self.modulo,
        )

        Habitacion.objects.create(
            nombre='Habitacion 2',
            capacidad=2,
            f_alta='2026-09-10',
            modulo=self.modulo,
        )

        response = self.client.put(
            reverse(
                'editar_modulo',
                kwargs={'pk': self.modulo.id}
            ),
            {
                'nombre': 'Modulo 1',
                'descripcion': 'Descripcion',
                'num_habitaciones_max': 1,
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertIn(
            'num_habitaciones_max',
            response.data
        )

        self.modulo.refresh_from_db()

        self.assertEqual(
            self.modulo.num_habitaciones_max,
            5
        )

    def test_editar_modulo_nombre_duplicado(self):
        Modulo.objects.create(
            nombre='Modulo 2',
            descripcion='Descripcion 2',
            num_habitaciones_max=5,
        )

        response = self.client.put(
            reverse(
                'editar_modulo',
                kwargs={'pk': self.modulo.id}
            ),
            {
                'nombre': 'Modulo 2',
                'descripcion': 'Descripcion modificada',
                'num_habitaciones_max': 5,
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertIn(
            'nombre',
            response.data
        )

        self.modulo.refresh_from_db()

        self.assertEqual(
            self.modulo.nombre,
            'Modulo 1'
        )

    def test_eliminar_modulo_correctamente(self):
        response = self.client.delete(
            reverse(
                'eliminar_modulo',
                kwargs={'pk': self.modulo.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT
        )

        self.assertFalse(
            Modulo.objects.filter(
                pk=self.modulo.id
            ).exists()
        )

    def test_eliminar_modulo_con_habitaciones(self):
        habitacion = Habitacion.objects.create(
            nombre='Habitacion 1',
            capacidad=2,
            f_alta='2026-09-10',
            modulo=self.modulo,
        )

        response = self.client.delete(
            reverse(
                'eliminar_modulo',
                kwargs={'pk': self.modulo.id}
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
            Modulo.objects.filter(
                pk=self.modulo.id
            ).exists()
        )

        self.assertTrue(
            Habitacion.objects.filter(
                pk=habitacion.id
            ).exists()
        )

    def test_listar_modulos_sin_permiso(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.get(
            reverse('lista_modulos')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )
