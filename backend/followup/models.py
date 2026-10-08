import uuid

from django.core.validators import MaxLengthValidator
from django.db import models
from django.db.models.functions import Length

from patients.models import Patient


models.TextField.register_lookup(Length)


class Consultation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT, related_name='consultations')
    occurred_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['occurred_at', 'created_at', 'id']


class Measurement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.OneToOneField(Consultation, on_delete=models.PROTECT,
                                        related_name='measurement')
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(weight_kg__gt=0) &
                                   models.Q(weight_kg__lte=9999.99),
                                   name='followup_weight_kg_range'),
        ]


class ManualNote(models.Model):
    class Kind(models.TextChoices):
        NOTE = 'note', 'Nota'
        PREFERENCE = 'preference', 'Preferencia'
        RESTRICTION = 'restriction', 'Restricción'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.ForeignKey(Consultation, on_delete=models.PROTECT,
                                     related_name='notes')
    kind = models.CharField(max_length=16, choices=Kind.choices)
    text = models.TextField(validators=[MaxLengthValidator(2000)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at', 'id']
        constraints = [
            models.CheckConstraint(condition=models.Q(text__regex=r'\S'),
                                   name='followup_note_text_not_blank'),
            models.CheckConstraint(condition=models.Q(text__length__lte=2000),
                                   name='followup_note_text_max_length'),
        ]
