from django.urls import path
from .views import CentroView

urlpatterns = [
    path('', CentroView.as_view(), name='centro'),
]