from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.models import Usuario
from centro.models import Centro


class CentroTests(APITestCase):

    def setUp(self):
        self.centro = Centro.objects.create(
            nombre='Centro de prueba',
            presupuesto_referencia=10000,
            presupuesto=5000,
            correo='centro@tfg.com',
        )

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

    def test_obtener_centro(self):
        response = self.client.get(
            reverse('centro')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data['nombre'],
            'Centro de prueba'
        )

        self.assertEqual(
            str(response.data['presupuesto_referencia']),
            '10000.00'
        )

        self.assertEqual(
            str(response.data['presupuesto']),
            '5000.00'
        )

        self.assertEqual(
            response.data['correo'],
            'centro@tfg.com'
        )

    def test_obtener_centro_sin_autenticacion(self):
        self.client.credentials()

        response = self.client.get(
            reverse('centro')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_obtener_centro_usuario_autenticado(self):
        usuario = Usuario.objects.create_user(
            email='usuario@tfg.com',
            password='Test1234',
            nombre='Usuario',
            apellido='Normal',
            telefono='600123457',
            dni='12345678B',
            rol='administracion',
        )

        refresh = RefreshToken.for_user(usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.get(
            reverse('centro')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_actualizar_centro(self):
        response = self.client.patch(
            reverse('centro'),
            {
                'nombre': 'Centro actualizado',
                'correo': 'nuevo@tfg.com',
                'presupuesto': '6000.00',
                'presupuesto_referencia': '12000.00',
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.centro.refresh_from_db()

        self.assertEqual(
            self.centro.nombre,
            'Centro actualizado'
        )

        self.assertEqual(
            self.centro.correo,
            'nuevo@tfg.com'
        )

        self.assertEqual(
            self.centro.presupuesto,
            6000
        )

        self.assertEqual(
            self.centro.presupuesto_referencia,
            12000
        )

    def test_actualizar_centro_sin_permiso(self):
        usuario = Usuario.objects.create_user(
            email='usuario@tfg.com',
            password='Test1234',
            nombre='Usuario',
            apellido='Normal',
            telefono='600123457',
            dni='12345678C',
            rol='administracion',
        )

        refresh = RefreshToken.for_user(usuario)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

        response = self.client.patch(
            reverse('centro'),
            {
                'nombre': 'Centro no autorizado',
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        self.centro.refresh_from_db()

        self.assertEqual(
            self.centro.nombre,
            'Centro de prueba'
        )

    def test_actualizar_centro_sin_autenticacion(self):
        self.client.credentials()

        response = self.client.patch(
            reverse('centro'),
            {
                'nombre': 'Centro no autorizado',
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_actualizar_centro_presupuesto_referencia_inferior(self):
        response = self.client.patch(
            reverse('centro'),
            {
                'presupuesto': '8000.00',
                'presupuesto_referencia': '5000.00',
            },
            format='multipart'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.centro.refresh_from_db()

        self.assertEqual(
            self.centro.presupuesto,
            5000
        )

        self.assertEqual(
            self.centro.presupuesto_referencia,
            10000
        )