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
from .models import AuditEvent, ManualNote
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
        self.assertEqual(len(history['results']), 2)
        evolution = self.client.get(f"/api/v1/consultations/{second['id']}/evolution/").json()
        self.assertEqual(evolution['status'], 'increase')
        self.assertEqual(evolution['delta_kg'], '1.25')

    def test_isolation_and_measurement_cardinality(self):
        mine = self.consultation()
        self.assertEqual(self.client.post(f"/api/v1/consultations/{mine['id']}/measurements/", {'weight_kg': '70.00'}, format='json').status_code, 201)
        self.assertEqual(self.client.post(f"/api/v1/consultations/{mine['id']}/measurements/", {'weight_kg': '71.00'}, format='json').status_code, 400)
        self.assertEqual(self.client.get(f'/api/v1/patients/{self.other_patient.id}/history/').status_code, 404)
        self.assertEqual(self.client.post(f'/api/v1/patients/{self.other_patient.id}/consultations/', {'occurred_at': (timezone.now() - timedelta(days=1)).isoformat()}, format='json').status_code, 404)

    def test_strict_input_pagination_and_details(self):
        endpoint = f'/api/v1/patients/{self.patient.id}/consultations/'
        self.assertEqual(self.client.post(endpoint, {'occurred_at': '2026-01-01T10:00:00'}, format='json').status_code, 400)
        self.assertEqual(self.client.post(endpoint, {'occurred_at': (timezone.now()-timedelta(days=1)).isoformat(), 'unexpected': True}, format='json').status_code, 400)
        item = self.consultation()
        measure = self.client.post(f"/api/v1/consultations/{item['id']}/measurements/", {'weight_kg': '70.00'}, format='json').json()
        self.assertEqual(self.client.post(f"/api/v1/consultations/{item['id']}/measurements/", {'weight_kg': 70}, format='json').status_code, 400)
        self.assertEqual(self.client.get(endpoint + '?page=1&page_size=1').json()['count'], 1)
        self.assertEqual(self.client.get(f"/api/v1/consultations/{item['id']}/").status_code, 200)
        self.assertEqual(self.client.get(f"/api/v1/measurements/{measure['id']}/").status_code, 200)
        note = self.client.post(f"/api/v1/consultations/{item['id']}/notes/", {'kind': 'note', 'text': 'X'}, format='json').json()
        self.assertEqual(self.client.get(f"/api/v1/notes/{note['id']}/").status_code, 200)
        self.assertEqual(self.client.get(endpoint + '?page=bad').status_code, 400)
        self.assertEqual(self.client.get(endpoint + '?page_size=0').status_code, 400)
        history = f'/api/v1/patients/{self.patient.id}/history/'
        self.assertEqual(self.client.get(history + '?page=bad').status_code, 400)
        self.assertEqual(self.client.get(history + '?page_size=-1').status_code, 400)
        self.assertEqual(self.client.post(endpoint, {'occurred_at': '2026-01-01T00:00:00Z'}, format='multipart').status_code, 415)
        self.assertEqual(self.client.post(f"/api/v1/consultations/{item['id']}/measurements/", {'weight_kg': '7e1'}, format='json').status_code, 400)

    def test_missing_weight_is_not_skipped(self):
        first = self.consultation(days=3)
        middle = self.consultation(days=2)
        last = self.consultation(days=1)
        self.client.post(f"/api/v1/consultations/{first['id']}/measurements/", {'weight_kg': '70.00'}, format='json')
        self.client.post(f"/api/v1/consultations/{last['id']}/measurements/", {'weight_kg': '71.00'}, format='json')
        self.assertEqual(self.client.get(f"/api/v1/consultations/{middle['id']}/evolution/").json()['status'], 'insufficient_data')
        self.assertEqual(self.client.get(f"/api/v1/consultations/{last['id']}/evolution/").json()['status'], 'insufficient_data')

    def test_note_text_requires_a_string_without_writes_or_audit(self):
        consultation = self.consultation()
        endpoint = f"/api/v1/consultations/{consultation['id']}/notes/"
        for invalid_text in (123, True, [], None):
            response = self.client.post(endpoint, {'kind': 'note', 'text': invalid_text}, format='json')
            self.assertEqual(response.status_code, 400)
            self.assertIn('text', response.json())
        self.assertFalse(ManualNote.objects.filter(consultation_id=consultation['id']).exists())
        self.assertFalse(AuditEvent.objects.filter(patient=self.patient, event='note.create').exists())

    def test_notes_support_all_kinds_reject_2001_characters_and_keep_history_order(self):
        consultation = self.consultation()
        endpoint = f"/api/v1/consultations/{consultation['id']}/notes/"
        created = []
        for kind, text in (('note', 'Primera nota'), ('preference', 'Sin azúcar'), ('restriction', 'Sin frutos secos')):
            response = self.client.post(endpoint, {'kind': kind, 'text': text}, format='json')
            self.assertEqual(response.status_code, 201)
            created.append(response.json())
        self.assertEqual(self.client.post(endpoint, {'kind': 'note', 'text': 'x' * 2001}, format='json').status_code, 400)
        listed = self.client.get(endpoint).json()['results']
        expected_ids = [str(note_id) for note_id in ManualNote.objects.filter(consultation_id=consultation['id']).order_by('created_at', 'id').values_list('id', flat=True)]
        self.assertEqual([item['id'] for item in listed], expected_ids)
        self.assertEqual({item['kind'] for item in listed}, {'note', 'preference', 'restriction'})

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
