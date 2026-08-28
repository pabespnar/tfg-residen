from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from usuarios.models import Usuario


class ContrasenaTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email='test@tfg.com',
            password='Test1234',
            nombre='Usuario',
            apellido='Prueba',
            dni='12345678Z',
        )

        response = self.client.post(
            reverse('token_obtain_pair'),
            {
                'email': 'test@tfg.com',
                'password': 'Test1234',
            },
            format='json'
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {response.data["access"]}'
        )

    def test_cambiar_contrasena_correctamente(self):
        response = self.client.patch(
            reverse('cambiar_contrasena'),
            {
                'contrasena_actual': 'Test1234',
                'nueva_contrasena': 'Nueva1234',
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.usuario.refresh_from_db()

        self.assertTrue(
            self.usuario.check_password('Nueva1234')
        )

    def test_cambiar_contrasena_actual_incorrecta(self):
        response = self.client.patch(
            reverse('cambiar_contrasena'),
            {
                'contrasena_actual': 'ContraseñaIncorrecta',
                'nueva_contrasena': 'Nueva1234',
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertIn(
            'contrasena_actual',
            response.data
        )

        self.usuario.refresh_from_db()

        self.assertTrue(
            self.usuario.check_password('Test1234')
        )

    def test_cambiar_contrasena_demasiado_corta(self):
        response = self.client.patch(
            reverse('cambiar_contrasena'),
            {
                'contrasena_actual': 'Test1234',
                'nueva_contrasena': '1234567',
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertIn(
            'nueva_contrasena',
            response.data
        )

        self.usuario.refresh_from_db()

        self.assertTrue(
            self.usuario.check_password('Test1234')
        )

    def test_cambiar_contrasena_igual_a_actual(self):
        response = self.client.patch(
            reverse('cambiar_contrasena'),
            {
                'contrasena_actual': 'Test1234',
                'nueva_contrasena': 'Test1234',
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertIn(
            'nueva_contrasena',
            response.data
        )

        self.usuario.refresh_from_db()

        self.assertTrue(
            self.usuario.check_password('Test1234')
        )

    def test_cambiar_contrasena_sin_autenticacion(self):
        self.client.credentials()

        response = self.client.patch(
            reverse('cambiar_contrasena'),
            {
                'contrasena_actual': 'Test1234',
                'nueva_contrasena': 'Nueva1234',
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

        self.usuario.refresh_from_db()

        self.assertTrue(
            self.usuario.check_password('Test1234')
        )

        