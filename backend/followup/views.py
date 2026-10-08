from decimal import Decimal
from django.db import IntegrityError, transaction
from django.db.models import Prefetch
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Consultation, Measurement, ManualNote
from .serializers import ConsultationSerializer, MeasurementSerializer, ManualNoteSerializer
from patients.models import Patient


def patient_for(user, patient_id):
    return Patient.objects.filter(id=patient_id, owner=user).first()


def consultation_for(user, consultation_id):
    return Consultation.objects.select_related('patient').filter(id=consultation_id, patient__owner=user).first()

def paged(request, queryset, serializer):
    pager = PageNumberPagination(); pager.page_size = 20; pager.page_size_query_param = 'page_size'; pager.max_page_size = 100
    page = pager.paginate_queryset(queryset, request)
    return pager.get_paginated_response(serializer(page, many=True).data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def consultations(request, patient_id):
    patient = patient_for(request.user, patient_id)
    if not patient: return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return paged(request, Consultation.objects.filter(patient=patient), ConsultationSerializer)
    serializer = ConsultationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    return Response(ConsultationSerializer(serializer.save(patient=patient)).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def measurements(request, consultation_id):
    consultation = consultation_for(request.user, consultation_id)
    if not consultation: return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return paged(request, Measurement.objects.filter(consultation=consultation), MeasurementSerializer)
    serializer = MeasurementSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        with transaction.atomic(): measurement = serializer.save(consultation=consultation)
    except IntegrityError:
        return Response({'non_field_errors': ['Ya existe una medición.']}, status=400)
    return Response(MeasurementSerializer(measurement).data, status=201)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notes(request, consultation_id):
    consultation = consultation_for(request.user, consultation_id)
    if not consultation: return Response(status=404)
    if request.method == 'GET': return paged(request, consultation.notes.all(), ManualNoteSerializer)
    serializer = ManualNoteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    return Response(ManualNoteSerializer(serializer.save(consultation=consultation)).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def history(request, patient_id):
    patient = patient_for(request.user, patient_id)
    if not patient: return Response(status=404)
    rows = Consultation.objects.filter(patient=patient).select_related('measurement')
    pager = PageNumberPagination(); pager.page_size = 20; pager.page_size_query_param = 'page_size'; pager.max_page_size = 100
    page = pager.paginate_queryset(rows, request)
    values = [ConsultationSerializer(row).data | {'measurement': MeasurementSerializer(row.measurement).data if hasattr(row, 'measurement') else None} for row in page]
    return pager.get_paginated_response(values)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consultation_detail(request, consultation_id):
    item = consultation_for(request.user, consultation_id)
    return Response(ConsultationSerializer(item).data) if item else Response(status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def measurement_detail(request, measurement_id):
    item = Measurement.objects.select_related('consultation__patient').filter(id=measurement_id, consultation__patient__owner=request.user).first()
    return Response(MeasurementSerializer(item).data) if item else Response(status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evolution(request, consultation_id):
    current = consultation_for(request.user, consultation_id)
    if not current: return Response(status=404)
    rows = list(Consultation.objects.filter(patient=current.patient).select_related('measurement').order_by('occurred_at','created_at','id'))
    index = next(i for i, row in enumerate(rows) if row.id == current.id)
    previous = rows[index - 1] if index else None
    def weight(row):
        value = row.measurement.weight_kg if row and hasattr(row, 'measurement') else None
        return value, value is not None and (not value.is_finite() or value <= 0 or value > Decimal('9999.99'))
    now, now_invalid = weight(current)
    before, before_invalid = weight(previous)
    if now_invalid or before_invalid: state, delta = 'invalid_data', None
    elif previous is None: state, delta = 'first', None
    elif now is None or before is None: state, delta = 'insufficient_data', None
    else:
        delta = now - before; state = 'increase' if delta > 0 else 'decrease' if delta < 0 else 'equal'
    return Response({'consultation_id': str(current.id), 'status': state, 'previous_consultation_id': str(previous.id) if previous else None, 'previous_weight_kg': str(before) if before is not None else None, 'current_weight_kg': str(now) if now is not None else None, 'delta_kg': str(delta) if delta is not None else None})
