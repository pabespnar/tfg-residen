from django.db import models


class Genero(models.TextChoices):
    MASCULINO = 'M', 'Masculino'
    FEMENINO = 'F', 'Femenino'
    OTRO = 'O', 'Otro'


class Residente(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    telefono = models.CharField(max_length=9, blank=True)
    email = models.EmailField(blank=True)
    f_nacimiento = models.DateField()
    f_alta = models.DateField()
    f_baja = models.DateField(null=True, blank=True)
    info = models.TextField(max_length=200,blank=True)
    pais = models.CharField(max_length=100)
    dni_nie = models.CharField(max_length=9, unique=True)
    activo = models.BooleanField(default=True)
    habitacion = models.ForeignKey('modulos.Habitacion', on_delete=models.SET_NULL, null=True, blank=True, related_name='residentes')
    foto = models.ImageField(upload_to='residentes/', null=True, blank=True)
    genero = models.CharField(max_length=1, choices=Genero.choices)



    def __str__(self):
        return f"{self.nombre} {self.apellido}"