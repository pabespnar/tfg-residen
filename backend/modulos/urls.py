from django.urls import path

from .views import ListaModulosView, CrearModuloView, EditarModuloView, EliminarModuloView


urlpatterns = [
    path('listadomodulos/', ListaModulosView.as_view(), name='lista_modulos'),
    path('crearmodulo/', CrearModuloView.as_view(), name='crear_modulo'),
    path('editarmodulo/<int:pk>/',EditarModuloView.as_view(), name='editar_modulo'),
    path('eliminarmodulo/<int:pk>/', EliminarModuloView.as_view(), name='eliminar_modulo'),
]