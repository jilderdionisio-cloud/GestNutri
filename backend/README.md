# Backend S1-BE

Base Django 5.2 LTS / DRF. Rama `feature/HU-01-backend-base`, derivada de `develop`.

## Ejecutar localmente (PowerShell)

```powershell
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
$env:DJANGO_DEBUG = 'true'
$env:DJANGO_SECRET_KEY = 'cambiar-por-un-secreto-local-aleatorio'
.venv/Scripts/python.exe manage.py migrate
.venv/Scripts/python.exe manage.py createsuperuser
.venv/Scripts/python.exe manage.py runserver
```

`.env.example` documenta variables; Django no carga ese archivo automáticamente.
SQLite se permite solo en desarrollo. Para producción configurar PostgreSQL,
secreto, hosts y HTTPS. No hay registro público de profesionales.

## Validar

```powershell
.venv/Scripts/python.exe manage.py check
.venv/Scripts/python.exe manage.py test
.venv/Scripts/python.exe manage.py makemigrations --check --dry-run
```

La migración inicial de pacientes está pendiente de Diana. Hasta integrarla,
validar el borrador con `manage.py test --settings=config.test_settings`.
Estas settings crean pacientes solo en la base temporal de pruebas y no deben
usarse para el servidor. Después, ejecutar pruebas normales con migraciones.
CI corresponde a S1-QA.

## Integración pendiente

Se incorporó la propuesta de Diana `81f2b36` y se prepararon modelo y endpoints
para revisión. La propiedad por profesional y migración requieren coordinación
con Diana. Ver `docs/api/v1-patients.md` y `docs/api/S1-BE-status.md`.
