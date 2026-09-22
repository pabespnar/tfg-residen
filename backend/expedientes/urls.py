from django.urls import path

from .views import CrearPedidoExpedienteView, CrearPedidoGeneralView, CrearProveedorView, EditarProveedorView, EliminarProveedorView, ListaExpedientesView, CrearExpedienteView, ListaPedidosView, ListaPedidosRecibidosView, ListaDetallesPedidoView, ListaProveedoresView, VerExpedienteView, VerPedidoView, ListaSuministrosDisponiblesView


urlpatterns = [
    path('expedientes/', ListaExpedientesView.as_view(), name='lista_expedientes'),
    path('crearexpediente/', CrearExpedienteView.as_view(), name='crear_expediente'),
    path('pedidos/', ListaPedidosView.as_view(), name='lista_pedidos'),
    path('pedidosrecibidos/', ListaPedidosRecibidosView.as_view(), name='lista_pedidos_recibidos'),
    path('pedidos/<int:pedido_id>/detalles/', ListaDetallesPedidoView.as_view(), name='lista_detalles_pedido'),
    path('pedidos/<int:pk>/', VerPedidoView.as_view(), name='detalle_pedido'),
    path('expedientes/<int:pk>/', VerExpedienteView.as_view(), name='detalle_expediente'),
    path('expedientes/<int:pk>/crearpedidoexpediente/', CrearPedidoExpedienteView.as_view(), name='crear_pedido_expediente'),
    path('suministrosdisponibles/', ListaSuministrosDisponiblesView.as_view(), name='lista_suministros_disponibles'),
    path('crearpedidogeneral/', CrearPedidoGeneralView.as_view(), name='crear_pedido_general'),
    path('proveedores/', ListaProveedoresView.as_view(), name='lista_proveedores'),
    path('proveedores/<int:pk>/editar/', EditarProveedorView.as_view(), name='editar_proveedor'),
    path('proveedores/<int:pk>/eliminar/', EliminarProveedorView.as_view(), name='eliminar_proveedor'),
    path('proveedores/crear/', CrearProveedorView.as_view(), name='crear_proveedor'),
]