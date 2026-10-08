from rest_framework import serializers
from .models import Consultation, Measurement, ManualNote


class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = ['id', 'patient', 'occurred_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'patient', 'created_at', 'updated_at']


class MeasurementSerializer(serializers.ModelSerializer):
    weight_kg = serializers.DecimalField(max_digits=6, decimal_places=2, coerce_to_string=True)
    class Meta:
        model = Measurement
        fields = ['id', 'consultation', 'weight_kg', 'created_at', 'updated_at']
        read_only_fields = ['id', 'consultation', 'created_at', 'updated_at']


class ManualNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManualNote
        fields = ['id', 'consultation', 'kind', 'text', 'created_at', 'updated_at']
        read_only_fields = ['id', 'consultation', 'created_at', 'updated_at']

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('No puede estar vacío.')
        return value
