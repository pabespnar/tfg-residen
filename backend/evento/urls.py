from django.urls import path

from .views import ListaNotificacionesView, MarcarNotificacionLeidaView, ListaHistorialView


urlpatterns = [
    path('notificaciones/', ListaNotificacionesView.as_view(), name='lista_notificaciones'),
    path('notificaciones/<int:id>/leida/', MarcarNotificacionLeidaView.as_view(), name='marcar_notificacion_leida'),
    path('historial/', ListaHistorialView.as_view(), name='lista_historial'),
]