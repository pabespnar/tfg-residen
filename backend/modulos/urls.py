from django.urls import path

from .views import ListaModulosView, CrearModuloView


urlpatterns = [
    path('listadomodulos/', ListaModulosView.as_view(), name='lista_modulos'),
    path('crearmodulo/', CrearModuloView.as_view(), name='crear_modulo'),
]