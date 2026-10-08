from rest_framework import serializers
from collections.abc import Mapping
from django.utils import timezone
import re
from .models import Consultation, Measurement, ManualNote


class ConsultationSerializer(serializers.ModelSerializer):
    def to_internal_value(self, data):
        if isinstance(data, Mapping):
            extra = set(data) - {'occurred_at'}
            if extra: raise serializers.ValidationError({key: ['Campo desconocido.'] for key in extra})
            raw = data.get('occurred_at')
            if not isinstance(raw, str) or not re.search(r'(Z|[+-][0-9]{2}:[0-9]{2})$', raw):
                raise serializers.ValidationError({'occurred_at': ['La fecha debe incluir zona horaria.']})
        return super().to_internal_value(data)
    def validate_occurred_at(self, value):
        if timezone.is_naive(value): raise serializers.ValidationError('La fecha debe incluir zona horaria.')
        return value
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
    def to_internal_value(self, data):
        if isinstance(data, Mapping):
            extra = set(data) - {'weight_kg'}
            if extra: raise serializers.ValidationError({key: ['Campo desconocido.'] for key in extra})
            if not isinstance(data.get('weight_kg'), str):
                raise serializers.ValidationError({'weight_kg': ['Usa una cadena decimal exacta.']})
        return super().to_internal_value(data)


class ManualNoteSerializer(serializers.ModelSerializer):
    def to_internal_value(self, data):
        if isinstance(data, Mapping):
            extra = set(data) - {'kind', 'text'}
            if extra: raise serializers.ValidationError({key: ['Campo desconocido.'] for key in extra})
        return super().to_internal_value(data)
    class Meta:
        model = ManualNote
        fields = ['id', 'consultation', 'kind', 'text', 'created_at', 'updated_at']
        read_only_fields = ['id', 'consultation', 'created_at', 'updated_at']

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('No puede estar vacío.')
        return value
