from django.shortcuts import render

# Create your views here.
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from .serializers import UsuarioSerializer
from .models import Usuario

class UsuarioActualView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        serializer = UsuarioSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = UsuarioSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class CambiarContrasenaView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        contrasena_actual = request.data.get('contrasena_actual')
        nueva_contrasena = request.data.get('nueva_contrasena')

        if not contrasena_actual:
            return Response(
                {'contrasena_actual': 'La contraseña actual es obligatoria.'},
                status=400
            )

        if not nueva_contrasena:
            return Response(
                {'nueva_contrasena': 'La nueva contraseña es obligatoria.'},
                status=400
            )

        if not request.user.check_password(contrasena_actual):
            return Response(
                {'contrasena_actual': 'La contraseña actual no es correcta.'},
                status=400
            )

        if len(nueva_contrasena) < 8:
            return Response(
                {'nueva_contrasena': 'La nueva contraseña debe tener al menos 8 caracteres.'},
                status=400
            )

        if contrasena_actual == nueva_contrasena:
            return Response(
                {'nueva_contrasena': 'La nueva contraseña debe ser diferente de la actual.'},
                status=400
            )

        request.user.set_password(nueva_contrasena)
        request.user.save()

        return Response(
            {'mensaje': 'Contraseña actualizada correctamente.'}
        )

class RecuperarContrasenaView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response(
                {'email': 'El correo electrónico es obligatorio.'},
                status=400
            )

        usuario = Usuario.objects.filter(email=email).first()

        if usuario:
            uid = urlsafe_base64_encode(force_bytes(usuario.pk))
            token = default_token_generator.make_token(usuario)
            enlace = f'http://localhost:5173/restablecer-contrasena/{uid}/{token}'

            send_mail(
                'Recuperación de contraseña',
                f'Hola {usuario.nombre},\n\n'
                f'Has solicitado recuperar tu contraseña.\n\n'
                f'Accede al siguiente enlace para establecer una nueva contraseña:\n'
                f'{enlace}\n\n'
                f'Si no has solicitado este cambio, puedes ignorar este correo.',
                None,
                [usuario.email],
            )

        return Response(
            {
                'mensaje': (
                    'Si el correo está registrado, recibirás un enlace '
                    'para recuperar la contraseña.'
                )
            }
        )

class RestablecerContrasenaView(APIView):
    permission_classes = []

    def post(self, request, uid, token):


        try:
            usuario_id = force_str(urlsafe_base64_decode(uid))

            usuario = Usuario.objects.get(pk=usuario_id)

        except (TypeError, ValueError, OverflowError, Usuario.DoesNotExist):
            return Response(
                {'error': 'El enlace de recuperación no es válido.'},
                status=400
            )



        token_valido = default_token_generator.check_token(usuario, token)
    


        if not token_valido:
            return Response(
                {'error': 'El enlace de recuperación no es válido o ha caducado.'},
                status=400
            )

        nueva_contrasena = request.data.get('nueva_contrasena')

        if not nueva_contrasena:
            return Response(
                {'nueva_contrasena': 'La nueva contraseña es obligatoria.'},
                status=400
            )

        if len(nueva_contrasena) < 8:
            return Response(
                {'nueva_contrasena': 'La nueva contraseña debe tener al menos 8 caracteres.'},
                status=400
            )

        usuario.set_password(nueva_contrasena)
        usuario.save()

        return Response(
            {'mensaje': 'Contraseña actualizada correctamente.'}
        )