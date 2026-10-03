import requests
from django.conf import settings
from django.core.mail import send_mail as django_send_mail


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