from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from usuarios.models import Usuario


class SesionTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email='test@tfg.com',
            password='Test1234',
            nombre='Usuario',
            apellido='Prueba',
            dni='12345678Z',
        )

    def test_acceso_sin_autenticacion(self):
        response = self.client.get(
            reverse('usuario_actual')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_acceso_con_jwt_valido(self):
        response_login = self.client.post(
            reverse('token_obtain_pair'),
            {
                'email': 'test@tfg.com',
                'password': 'Test1234',
            },
            format='json'
        )

        self.assertEqual(
            response_login.status_code,
            status.HTTP_200_OK
        )

        access_token = response_login.data['access']

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )

        response_perfil = self.client.get(
            reverse('usuario_actual')
        )

        self.assertEqual(
            response_perfil.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response_perfil.data['email'],
            'test@tfg.com'
        )

    def test_acceso_con_jwt_invalido(self):
        self.client.credentials(
            HTTP_AUTHORIZATION='Bearer token_invalido'
        )

        response = self.client.get(
            reverse('usuario_actual')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )
