from django.urls import path

from .views import ListaSuministrosView, DetalleSuministroView, EditarSuministroView, CrearCategoriaView, ListaCategoriasView
urlpatterns = [
    path('suministros/', ListaSuministrosView.as_view(), name='suministros'),
    path('<int:id>/', DetalleSuministroView.as_view(), name='detalle_suministro'),
    path('<int:id>/editar/', EditarSuministroView.as_view(), name='editar_suministro'),
    path('crearcategoria/', CrearCategoriaView.as_view(), name='crear_categoria'),
    path('categorias/', ListaCategoriasView.as_view(), name='categorias'),
]