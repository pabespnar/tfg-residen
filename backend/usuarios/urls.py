from django.urls import path

from .views import UsuarioActualView, CambiarContrasenaView, RecuperarContrasenaView, RestablecerContrasenaView
urlpatterns = [
    path('datosperfil/', UsuarioActualView.as_view(), name='usuario_actual'),
    path('actualizarperfil/', UsuarioActualView.as_view(), name='actualizar_usuario'),
    path('cambiarcontrasena/', CambiarContrasenaView.as_view(), name='cambiar_contrasena'),
    path('recuperarcontrasena/', RecuperarContrasenaView.as_view(), name='recuperar_contrasena'),
    path('restablecercontrasena/<uid>/<token>/', RestablecerContrasenaView.as_view(), name='restablecer_contrasena'), 
]