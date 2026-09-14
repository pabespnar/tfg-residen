from django.urls import path

from .views import CrearPedidoExpedienteView, CrearPedidoGeneralView, ListaExpedientesView, CrearExpedienteView, ListaPedidosView, ListaPedidosRecibidosView, ListaDetallesPedidoView, CrearDetallePedidoView, ListaProveedoresView, VerExpedienteView, VerPedidoView, ListaSuministrosDisponiblesView


urlpatterns = [
    path('expedientes/', ListaExpedientesView.as_view()),
    path('crearexpediente/', CrearExpedienteView.as_view()),
    path('pedidos/', ListaPedidosView.as_view()),
    path('pedidosrecibidos/', ListaPedidosRecibidosView.as_view()),
    path('pedidos/<int:pedido_id>/detalles/', ListaDetallesPedidoView.as_view()),
    path('pedidos/<int:pk>/',VerPedidoView.as_view()),
    path('creardetallepedido/', CrearDetallePedidoView.as_view()),
    path('expedientes/<int:pk>/', VerExpedienteView.as_view()),
    path('expedientes/<int:pk>/crearpedidoexpediente/', CrearPedidoExpedienteView.as_view()),
    path('suministrosdisponibles/', ListaSuministrosDisponiblesView.as_view()),
    path('crearpedidogeneral/', CrearPedidoGeneralView.as_view()),
    path('proveedores/', ListaProveedoresView.as_view()),
]