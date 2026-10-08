from datetime import timedelta
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework.test import APIRequestFactory, force_authenticate

from patients.models import Patient
from .views import evolution


class FollowupApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.owner = get_user_model().objects.create_user(username='owner')
        cls.other = get_user_model().objects.create_user(username='other')
        cls.patient = Patient.objects.create(owner=cls.owner, first_name='Ana', last_name='Prueba', phone='+12025550123')
        cls.other_patient = Patient.objects.create(owner=cls.other, first_name='Otra', last_name='Prueba', phone='+12025550124')

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(self.owner)

    def consultation(self, patient=None, days=1):
        response = self.client.post(f'/api/v1/patients/{patient or self.patient.id}/consultations/',
                                    {'occurred_at': (timezone.now() - timedelta(days=days)).isoformat()}, format='json')
        self.assertEqual(response.status_code, 201)
        return response.json()

    def test_owner_can_create_history_measurement_notes_and_evolution(self):
        first = self.consultation(days=2)
        second = self.consultation(days=1)
        self.assertEqual(self.client.post(f"/api/v1/consultations/{first['id']}/measurements/", {'weight_kg': '70.00'}, format='json').status_code, 201)
        self.assertEqual(self.client.post(f"/api/v1/consultations/{second['id']}/measurements/", {'weight_kg': '71.25'}, format='json').status_code, 201)
        self.assertEqual(self.client.post(f"/api/v1/consultations/{second['id']}/notes/", {'kind': 'note', 'text': 'Dato ficticio'}, format='json').status_code, 201)
        history = self.client.get(f'/api/v1/patients/{self.patient.id}/history/').json()
        self.assertEqual(len(history), 2)
        evolution = self.client.get(f"/api/v1/consultations/{second['id']}/evolution/").json()
        self.assertEqual(evolution['status'], 'increase')
        self.assertEqual(evolution['delta_kg'], '1.25')

    def test_isolation_and_measurement_cardinality(self):
        mine = self.consultation()
        self.assertEqual(self.client.post(f"/api/v1/consultations/{mine['id']}/measurements/", {'weight_kg': '70.00'}, format='json').status_code, 201)
        self.assertEqual(self.client.post(f"/api/v1/consultations/{mine['id']}/measurements/", {'weight_kg': '71.00'}, format='json').status_code, 400)
        self.assertEqual(self.client.get(f'/api/v1/patients/{self.other_patient.id}/history/').status_code, 404)
        self.assertEqual(self.client.post(f'/api/v1/patients/{self.other_patient.id}/consultations/', {'occurred_at': (timezone.now() - timedelta(days=1)).isoformat()}, format='json').status_code, 404)

    def test_missing_weight_is_not_skipped(self):
        first = self.consultation(days=3)
        middle = self.consultation(days=2)
        last = self.consultation(days=1)
        self.client.post(f"/api/v1/consultations/{first['id']}/measurements/", {'weight_kg': '70.00'}, format='json')
        self.client.post(f"/api/v1/consultations/{last['id']}/measurements/", {'weight_kg': '71.00'}, format='json')
        self.assertEqual(self.client.get(f"/api/v1/consultations/{middle['id']}/evolution/").json()['status'], 'insufficient_data')
        self.assertEqual(self.client.get(f"/api/v1/consultations/{last['id']}/evolution/").json()['status'], 'insufficient_data')

    def test_invalid_data_is_defensive_for_corrupt_persisted_weight(self):
        current = SimpleNamespace(id=self.patient.id, patient=self.patient,
                                  measurement=SimpleNamespace(weight_kg=Decimal('NaN')))
        query = SimpleNamespace(select_related=lambda *args: SimpleNamespace(order_by=lambda *args: [current]))
        request = APIRequestFactory().get(f'/api/v1/consultations/{current.id}/evolution/')
        force_authenticate(request, user=self.owner)
        with patch('followup.views.consultation_for', return_value=current), \
             patch('followup.views.Consultation.objects.filter', return_value=query):
            response = evolution(request, current.id)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'invalid_data')
        self.assertIsNone(response.data['delta_kg'])
