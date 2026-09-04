from django.urls import path

from .views import (
    EditarResidenteView,
    ListaResidentesView,
    CrearResidenteView,
    DetalleResidenteView,
    DarDeBajaResidenteView,
    DarDeAltaResidenteView,
    ListaHistoricoResidentesView
)


urlpatterns = [
    path('listaresidentes/', ListaResidentesView.as_view(), name='lista_residentes'),
    path('crearresidente/', CrearResidenteView.as_view(), name='crear_residente'),
    path('<int:id>/', DetalleResidenteView.as_view(), name='detalle_residente'),
    path('<int:id>/editar/', EditarResidenteView.as_view(), name='editar_residente'),
    path('<int:id>/baja/', DarDeBajaResidenteView.as_view(), name='dar_de_baja_residente'),
    path('<int:id>/alta/', DarDeAltaResidenteView.as_view(), name='dar_de_alta_residente'),
    path('historicoresidentes/', ListaHistoricoResidentesView.as_view(), name='historico_residentes'),
]