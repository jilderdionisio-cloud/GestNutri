from datetime import timedelta
from decimal import Decimal

from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.db.migrations.recorder import MigrationRecorder
from django.test import TransactionTestCase
from django.utils import timezone


class WeightRangeMigrationTests(TransactionTestCase):
    def test_out_of_range_legacy_measurement_stops_with_actionable_message(self):
        prior_migration = ('followup', '0002_auditevent_document')
        target_migration = ('followup', '0003_remove_measurement_followup_weight_valid_range_and_more')
        MigrationExecutor(connection).migrate([prior_migration])

        historical_apps = MigrationExecutor(connection).loader.project_state(
            [prior_migration]).apps
        User = historical_apps.get_model('auth', 'User')
        Patient = historical_apps.get_model('patients', 'Patient')
        Consultation = historical_apps.get_model('followup', 'Consultation')
        Measurement = historical_apps.get_model('followup', 'Measurement')

        user = User.objects.create(username='migration-test', password='unused')
        patient = Patient.objects.create(
            owner_id=user.pk, first_name='Ficticio', last_name='Migración',
            phone='+12025550123')
        consultation = Consultation.objects.create(
            patient_id=patient.pk, occurred_at=timezone.now() - timedelta(days=1))
        measurement = Measurement.objects.create(
            consultation_id=consultation.pk, weight_kg=Decimal('1000'))

        try:
            with self.assertRaisesRegex(
                    RuntimeError,
                    r'1 mediciones fuera del rango 1-400 kg.*IDs de ejemplo'):
                MigrationExecutor(connection).migrate([target_migration])
            self.assertNotIn(target_migration,
                             MigrationRecorder(connection).applied_migrations())
        finally:
            Measurement.objects.filter(pk=measurement.pk).update(weight_kg=Decimal('68.5'))
            executor = MigrationExecutor(connection)
            executor.migrate(executor.loader.graph.leaf_nodes())
        self.assertIn(target_migration, MigrationRecorder(connection).applied_migrations())
