from decimal import Decimal
from uuid import UUID
from django.db import IntegrityError, transaction
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Prefetch
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import FileResponse
from rest_framework.pagination import PageNumberPagination
from .models import AuditEvent, Consultation, Document, Measurement, ManualNote
from .serializers import ConsultationSerializer, MeasurementSerializer, ManualNoteSerializer
from patients.models import Patient


def patient_for(user, patient_id):
    return Patient.objects.filter(id=patient_id, owner=user).first()


def consultation_for(user, consultation_id):
    return Consultation.objects.select_related('patient').filter(id=consultation_id, patient__owner=user).first()

def paged(request, queryset, serializer):
    for key in ('page', 'page_size'):
        if key in request.query_params and (not request.query_params[key].isdigit() or int(request.query_params[key]) < 1):
            return Response({key: ['Parámetro de paginación inválido.']}, status=400)
    pager = PageNumberPagination(); pager.page_size = 20; pager.page_size_query_param = 'page_size'; pager.max_page_size = 100
    page = pager.paginate_queryset(queryset, request)
    return pager.get_paginated_response(serializer(page, many=True).data)

def audit(request, patient, event, outcome='success'):
    AuditEvent.objects.create(actor=request.user, patient=patient, event=event, outcome=outcome)

def json_only(request):
    return request.content_type.split(';')[0] == 'application/json'


DOCUMENT_SIGNATURES = {
    'application/pdf': b'%PDF-',
    'image/jpeg': b'\xff\xd8\xff',
    'image/png': b'\x89PNG\r\n\x1a\n',
}


