# Persistencia de pacientes — Sprint 1

Responsable: Diana. Issue #2. Estado de referencia: backend `ef9356f`, migración `95ada29`, acuerdos confirmados e inicial incorporada a PR #9. No cierra incidencias ni autoriza fusión.

## Documentos vigentes

- [Contrato y acuerdos](../docs/data/CONTRATO_PACIENTE_S1.md).
- [Diccionario](../docs/data/DICCIONARIO_PACIENTE.md).
- [ERD con relación owner](../docs/data/ERD_S1.md).
- [Guía de ejecución con PostgreSQL e integración](../docs/api/INTEGRACION_LOCAL_S1.md).

La inicial ya existe en `backend/patients/migrations/0001_initial.py` y corresponde al modelo `patients.Patient`, tabla `patients_patient`. Fue generada por Diana desde `3028853` con Django 5.2.18 y conserva los cinco CHECK y la dependencia intercambiable de AUTH_USER_MODEL. No regenerarla ni mantener SQL paralelo.

## Entorno y evidencia publicada

Fernanda probó PostgreSQL 17.11, UTF8, proveedor ICU, locale `es` y versión de collation 153.14.37; LC_COLLATE/LC_CTYPE libc `C`. Su instancia temporal en 127.0.0.1:55439 fue detenida: ese puerto no constituye un servicio disponible.

La [evidencia de backend](../docs/api/VALIDACION_POSTGRESQL.md) registra migraciones aplicadas, segunda ejecución sin pendientes, 21 pruebas normales PostgreSQL, cinco CHECK, PK/FK y búsqueda con mayúsculas y acentos. Los [metadatos](../docs/api/postgresql-evidence.json) conservan el detalle del entorno. No se promete idéntico comportamiento con otra collation.

Diana revisó la evidencia y repitió 21 pruebas en SQLite con settings normales sobre `ef9356f`, sin cambios pendientes de modelo. Esa ejecución local no se presenta como nueva validación PostgreSQL.

## Repetir las comprobaciones

Seguir primero la guía enlazada para crear una base nueva y desechable, instalar las dependencias fijadas y configurar POSTGRES_DB/USER/PASSWORD/HOST/PORT mediante entorno. No publicar credenciales ni usar bases reales. Confirmar POSTGRES_DB para evitar el fallback SQLite. Desde la raíz del repositorio con el entorno Python activado:

```text
python backend/manage.py check
python backend/manage.py migrate --plan
python backend/manage.py migrate --noinput
python backend/manage.py showmigrations
python backend/manage.py makemigrations --check --dry-run
python backend/manage.py test --noinput
python backend/manage.py migrate --noinput
```

Detenerse si falla cualquier paso. Registrar motor, versión, encoding, locale/collation, commit y resultados sin secretos. La última migración debe informar que no hay pendientes. No usar settings que deshabiliten migraciones. La guía detalla el privilegio temporal para crear la base de pruebas; no es una recomendación para producción.

## Datos ficticios y pendientes

Los JSON del contrato son ejemplos, no fixtures ni datos cargados. Las pruebas usan exclusivamente datos ficticios. No versionar bases locales, volcados o archivos .env.

La evidencia del backend no sustituye la prueba conjunta con frontend, CI ni revisiones humanas. Las PR #6, #9 y #12 se mantienen abiertas y sin fusionar hasta la decisión de integración del equipo. Esta actualización solo corrige documentación de datos; no altera modelo, migración, permisos ni endpoints.
