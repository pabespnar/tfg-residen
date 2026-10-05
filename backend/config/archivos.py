import os
import uuid

from django.utils.deconstruct import deconstructible

EXTENSIONES_PERMITIDAS = {'.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif'}


@deconstructible
class RutaAleatoria:
    def __init__(self, carpeta):
        self.carpeta = carpeta

    def __call__(self, instance, filename):
        extension = os.path.splitext(filename)[1].lower()
        if extension not in EXTENSIONES_PERMITIDAS:
            extension = '.bin'
        return f'{self.carpeta}/{uuid.uuid4().hex}{extension}'