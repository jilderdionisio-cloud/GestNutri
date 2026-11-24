"""Datos ficticios D-6. Ejecutar exclusivamente contra una base QA desechable."""
import base64
import getpass
import os
from pathlib import Path
import sys
from decimal import Decimal

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.files.base import ContentFile
from django.db import transaction
from django.utils import timezone
from patients.models import Patient
from followup.models import Consultation, Measurement, ManualNote, Document

PNG = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=')


def main():
    if not settings.DEBUG or os.getenv('GESTNUTRI_QA_SEED') != 'BASE_DE_PRUEBAS':
        raise SystemExit('Activa DEBUG y GESTNUTRI_QA_SEED=BASE_DE_PRUEBAS en una base QA desechable.')
    User = get_user_model()
    passwords = {}
    # Validar todo antes de escribir; nunca imprimir contraseñas.
    for account in ('a', 'b'):
        username = f'gestnutri_qa_d6_{account}'
        existing = User.objects.filter(username=username).first()
        if existing and existing.email != f'{username}@example.com':
            raise SystemExit('El usuario reservado ya existe con otro correo; no se modificó.')
        password = os.getenv(f'GESTNUTRI_QA_{account.upper()}_PASSWORD') or getpass.getpass(f'Contraseña QA {account.upper()}: ')
        validate_password(password, existing or User(username=username))
        passwords[account] = password
    page_size = int(settings.REST_FRAMEWORK.get('PAGE_SIZE') or 20)
    count_a = max(25, 2 * page_size + 1)
    written_files = []
    try:
        with transaction.atomic():
            for account, count in (('a', count_a), ('b', 1)):
                username = f'gestnutri_qa_d6_{account}'
                user, _ = User.objects.get_or_create(username=username, defaults={'email': f'{username}@example.com'})
                user.set_password(passwords[account])
                user.save()
                first = None
                for number in range(1, count + 1):
                    patient, _ = Patient.objects.get_or_create(
                        owner=user, email=f'd6-{account}-{number:03d}@example.com',
                        defaults={'first_name': f'Paciente QA {account.upper()} {number:03d}',
                                  'last_name': 'Ficticio D6', 'phone': '+12025550123',
                                  'birth_date': '1990-05-10', 'allergies': '', 'restrictions': ''})
                    patient.full_clean()
                    if first is None:
                        first = patient
                consultation = Consultation.objects.filter(patient=first).order_by('created_at').first()
                if consultation is None:
                    consultation = Consultation(patient=first, occurred_at=timezone.now())
                    consultation.full_clean()
                    consultation.save()
                measurement, _ = Measurement.objects.get_or_create(consultation=consultation, defaults={'weight_kg': Decimal('68.50')})
                measurement.full_clean()
                note, _ = ManualNote.objects.get_or_create(consultation=consultation, kind='note', text='Nota ficticia D6 para verificar el aislamiento entre cuentas.')
                note.full_clean()
                if not Document.objects.filter(patient=first, original_name='qa-d6.png').exists():
                    document = Document(patient=first, consultation=consultation, original_name='qa-d6.png', content_type='image/png', size_bytes=len(PNG))
                    document.file.save('qa-d6.png', ContentFile(PNG), save=False)
                    written_files.append((document.file.storage, document.file.name))
                    document.full_clean()
                    document.save()
        print(f'Datos ficticios D6 preparados: cuenta A, {count_a} pacientes; cuenta B, 1 paciente. Sin eliminaciones.')
    except Exception:
        for storage, name in written_files:
            storage.delete(name)
        raise


if __name__ == '__main__':
    main()
