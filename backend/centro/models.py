from django.db import models
from solo.models import SingletonModel
from config.archivos import RutaAleatoria

class Centro(SingletonModel):
    nombre = models.CharField(max_length=100)
    logo = models.ImageField(upload_to=RutaAleatoria('centro'), null=True, blank=True)
    presupuesto_referencia = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    presupuesto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    correo = models.EmailField(max_length=254)

    def __str__(self):
        return self.nombre