from django.urls import path

from .views import ListaBajasAlmacenView, CrearBajaExtraordinariaView


urlpatterns = [
    path('listabajas/', ListaBajasAlmacenView.as_view(), name='lista_bajas'),
    path('crearbajaextraordinaria/', CrearBajaExtraordinariaView.as_view(), name='crear_baja_extraordinaria'),
]