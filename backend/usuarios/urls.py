from django.urls import path

from .views import UsuarioActualView

urlpatterns = [
    path('myprofile/', UsuarioActualView.as_view(), name='usuario_actual'),
]