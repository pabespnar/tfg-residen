from django.urls import path

from .views import (
    ListaResidentesView,
    CrearResidenteView,
)


urlpatterns = [
    path('listaresidentes/', ListaResidentesView.as_view(), name='lista_residentes'),
    path('crearresidente/', CrearResidenteView.as_view(), name='crear_residente'),
]