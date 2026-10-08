from django.urls import path
from . import views

urlpatterns = [
    path('patients/<uuid:patient_id>/consultations/', views.consultations),
    path('patients/<uuid:patient_id>/history/', views.history),
    path('consultations/<uuid:consultation_id>/measurements/', views.measurements),
    path('consultations/<uuid:consultation_id>/notes/', views.notes),
    path('consultations/<uuid:consultation_id>/evolution/', views.evolution),
    path('consultations/<uuid:consultation_id>/', views.consultation_detail),
    path('measurements/<uuid:measurement_id>/', views.measurement_detail),
]
