from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient
from patients.models import Patient
from .models import AuditEvent, Document


class S3EndpointTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.owner = get_user_model().objects.create_user(username='doc-owner')
        cls.other = get_user_model().objects.create_user(username='doc-other')
        cls.patient = Patient.objects.create(owner=cls.owner, first_name='Doc', last_name='Fake', phone='+12025550125')

    def setUp(self):
        self.client = APIClient(); self.client.force_authenticate(self.owner)

    def test_summary_and_private_document_audit(self):
        path = f'/api/v1/patients/{self.patient.id}/documents/'
        upload = SimpleUploadedFile('fake.pdf', b'%PDF-fake', content_type='application/pdf')
        response = self.client.post(path, {'file': upload}, format='multipart')
        self.assertEqual(response.status_code, 201)
        document = Document.objects.get(id=response.json()['id'])
        self.assertEqual(self.client.get(f'/api/v1/patients/{self.patient.id}/summary/').status_code, 200)
        self.assertEqual(self.client.get(f'/api/v1/documents/{document.id}/download/').status_code, 200)
        self.assertEqual(AuditEvent.objects.filter(patient=self.patient, event='document.upload').count(), 1)
        self.assertEqual(AuditEvent.objects.filter(patient=self.patient, event='document.download').count(), 1)

    def test_other_owner_cannot_list_or_download(self):
        document = Document.objects.create(patient=self.patient, file=SimpleUploadedFile('x.pdf', b'x', content_type='application/pdf'), original_name='x.pdf', content_type='application/pdf', size_bytes=1)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(f'/api/v1/patients/{self.patient.id}/documents/').status_code, 404)
        self.assertEqual(self.client.get(f'/api/v1/documents/{document.id}/download/').status_code, 404)
