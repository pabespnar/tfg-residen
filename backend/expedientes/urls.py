from django.urls import path

from .views import CrearPedidoExpedienteView, CrearPedidoGeneralView, CrearProveedorView, EditarProveedorView, EliminarProveedorView, ListaExpedientesView, CrearExpedienteView, ListaPedidosView, ListaPedidosRecibidosView, ListaDetallesPedidoView, ListaProveedoresView, VerExpedienteView, VerPedidoView, ListaSuministrosDisponiblesView


urlpatterns = [
    path('expedientes/', ListaExpedientesView.as_view()),
    path('crearexpediente/', CrearExpedienteView.as_view()),
    path('pedidos/', ListaPedidosView.as_view()),
    path('pedidosrecibidos/', ListaPedidosRecibidosView.as_view()),
    path('pedidos/<int:pedido_id>/detalles/', ListaDetallesPedidoView.as_view()),
    path('pedidos/<int:pk>/',VerPedidoView.as_view()),
    path('expedientes/<int:pk>/', VerExpedienteView.as_view()),
    path('expedientes/<int:pk>/crearpedidoexpediente/', CrearPedidoExpedienteView.as_view()),
    path('suministrosdisponibles/', ListaSuministrosDisponiblesView.as_view()),
    path('crearpedidogeneral/', CrearPedidoGeneralView.as_view()),
    path('proveedores/', ListaProveedoresView.as_view()),
    path('proveedores/<int:pk>/editar/', EditarProveedorView.as_view()),
    path('proveedores/<int:pk>/eliminar/', EliminarProveedorView.as_view()),
    path('proveedores/crear/', CrearProveedorView.as_view()),
]