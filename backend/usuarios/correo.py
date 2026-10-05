import requests
from django.conf import settings
from django.core.mail import send_mail as django_send_mail
import logging

logger = logging.getLogger(__name__)

def enviar_correo(destinatario, asunto, contenido):
    if not settings.DEBUG and getattr(settings, 'BREVO_API_KEY', None):
        response = requests.post(
            'https://api.brevo.com/v3/smtp/email',
            headers={
                'accept': 'application/json',
                'api-key': settings.BREVO_API_KEY,
                'content-type': 'application/json',
            },
            json={
                'sender': {
                    'email': 'residenapp@gmail.com',
                    'name': 'Gestión Residencial',
                },
                'to': [{'email': destinatario}],
                'subject': asunto,
                'textContent': contenido,
            },
            timeout=15,
        )
        response.raise_for_status()
    else:
        django_send_mail(asunto, contenido, None, [destinatario])

def enviar_correo_seguro(destinatario, asunto, contenido):
    try:
        enviar_correo(destinatario, asunto, contenido)
        return True
    except Exception:
        logger.exception(
            'No se ha podido enviar el correo a %s',
            destinatario
        )
        return False