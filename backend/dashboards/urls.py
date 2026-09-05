from django.urls import path

from .views import DashboardResidentesView


urlpatterns = [
    path('residentes/', DashboardResidentesView.as_view(), name='dashboard_residentes'),
]