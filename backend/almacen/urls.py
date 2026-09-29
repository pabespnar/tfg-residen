from django.urls import path

from .views import CrearAltaAlmacenView, ListaAltasAlmacenView, ListaBajasAlmacenView, CrearBajaServicioView


urlpatterns = [
    path('listabajas/', ListaBajasAlmacenView.as_view(), name='lista_bajas'),
    path('crearbajaservicio/', CrearBajaServicioView.as_view(), name='crear_baja_servicio'),
    path('listaltas/', ListaAltasAlmacenView.as_view(), name='lista_altas'),
    path('crearalta/', CrearAltaAlmacenView.as_view(), name='crear_alta'),
]