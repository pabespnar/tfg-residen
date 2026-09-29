from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario
from modulos.models import Modulo, Habitacion
from residentes.models import Residente


class HabitacionesTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email='residentes@tfg.com',
            password='12345678',
            nombre='Usuario',
            apellido='Test',
            dni='12345678Z',
            rol='residentes'
        )

        self.usuario_almacen = Usuario.objects.create_user(
            email='almacen@tfg.com',
            password='12345678',
            nombre='Usuario',
            apellido='Almacen',
            dni='12345678Y',
            rol='almacen'
        )

        refresh = RefreshToken.for_user(self.usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        self.modulo = Modulo.objects.create(
            nombre='Modulo 1',
            descripcion='Descripcion del modulo',
            num_habitaciones_max=5
        )

        self.habitacion = Habitacion.objects.create(
            nombre='Habitacion 1',
            info='Informacion de la habitacion',
            capacidad=2,
            f_alta='2026-09-10',
            modulo=self.modulo
        )


    def test_listar_habitaciones(self):
        url = reverse(
            'lista_habitaciones',
            args=[self.modulo.id]
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]['nombre'],
            'Habitacion 1'
        )


    def test_crear_habitacion_correctamente(self):
        url = reverse(
            'crear_habitacion',
            args=[self.modulo.id]
        )

        data = {
            'nombre': 'Habitacion 2',
            'info': 'Nueva habitacion',
            'capacidad': 3
        }

        response = self.client.post(
            url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )
        self.assertTrue(
            Habitacion.objects.filter(
                nombre='Habitacion 2',
                modulo=self.modulo
            ).exists()
        )


    def test_crear_habitacion_supera_maximo_del_modulo(self):
        self.modulo.num_habitaciones_max = 1
        self.modulo.save()

        url = reverse(
            'crear_habitacion',
            args=[self.modulo.id]
        )

        data = {
            'nombre': 'Habitacion 2',
            'info': 'Nueva habitacion',
            'capacidad': 3
        }

        response = self.client.post(
            url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_crear_habitacion_nombre_duplicado(self):
        url = reverse(
            'crear_habitacion',
            args=[self.modulo.id]
        )

        data = {
            'nombre': 'Habitacion 1',
            'info': 'Otra habitacion',
            'capacidad': 3
        }

        response = self.client.post(
            url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )


    def test_crear_habitacion_sin_permiso(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'crear_habitacion',
            args=[self.modulo.id]
        )

        data = {
            'nombre': 'Habitacion 2',
            'info': 'Nueva habitacion',
            'capacidad': 3
        }

        response = self.client.post(
            url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )


    def test_detallar_habitacion(self):
        url = reverse(
            'detalle_habitacion',
            args=[self.modulo.id, self.habitacion.id]
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        self.assertEqual(
            response.data['nombre'],
            'Habitacion 1'
        )


    def test_detallar_habitacion_sin_permiso(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'detalle_habitacion',
            args=[self.modulo.id, self.habitacion.id]
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )


    def test_editar_habitacion_correctamente(self):
        url = reverse(
            'editar_habitacion',
            args=[self.modulo.id, self.habitacion.id]
        )

        data = {
            'nombre': 'Habitacion modificada',
            'info': 'Informacion modificada',
            'capacidad': 3
        }

        response = self.client.put(
            url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.habitacion.refresh_from_db()

        self.assertEqual(
            self.habitacion.nombre,
            'Habitacion modificada'
        )
        self.assertEqual(
            self.habitacion.capacidad,
            3
        )

    def test_editar_habitacion_nombre_duplicado(self):
        Habitacion.objects.create(
            nombre='Habitacion 2',
            info='Otra habitacion',
            capacidad=2,
            f_alta='2026-09-10',
            modulo=self.modulo
        )

        url = reverse(
            'editar_habitacion',
            args=[self.modulo.id, self.habitacion.id]
        )

        data = {
            'nombre': 'Habitacion 2',
            'info': 'Informacion modificada',
            'capacidad': 2
        }

        response = self.client.put(
            url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_editar_habitacion_capacidad_inferior_a_residentes(self):
        Residente.objects.create(
            nombre='Residente 1',
            apellido='Test',
            telefono='600000001',
            email='residente1@tfg.com',
            f_nacimiento='2000-01-01',
            f_alta='2026-09-10',
            pais='España',
            dni_nie='TEST123',
            activo=True,
            habitacion=self.habitacion,
            genero=Residente._meta.get_field('genero').choices[0][0]
        )

        Residente.objects.create(
            nombre='Residente 2',
            apellido='Test',
            telefono='600000002',
            email='residente2@tfg.com',
            f_nacimiento='2000-01-01',
            f_alta='2026-09-10',
            pais='España',
            dni_nie='TEST124',
            activo=True,
            habitacion=self.habitacion,
            genero=Residente._meta.get_field('genero').choices[0][0]
        )

        url = reverse(
            'editar_habitacion',
            args=[self.modulo.id, self.habitacion.id]
        )

        data = {
            'nombre': 'Habitacion 1',
            'info': 'Informacion modificada',
            'capacidad': 1
        }

        response = self.client.put(
            url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )


    def test_editar_habitacion_sin_permiso(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'editar_habitacion',
            args=[self.modulo.id, self.habitacion.id]
        )

        data = {
            'nombre': 'Habitacion modificada',
            'info': 'Informacion modificada',
            'capacidad': 3
        }

        response = self.client.put(
            url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )


    def test_eliminar_habitacion_correctamente(self):
        url = reverse(
            'eliminar_habitacion',
            args=[self.modulo.id, self.habitacion.id]
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT
        )

        self.assertFalse(
            Habitacion.objects.filter(
                id=self.habitacion.id
            ).exists()
        )

    def test_eliminar_habitacion_con_residentes(self):
        Residente.objects.create(
            nombre='Residente',
            apellido='Test',
            telefono='600000000',
            email='residente@tfg.com',
            f_nacimiento='2000-01-01',
            f_alta='2026-09-10',
            pais='España',
            dni_nie='TEST123',
            activo=True,
            habitacion=self.habitacion,
            genero=Residente._meta.get_field('genero').choices[0][0]
        )

        url = reverse(
            'eliminar_habitacion',
            args=[self.modulo.id, self.habitacion.id]
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )


    def test_eliminar_habitacion_sin_permiso(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'eliminar_habitacion',
            args=[self.modulo.id, self.habitacion.id]
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )


    def test_listar_habitaciones_sin_permiso(self):
        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'lista_habitaciones',
            args=[self.modulo.id]
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )