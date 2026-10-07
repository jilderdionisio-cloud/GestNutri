# Estado S1-BE / Issue #3

Rama local: feature/HU-01-backend-base. Incluye la propuesta documental de
Diana 81f2b36 por fast-forward desde feature/HU-02-patient-data.
Cambios propios limitados a backend/ y docs/api/.

Preparado para revisión: Django/DRF, autenticación por sesión y CSRF, modelo
Patient, validaciones estrictas, alta/lista/búsqueda/consulta/PATCH, aislamiento
por profesional y contratos API versionados.

Evidencia: 20 pruebas aprobadas con manage.py test --settings=config.test_settings.
La tabla de pacientes se crea desde el modelo en SQLite temporal; esto NO
valida migraciones. manage.py check pasó sin incidencias. La generación en
seco identifica la inicial pendiente, sin escribirla.

La entrega de Diana es una propuesta; no incluye modelo ejecutable ni migración.
Backend propone owner como FK obligatoria a User con PROTECT, interna a la API.
La propuesta debe confirmarse con Diana y el orquestador. No se modificaron sus
documentos ni se creó su migración.

Pendiente: confirmar propiedad y contrato, migración inicial de Diana, pruebas
normales sobre esquema migrado, validación PostgreSQL, CI de QA, orquestador y
revisión humana. S1-BE no se declara terminado ni desplegable. No se publicó PR.
