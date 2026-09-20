from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario
from residentes.models import Residente, Genero
from modulos.models import Modulo, Habitacion


class ResidentesTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email='residentes@tfg.com',
            password='Password123',
            nombre='Usuario',
            apellido='Residentes',
            dni='12345678A',
            rol='residentes'
        )

        self.usuario_almacen = Usuario.objects.create_user(
            email='almacen@test.com',
            password='Password123',
            nombre='Usuario',
            apellido='Almacen',
            dni='87654321B',
            rol='almacen'
        )

        self.usuario_administracion = Usuario.objects.create_user(
            email='administracion@test.com',
            password='Password123',
            nombre='Usuario',
            apellido='Administracion',
            dni='11223344C',
            rol='administracion'
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

        refresh = RefreshToken.for_user(self.usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_listar_residentes_activos(self):
        url = reverse('lista_residentes')

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], 'Juan')

    def test_listar_residentes_como_almacen(self):
        refresh = RefreshToken.for_user(self.usuario_almacen)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse('lista_residentes')

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_listar_residentes_sin_permiso(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse('lista_residentes')

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_crear_residente_correctamente(self):
        url = reverse('crear_residente')

        data = {
            'nombre': 'Maria',
            'apellido': 'Gomez',
            'telefono': '611234567',
            'email': 'maria@test.com',
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

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Residente.objects.count(), 2)

        residente = Residente.objects.get(dni_nie='87654321Y')
        self.assertEqual(residente.nombre, 'Maria')
        self.assertEqual(residente.habitacion, self.habitacion)
        self.assertIsNotNone(residente.f_alta)

    def test_crear_residente_activo_sin_habitacion(self):
        url = reverse('crear_residente')

        data = {
            'nombre': 'Maria',
            'apellido': 'Gomez',
            'f_nacimiento': '1995-05-10',
            'pais': 'España',
            'dni_nie': '87654321Y',
            'activo': True,
            'genero': self.genero
        }

        response = self.client.post(
            url,
            data,
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn('habitacion', response.data)

    def test_crear_residente_superando_capacidad_habitacion(self):
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
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn('habitacion', response.data)

    def test_crear_residente_con_dni_duplicado(self):
        url = reverse('crear_residente')

        data = {
            'nombre': 'Maria',
            'apellido': 'Gomez',
            'f_nacimiento': '1995-05-10',
            'pais': 'España',
            'dni_nie': '12345678X',
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
            status.HTTP_400_BAD_REQUEST
        )

    def test_crear_residente_sin_permiso_almacen(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse('crear_residente')

        response = self.client.post(
            url,
            {},
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_crear_residente_sin_permiso_administracion(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse('crear_residente')

        response = self.client.post(
            url,
            {},
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_obtener_detalle_residente(self):
        url = reverse(
            'detalle_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Juan')
        self.assertEqual(
            response.data['habitacion'],
            self.habitacion.id
        )
        self.assertEqual(
            response.data['habitacion_nombre'],
            'Habitacion 1'
        )

    def test_obtener_detalle_residente_sin_permiso_almacen(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'detalle_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_obtener_detalle_residente_sin_permiso_administracion(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'detalle_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_editar_residente_correctamente(self):
        url = reverse(
            'editar_residente',
            kwargs={'id': self.residente.id}
        )

        data = {
            'nombre': 'Juan Carlos',
            'telefono': '699999999'
        }

        response = self.client.patch(
            url,
            data,
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.residente.refresh_from_db()

        self.assertEqual(
            self.residente.nombre,
            'Juan Carlos'
        )
        self.assertEqual(
            self.residente.telefono,
            '699999999'
        )

    def test_editar_residente_activo_sin_habitacion(self):
        url = reverse(
            'editar_residente',
            kwargs={'id': self.residente.id}
        )

        data = {
            'habitacion': ''
        }

        response = self.client.patch(
            url,
            data,
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn('habitacion', response.data)

    def test_editar_residente_superando_capacidad_habitacion(self):
        habitacion_2 = Habitacion.objects.create(
            nombre='Habitacion 2',
            info='Otra habitacion',
            capacidad=1,
            f_alta='2026-09-10',
            modulo=self.modulo
        )

        Residente.objects.create(
            nombre='Pedro',
            apellido='Lopez',
            f_nacimiento='1992-03-15',
            f_alta='2026-09-10',
            pais='España',
            dni_nie='22222222A',
            activo=True,
            habitacion=habitacion_2,
            genero=self.genero
        )

        url = reverse(
            'editar_residente',
            kwargs={'id': self.residente.id}
        )

        data = {
            'habitacion': habitacion_2.id
        }

        response = self.client.patch(
            url,
            data,
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn('habitacion', response.data)

    def test_editar_residente_sin_permiso_almacen(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'editar_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.patch(
            url,
            {},
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_editar_residente_sin_permiso_administracion(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'editar_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.patch(
            url,
            {},
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_dar_de_baja_residente_correctamente(self):
        url = reverse(
            'dar_de_baja_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.residente.refresh_from_db()

        self.assertFalse(self.residente.activo)
        self.assertIsNone(self.residente.habitacion)
        self.assertIsNotNone(self.residente.f_baja)

    def test_dar_de_baja_residente_ya_dado_de_baja(self):
        self.residente.activo = False
        self.residente.habitacion = None
        self.residente.save()

        url = reverse(
            'dar_de_baja_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_dar_de_baja_residente_sin_permiso_almacen(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'dar_de_baja_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_dar_de_baja_residente_sin_permiso_administracion(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'dar_de_baja_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.post(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_dar_de_alta_residente_correctamente(self):
        self.residente.activo = False
        self.residente.habitacion = None
        self.residente.f_baja = '2026-09-10'
        self.residente.save()

        url = reverse(
            'dar_de_alta_residente',
            kwargs={'id': self.residente.id}
        )

        data = {
            'habitacion': self.habitacion.id
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.residente.refresh_from_db()

        self.assertTrue(self.residente.activo)
        self.assertEqual(
            self.residente.habitacion,
            self.habitacion
        )
        self.assertIsNotNone(self.residente.f_alta)

    def test_dar_de_alta_residente_sin_habitacion(self):
        self.residente.activo = False
        self.residente.habitacion = None
        self.residente.save()

        url = reverse(
            'dar_de_alta_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.post(url, {})

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn('habitacion', response.data)

    def test_dar_de_alta_residente_superando_capacidad(self):
        self.residente.activo = False
        self.residente.habitacion = None
        self.residente.save()

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

        url = reverse(
            'dar_de_alta_residente',
            kwargs={'id': self.residente.id}
        )

        data = {
            'habitacion': self.habitacion.id
        }

        response = self.client.post(url, data)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn('habitacion', response.data)

    def test_dar_de_alta_residente_sin_permiso_almacen(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'dar_de_alta_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.post(url, {})

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_dar_de_alta_residente_sin_permiso_administracion(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse(
            'dar_de_alta_residente',
            kwargs={'id': self.residente.id}
        )

        response = self.client.post(url, {})

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_listar_historico_residentes(self):
        self.residente.activo = False
        self.residente.habitacion = None
        self.residente.f_baja = '2026-09-10'
        self.residente.save()

        Residente.objects.create(
            nombre='Maria',
            apellido='Gomez',
            f_nacimiento='1995-05-10',
            f_alta='2026-09-01',
            f_baja='2026-09-09',
            pais='España',
            dni_nie='87654321Y',
            activo=False,
            genero=self.genero
        )

        url = reverse('historico_residentes')

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_listar_historico_residentes_sin_permiso_almacen(self):
        refresh = RefreshToken.for_user(
            self.usuario_almacen
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse('historico_residentes')

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_listar_historico_residentes_sin_permiso_administracion(self):
        refresh = RefreshToken.for_user(
            self.usuario_administracion
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        url = reverse('historico_residentes')

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )