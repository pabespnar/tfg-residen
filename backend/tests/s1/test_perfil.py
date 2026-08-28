from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario


class PerfilTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email='test@tfg.com',
            password='Test1234',
            nombre='Usuario',
            apellido='Prueba',
            dni='12345678Z',
        )

        refresh = RefreshToken.for_user(self.usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def test_visualizar_perfil(self):
        response = self.client.get(
            reverse('usuario_actual')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data['email'],
            'test@tfg.com'
        )

        self.assertEqual(
            response.data['nombre'],
            'Usuario'
        )

        self.assertEqual(
            response.data['apellido'],
            'Prueba'
        )

        self.assertEqual(
            response.data['dni'],
            '12345678Z'
        )

    def test_actualizar_perfil(self):
        response = self.client.patch(
            reverse('actualizar_usuario'),
            {
                'nombre': 'NuevoNombre',
                'apellido': 'NuevoApellido',
                'telefono': '600123456',
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.usuario.refresh_from_db()

        self.assertEqual(
            self.usuario.nombre,
            'NuevoNombre'
        )

        self.assertEqual(
            self.usuario.apellido,
            'NuevoApellido'
        )

        self.assertEqual(
            self.usuario.telefono,
            '600123456'
        )

    def test_actualizar_perfil_sin_autenticacion(self):
        self.client.credentials()

        response = self.client.patch(
            reverse('actualizar_usuario'),
            {
                'nombre': 'NombreNoAutorizado',
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

        self.usuario.refresh_from_db()

        self.assertEqual(
            self.usuario.nombre,
            'Usuario'
        )