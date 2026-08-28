from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from usuarios.models import Usuario


class LoginTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email='test@tfg.com',
            password='Test1234',
            nombre='Usuario',
            apellido='Prueba',
            dni='12345678Z',
        )

    def test_login_correcto(self):
        response = self.client.post(
            reverse('token_obtain_pair'),
            {
                'email': 'test@tfg.com',
                'password': 'Test1234',
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)


    def test_login_contrasena_incorrecta(self):
        response = self.client.post(
            reverse('token_obtain_pair'),
            {
                'email': 'test@tfg.com',
                'password': 'ContraseñaIncorrecta',
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)


    def test_login_usuario_inexistente(self):
        response = self.client.post(
            reverse('token_obtain_pair'),
            {
                'email': 'noexiste@tfg.com',
                'password': 'Test1234',
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)

    def test_login_sin_email(self):
        response = self.client.post(
            reverse('token_obtain_pair'),
            {
                'password': 'Test1234',
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)


    def test_login_sin_contrasena(self):
        response = self.client.post(
            reverse('token_obtain_pair'),
            {
                'email': 'test@tfg.com',
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)