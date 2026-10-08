from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.db.models.deletion import ProtectedError
from django.test import TestCase
from django.utils import timezone

from patients.models import Patient
from .models import Consultation, ManualNote, Measurement


class FollowupModelTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.owner = get_user_model().objects.create_user(username='followup-owner')
        cls.patient = Patient.objects.create(
            owner=cls.owner, first_name='Paciente', last_name='Ficticio', phone='+12025550123')

    def consultation(self):
        return Consultation.objects.create(
            patient=self.patient, occurred_at=timezone.now() - timedelta(minutes=1))

    def test_measurement_is_optional_and_unique_per_consultation(self):
        consultation = self.consultation()
        Measurement.objects.create(consultation=consultation, weight_kg=Decimal('70.00'))
        with self.assertRaises(IntegrityError), transaction.atomic():
            Measurement.objects.create(consultation=consultation, weight_kg=Decimal('71.00'))

    def test_database_constraints_reject_invalid_weight_and_blank_notes(self):
        for weight in (Decimal('0.00'), Decimal('-1.00'), Decimal('10000.00')):
            with self.subTest(weight=weight), self.assertRaises(IntegrityError), transaction.atomic():
                Measurement.objects.create(consultation=self.consultation(), weight_kg=weight)
        for text in ('', '   '):
            with self.subTest(text=repr(text)), self.assertRaises(IntegrityError), transaction.atomic():
                ManualNote.objects.create(consultation=self.consultation(), kind='note', text=text)

    def test_protects_patient_and_consultation_references(self):
        consultation = self.consultation()
        Measurement.objects.create(consultation=consultation, weight_kg=Decimal('70.00'))
        ManualNote.objects.create(consultation=consultation, kind='restriction', text='Ficticia')
        with self.assertRaises(ProtectedError):
            consultation.delete()
        with self.assertRaises(ProtectedError):
            self.patient.delete()
