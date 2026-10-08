from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import DataError, IntegrityError, transaction
from django.db.models.deletion import ProtectedError
from django.test import TestCase
from django.utils import timezone

from patients.models import Patient
from .models import Consultation, ManualNote, Measurement


class FollowupPersistenceTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        owner = get_user_model().objects.create_user(username='followup-owner')
        cls.patient = Patient.objects.create(owner=owner, first_name='Paciente',
                                             last_name='Ficticio', phone='+12025550123')

    def consultation(self):
        return Consultation.objects.create(patient=self.patient,
                                           occurred_at=timezone.now() - timedelta(minutes=1))

    def test_measurement_is_unique_and_protected(self):
        consultation = self.consultation()
        Measurement.objects.create(consultation=consultation, weight_kg=Decimal('70.00'))
        with self.assertRaises(IntegrityError), transaction.atomic():
            Measurement.objects.create(consultation=consultation, weight_kg=Decimal('71.00'))
        with self.assertRaises(ProtectedError):
            consultation.delete()

    def test_database_constraints_and_patient_protection(self):
        for weight in (Decimal('0.00'), Decimal('-1.00'), Decimal('10000.00')):
            with self.subTest(weight=weight), self.assertRaises((DataError, IntegrityError)), transaction.atomic():
                Measurement.objects.create(consultation=self.consultation(), weight_kg=weight)
        with self.assertRaises(IntegrityError), transaction.atomic():
            ManualNote.objects.create(consultation=self.consultation(), kind='note', text='   ')
        self.consultation()
        with self.assertRaises(ProtectedError):
            self.patient.delete()
