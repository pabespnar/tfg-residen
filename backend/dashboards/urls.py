from django.urls import path

from .views import DashboardResidentesView, DashboardAlmacenView


urlpatterns = [
    path('residentes/', DashboardResidentesView.as_view(), name='dashboard_residentes'),
    path('almacen/', DashboardAlmacenView.as_view(), name='dashboard_almacen'),
]