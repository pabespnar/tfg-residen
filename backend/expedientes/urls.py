from django.urls import path

from .views import ListaExpedientesView, CrearExpedienteView, ListaPedidosView, ListaPedidosRecibidosView, CrearPedidoView, ListaDetallesPedidoView, CrearDetallePedidoView


urlpatterns = [
    path('expedientes/', ListaExpedientesView.as_view()),
    path('crearexpediente/', CrearExpedienteView.as_view()),
    path('pedidos/', ListaPedidosView.as_view()),
    path('pedidosrecibidos/', ListaPedidosRecibidosView.as_view()),
    path('crearpedido/', CrearPedidoView.as_view()),
    path('pedidos/<int:pedido_id>/detalles/', ListaDetallesPedidoView.as_view()),
    path('creardetallepedido/', CrearDetallePedidoView.as_view()),
]