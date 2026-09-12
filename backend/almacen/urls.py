from django.urls import path

from .views import ListaBajasAlmacenView, CrearBajaServicioView


urlpatterns = [
    path('listabajas/', ListaBajasAlmacenView.as_view(), name='lista_bajas'),
    path('crearbajaservicio/', CrearBajaServicioView.as_view(), name='crear_baja_servicio'),
]