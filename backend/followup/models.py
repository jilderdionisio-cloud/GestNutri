"""Single Sprint 2 schema source. The data owner generates its migration."""
import uuid
from pathlib import Path
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.conf import settings
from django.core.validators import MaxLengthValidator, RegexValidator
from django.db import models
from django.db.models.functions import Length
from django.utils import timezone
from .fields import WeightField

models.TextField.register_lookup(Length)


def validate_occurred_at(value):
    if timezone.is_naive(value):
        raise ValidationError('La fecha debe incluir zona horaria.')
    if value > timezone.now():
        raise ValidationError('La fecha no puede ser futura.')


def validate_weight(value):
    if not value.is_finite() or not Decimal('0') < value <= Decimal('9999.99'):
        raise ValidationError('El peso debe ser finito, positivo y no mayor que 9999.99 kg.')


class Consultation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey('patients.Patient', on_delete=models.PROTECT,
                                related_name='consultations')
    occurred_at = models.DateTimeField(validators=[validate_occurred_at])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-occurred_at', '-created_at', '-id']


class Measurement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.OneToOneField(Consultation, on_delete=models.PROTECT,
                                       related_name='measurement')
    weight_kg = WeightField(max_digits=6, decimal_places=2,
                                    validators=[validate_weight])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at', 'id']
        constraints = [models.CheckConstraint(
            condition=models.Q(weight_kg__gt=0, weight_kg__lte=Decimal('9999.99')),
            name='followup_weight_valid_range')]


class ManualNote(models.Model):
    class Kind(models.TextChoices):
        NOTE = 'note', 'Nota'
        PREFERENCE = 'preference', 'Preferencia'
        RESTRICTION = 'restriction', 'Restricción'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.ForeignKey(Consultation, on_delete=models.PROTECT,
                                     related_name='notes')
    kind = models.CharField(max_length=11, choices=Kind.choices)
    text = models.TextField(validators=[MaxLengthValidator(2000), RegexValidator(r'\S')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at', 'id']
        constraints = [
            models.CheckConstraint(condition=models.Q(kind__in=['note', 'preference', 'restriction']),
                                   name='followup_note_kind_valid'),
            models.CheckConstraint(condition=models.Q(text__regex=r'\S'),
                                   name='followup_note_not_blank'),
            models.CheckConstraint(condition=models.Q(text__length__lte=2000),
                                   name='followup_note_max_length'),
        ]

    def clean(self):
        super().clean()
        if isinstance(self.text, str):
            self.text = self.text.strip()
def document_upload_path(instance, filename):
    return f'private-documents/{instance.patient_id}/{uuid.uuid4()}{Path(filename).suffix.lower()}'


class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey('patients.Patient', on_delete=models.PROTECT, related_name='documents')
    consultation = models.ForeignKey(Consultation, on_delete=models.PROTECT, related_name='documents',
                                     null=True, blank=True)
    file = models.FileField(upload_to=document_upload_path)
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=64)
    size_bytes = models.PositiveIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        super().clean()
        if self.consultation_id and self.consultation.patient_id != self.patient_id:
            raise ValidationError('La consulta debe pertenecer al paciente del documento.')
        if self.content_type not in {'application/pdf', 'image/jpeg', 'image/png'}:
            raise ValidationError('Tipo de archivo no permitido.')
        if self.size_bytes > 10 * 1024 * 1024:
            raise ValidationError('El archivo supera 10 MiB.')


class AuditEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='audit_events')
    patient = models.ForeignKey('patients.Patient', on_delete=models.PROTECT, related_name='audit_events',
                                null=True, blank=True)
    event = models.CharField(max_length=64)
    outcome = models.CharField(max_length=16)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-id']
