from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

from usuarios.models import Usuario


class RecuperacionTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email='test@tfg.com',
            password='Test1234',
            nombre='Usuario',
            apellido='Prueba',
            dni='12345678Z',
        )

    def test_solicitar_recuperacion_email_existente(self):
        response = self.client.post(
            reverse('recuperar_contrasena'),
            {
                'email': 'test@tfg.com',
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertIn(
            'mensaje',
            response.data
        )

    def test_solicitar_recuperacion_email_inexistente(self):
        response = self.client.post(
            reverse('recuperar_contrasena'),
            {
                'email': 'noexiste@tfg.com',
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertIn(
            'mensaje',
            response.data
        )

    def test_solicitar_recuperacion_sin_email(self):
        response = self.client.post(
            reverse('recuperar_contrasena'),
            {},
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertIn(
            'email',
            response.data
        )

    def test_token_generado_es_valido(self):
        token = default_token_generator.make_token(self.usuario)

        self.assertTrue(
            default_token_generator.check_token(
                self.usuario,
                token
            )
        )

    def test_token_invalido(self):
        token = 'token_invalido'

        self.assertFalse(
            default_token_generator.check_token(
                self.usuario,
                token
            )
        )

    def test_uid_valido(self):
        uid = urlsafe_base64_encode(
            force_bytes(self.usuario.pk)
        )

        from django.utils.http import urlsafe_base64_decode

        usuario_id = urlsafe_base64_decode(uid).decode()

        usuario = Usuario.objects.get(pk=usuario_id)

        self.assertEqual(
            usuario,
            self.usuario
        )

    def test_uid_invalido(self):
        from django.utils.http import urlsafe_base64_decode

        try:
            uid = urlsafe_base64_decode('uid_invalido')
            usuario_id = uid.decode()
            Usuario.objects.get(pk=usuario_id)

            self.fail('El UID debería ser inválido.')

        except Exception:
            pass

    def test_restablecer_contrasena_correctamente(self):
        uid = urlsafe_base64_encode(
            force_bytes(self.usuario.pk)
        )

        token = default_token_generator.make_token(self.usuario)

        response = self.client.post(
            reverse(
                'restablecer_contrasena',
                kwargs={
                    'uid': uid,
                    'token': token,
                }
            ),
            {
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

    def test_restablecer_contrasena_token_invalido(self):
        uid = urlsafe_base64_encode(
            force_bytes(self.usuario.pk)
        )

        response = self.client.post(
            reverse(
                'restablecer_contrasena',
                kwargs={
                    'uid': uid,
                    'token': 'token_invalido',
                }
            ),
            {
                'nueva_contrasena': 'Nueva1234',
            },
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertIn(
            'error',
            response.data
        )

        self.usuario.refresh_from_db()

        self.assertTrue(
            self.usuario.check_password('Test1234')
        )