def valid_document_signature(uploaded):
    expected = DOCUMENT_SIGNATURES.get(uploaded.content_type or '')
    if expected is None:
        return False
    position = uploaded.tell()
    try:
        return uploaded.read(len(expected)).startswith(expected)
    finally:
        uploaded.seek(position)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def consultations(request, patient_id):
    patient = patient_for(request.user, patient_id)
    if not patient: return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'POST' and not json_only(request): return Response(status=415)
    if request.method == 'GET':
        return paged(request, Consultation.objects.filter(patient=patient), ConsultationSerializer)
    serializer = ConsultationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        with transaction.atomic():
            item = serializer.save(patient=patient)
    except (IntegrityError, DjangoValidationError):
        return Response({'non_field_errors': ['No se pudo guardar la consulta.']}, status=400)
    audit(request, patient, 'consultation.create')
    return Response(ConsultationSerializer(item).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def measurements(request, consultation_id):
    consultation = consultation_for(request.user, consultation_id)
    if not consultation: return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'POST' and not json_only(request): return Response(status=415)
    if request.method == 'GET':
        return paged(request, Measurement.objects.filter(consultation=consultation), MeasurementSerializer)
    serializer = MeasurementSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        with transaction.atomic(): measurement = serializer.save(consultation=consultation)
    except IntegrityError as exc:
        cause = getattr(exc, '__cause__', None)
        constraint = getattr(getattr(cause, 'diag', None), 'constraint_name', '') or ''
        message = str(cause or exc).lower()
        if constraint == 'followup_measurement_consultation_id_key' or 'consultation_id' in message and 'unique' in message:
            return Response({'non_field_errors': ['Esta consulta ya tiene una medición.']}, status=400)
        if constraint == 'followup_weight_valid_range' or 'followup_weight_valid_range' in message:
            return Response({'weight_kg': ['El peso debe estar entre 1 y 400 kg.']}, status=400)
        return Response({'non_field_errors': ['No se pudo guardar la medición.']}, status=400)
    except DjangoValidationError as exc:
        return Response({'weight_kg': ['Escribe el peso con números, por ejemplo 68.5.']}, status=400)
    audit(request, consultation.patient, 'measurement.create')
    return Response(MeasurementSerializer(measurement).data, status=201)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notes(request, consultation_id):
    consultation = consultation_for(request.user, consultation_id)
    if not consultation: return Response(status=404)
    if request.method == 'POST' and not json_only(request): return Response(status=415)
    if request.method == 'GET': return paged(request, consultation.notes.all(), ManualNoteSerializer)
    serializer = ManualNoteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    try:
        with transaction.atomic():
            item = serializer.save(consultation=consultation)
    except (IntegrityError, DjangoValidationError):
        return Response({'non_field_errors': ['No se pudo guardar la nota.']}, status=400)
    audit(request, consultation.patient, 'note.create')
    return Response(ManualNoteSerializer(item).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def history(request, patient_id):
    patient = patient_for(request.user, patient_id)
    if not patient: return Response(status=404)
    rows = Consultation.objects.filter(patient=patient).select_related('measurement')
    for key in ('page', 'page_size'):
        if key in request.query_params and (not request.query_params[key].isdigit() or int(request.query_params[key]) < 1):
            return Response({key: ['Parámetro de paginación inválido.']}, status=400)
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
def note_detail(request, note_id):
    item = ManualNote.objects.select_related('consultation__patient').filter(id=note_id, consultation__patient__owner=request.user).first()
    return Response(ManualNoteSerializer(item).data) if item else Response(status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def summary(request, patient_id):
    patient = patient_for(request.user, patient_id)
    if not patient: return Response(status=404)
    rows = Consultation.objects.filter(patient=patient).select_related('measurement')
    weights = [str(row.measurement.weight_kg) for row in rows if hasattr(row, 'measurement')]
    return Response({'patient': str(patient.id), 'consultations': rows.count(), 'measurements': len(weights), 'latest_weight_kg': weights[0] if weights else None})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def documents(request, patient_id):
    patient = patient_for(request.user, patient_id)
    if not patient: return Response(status=404)
    if request.method == 'GET':
        values = [{'id': str(item.id), 'consultation': str(item.consultation_id) if item.consultation_id else None, 'original_name': item.original_name, 'content_type': item.content_type, 'size_bytes': item.size_bytes, 'uploaded_at': item.uploaded_at} for item in Document.objects.filter(patient=patient)]
        return Response(values)
    uploaded = request.FILES.get('file')
    if not uploaded: return Response({'file': ['Completa este campo.']}, status=400)
    if not valid_document_signature(uploaded):
        return Response({'file': ['Sube un archivo PDF, PNG o JPG.']}, status=400)
    consultation_id = request.data.get('consultation')
    if consultation_id:
        try:
            UUID(str(consultation_id))
        except (TypeError, ValueError, AttributeError):
            return Response({'consultation': ['UUID inválido.']}, status=400)
    consultation = consultation_for(request.user, consultation_id) if consultation_id else None
    if consultation_id and (not consultation or consultation.patient_id != patient.id): return Response({'consultation': ['Consulta inválida.']}, status=400)
    item = Document(patient=patient, consultation=consultation, file=uploaded, original_name=uploaded.name, content_type=uploaded.content_type or '', size_bytes=uploaded.size)
    try:
        item.full_clean()
        with transaction.atomic():
            item.save()
    except DjangoValidationError as exc:
        messages = exc.messages
        message = messages[0] if messages else 'Completa este campo.'
        if '10 MiB' in message:
            message = 'El archivo supera el límite de 10 MiB.'
        elif 'Tipo de archivo' in message:
            message = 'Sube un archivo PDF, PNG o JPG.'
        return Response({'file': [message]}, status=400)
    except IntegrityError:
        return Response({'non_field_errors': ['No se pudo guardar el documento.']}, status=400)
    audit(request, patient, 'document.upload')
    return Response({'id': str(item.id)}, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def document_download(request, document_id):
    item = Document.objects.select_related('patient').filter(id=document_id, patient__owner=request.user).first()
    if not item: return Response(status=404)
    audit(request, item.patient, 'document.download')
    return FileResponse(item.file.open('rb'), as_attachment=True, filename=item.original_name, content_type=item.content_type)


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
