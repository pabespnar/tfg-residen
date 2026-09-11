from django.urls import path

from .views import ListaExpedientesView, CrearExpedienteView


urlpatterns = [
    path('expedientes/', ListaExpedientesView.as_view()),
    path('crearexpediente/', CrearExpedienteView.as_view()),
]