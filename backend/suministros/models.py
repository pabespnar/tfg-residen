from django.db import models


class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'

class Suministro(models.Model):
    nombre = models.CharField(max_length=100)
    detalles = models.TextField(blank=True, null=True)
    stock = models.PositiveIntegerField(default=0)
    unidad = models.CharField(max_length=50)
    stock_minimo = models.PositiveIntegerField(default=0)
    f_alta = models.DateField(auto_now_add=True)
    categoria = models.ForeignKey(
        'Categoria',
        on_delete=models.SET_NULL,
        related_name='suministros',
        null=True,
        blank=True
    )


    def __str__(self):
        return self.nombre


class Pack(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre


class ContenidoPack(models.Model):
    pack = models.ForeignKey(Pack, on_delete=models.CASCADE)
    suministro = models.ForeignKey(Suministro, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)


    def __str__(self):
        return f"{self.cantidad} x {self.suministro.nombre} in {self.pack.nombre}"


    class Meta:
        verbose_name = 'Contenido de pack'
        verbose_name_plural = 'Contenidos de pack'

class EntregaPack(models.Model):
    pack = models.ForeignKey(Pack, on_delete=models.CASCADE)
    residente = models.ForeignKey('residentes.Residente', on_delete=models.CASCADE)
    fecha_entrega = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.pack.nombre} delivered to {self.residente.nombre} on {self.fecha_entrega}"

    class Meta:
        verbose_name = 'Entrega de pack'
        verbose_name_plural = 'Entregas de pack'