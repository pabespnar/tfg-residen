from django.urls import path

from .views import UsuarioActualView

urlpatterns = [
    path('datosperfil/', UsuarioActualView.as_view(), name='usuario_actual'),
    path('actualizarperfil/', UsuarioActualView.as_view(), name='actualizar_usuario'),
]