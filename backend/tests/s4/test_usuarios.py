from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files.uploadedfile import SimpleUploadedFile

from usuarios.models import Usuario


class CrearUsuarioTests(APITestCase):

    def setUp(self):
        self.superusuario = Usuario.objects.create_superuser(
            email='admin@tfg.com',
            password='Admin1234',
            nombre='Administrador',
            apellido='Prueba',
            telefono='600123456',
            dni='12345678A',
        )

        refresh = RefreshToken.for_user(self.superusuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_crear_usuario(self):
        response = self.client.post(
            reverse('crear_usuario'),
            {
                'email': 'nuevo@tfg.com',
                'nombre': 'Nuevo',
                'apellido': 'Usuario',
                'telefono': '600123457',
                'dni': '12345678B',
                'rol': 'residentes',
                'password': 'Test1234!',
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        usuario = Usuario.objects.get(
            email='nuevo@tfg.com'
        )

        self.assertEqual(
            usuario.nombre,
            'Nuevo'
        )

        self.assertEqual(
            usuario.apellido,
            'Usuario'
        )

        self.assertEqual(
            usuario.telefono,
            '600123457'
        )

        self.assertEqual(
            usuario.dni,
            '12345678B'
        )

        self.assertEqual(
            usuario.rol,
            'residentes'
        )

        self.assertTrue(
            usuario.check_password('Test1234!')
        )

    def test_crear_usuario_como_superusuario(self):
        response = self.client.post(
            reverse('crear_usuario'),
            {
                'email': 'super@tfg.com',
                'nombre': 'Super',
                'apellido': 'Usuario',
                'telefono': '600123458',
                'dni': '12345678C',
                'rol': 'administracion',
                'password': 'Test1234!',
                'es_superusuario': True,
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        usuario = Usuario.objects.get(
            email='super@tfg.com'
        )

        self.assertTrue(
            usuario.is_staff
        )

        self.assertTrue(
            usuario.is_superuser
        )

    def test_crear_usuario_sin_permiso(self):
        usuario = Usuario.objects.create_user(
            email='usuario@tfg.com',
            password='Test1234!',
            nombre='Usuario',
            apellido='Normal',
            telefono='600123459',
            dni='12345678D',
            rol='residentes',
        )

        refresh = RefreshToken.for_user(usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.post(
            reverse('crear_usuario'),
            {
                'email': 'nuevo@tfg.com',
                'nombre': 'Nuevo',
                'apellido': 'Usuario',
                'telefono': '600123460',
                'dni': '12345678E',
                'rol': 'residentes',
                'password': 'Test1234!',
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    def test_crear_usuario_correo_duplicado(self):
        response = self.client.post(
            reverse('crear_usuario'),
            {
                'email': 'admin@tfg.com',
                'nombre': 'Nuevo',
                'apellido': 'Usuario',
                'telefono': '600123460',
                'dni': '12345678E',
                'rol': 'residentes',
                'password': 'Test1234!',
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_crear_usuario_dni_duplicado(self):
        response = self.client.post(
            reverse('crear_usuario'),
            {
                'email': 'nuevo@tfg.com',
                'nombre': 'Nuevo',
                'apellido': 'Usuario',
                'telefono': '600123460',
                'dni': '12345678A',
                'rol': 'residentes',
                'password': 'Test1234!',
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_crear_usuario_datos_invalidos(self):
        response = self.client.post(
            reverse('crear_usuario'),
            {
                'email': 'nuevo@tfg.com',
                'nombre': 'Nuevo',
                'apellido': 'Usuario',
                'telefono': '123',
                'dni': '12345678E',
                'rol': 'residentes',
                'password': 'Test1234!',
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
