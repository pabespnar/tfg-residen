from django.urls import path

from .views import DetallesHabitacionView, ListaModulosView, CrearModuloView, EditarModuloView, EliminarModuloView, ListaHabitacionesView, CrearHabitacionView, EditarHabitacionView, EliminarHabitacionView


urlpatterns = [
    path('listadomodulos/', ListaModulosView.as_view(), name='lista_modulos'),
    path('crearmodulo/', CrearModuloView.as_view(), name='crear_modulo'),
    path('editarmodulo/<int:pk>/',EditarModuloView.as_view(), name='editar_modulo'),
    path('eliminarmodulo/<int:pk>/', EliminarModuloView.as_view(), name='eliminar_modulo'),
    path('<int:pk>/habitaciones/', ListaHabitacionesView.as_view(), name='lista_habitaciones'),
    path('<int:pk>/habitaciones/crear/', CrearHabitacionView.as_view(), name='crear_habitacion'),
    path('<int:modulo_pk>/habitaciones/<int:habitacion_pk>/', DetallesHabitacionView.as_view(), name='detalle_habitacion'),
    path('<int:modulo_pk>/habitaciones/<int:habitacion_pk>/editar/', EditarHabitacionView.as_view(), name='editar_habitacion'),
    path('<int:modulo_pk>/habitaciones/<int:habitacion_pk>/eliminar/', EliminarHabitacionView.as_view(), name='eliminar_habitacion'),
]