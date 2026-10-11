# Revisión de datos S2/S3: migraciones pendiente de modelo único

Estado al 2026-10-07 (revisión temporal de datos de Alex): **bloqueada de
forma intencional; no se generó ninguna migración ni se modificó un modelo**.

## Evidencia del origen

La base revisada es `develop` en
`c55c0c745545802e4ac3849366670d368808cba4`. No contiene la app `followup`,
un modelo `Consultation`, `Measurement` o `ManualNote`, ni archivos bajo
`backend/followup/`. La búsqueda en todas las referencias remotas disponibles
solo localizó los modelos y la inicial de `patients` del Sprint 1.

Por tanto, no hay SHA de modelo Django de Fernanda que pueda citarse como
origen de una migración S2. El SHA de origen requerido queda **pendiente de
publicación por Fernanda**. No se usan el ERD ni el contrato propuestos como
sustitutos del modelo: no son fuente para ejecutar `makemigrations`.

La única migración de pacientes presente es
`backend/patients/migrations/0001_initial.py`; no fue regenerada ni cambiada.

## Contrato revisado y comprobaciones futuras

Los Issues #17 y #25 y el borrador de API de la rama
`feature/HU-06-followup-api` fijan, una vez exista el modelo único acordado:

- app `followup`, `Consultation`, `Measurement` y `ManualNote`;
- `Patient 1:N Consultation`, `Consultation 0..1 Measurement` y
  `Consultation 0..N ManualNote`, con relaciones `PROTECT`;
- `Measurement.weight_kg` como decimal exacto `(6,2)`, mayor que cero y hasta
  `9999.99`, transportado como cadena decimal;
- historial/notas de consulta sin sobrescribir datos de `Patient`, y orden de
  evolución por `(occurred_at, created_at, id)` sin saltar consultas sin
  medición;
- dependencia de la inicial de `followup` en `patients.0001_initial`.

La migración se generará una sola vez con el modelo real publicado por
Fernanda, mediante `python manage.py makemigrations followup`. Antes de abrir
la revisión se contrastarán los campos y restricciones que realmente produzca
Django contra los puntos anteriores. Si hay diferencias, se detendrá la
migración y se coordinará con Fernanda; no se corregirán modelos, serializers,
endpoints ni frontend desde datos.

Para Sprint 3, Issue #25 también condiciona cualquier persistencia de
documentos de HU-13 a un contrato y modelo acordados con Fernanda. No existe
ninguno en la base revisada, por lo que no se creó almacenamiento, esquema ni
migración de documentos.

## Comandos ejecutados

Ejecutados contra las referencias remotas actualizadas:

```text
git fetch --all --prune
git log --all --oneline -- backend/followup
git ls-tree -r --name-only origin/develop | <filtro de modelos y migraciones>
git log --all --format='%H %an %s' -- '**/models.py' '**/migrations/*.py'
```

Resultado: no hay `backend/followup`, ni commit de modelo S2/S3; solo
`backend/patients/models.py` y `backend/patients/migrations/0001_initial.py`.

## Validación pendiente en PostgreSQL

No se ejecutaron migraciones ni pruebas de PostgreSQL para S2/S3, pues no hay
esquema que validar. Cuando esté publicado el SHA de origen, se ejecutarán en
una base PostgreSQL nueva y desechable, sin datos reales:

```text
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py migrate --plan
python manage.py migrate
python manage.py showmigrations
python manage.py migrate
```

Además se comprobarán en PostgreSQL la dependencia de pacientes, las FK
`PROTECT`, `UNIQUE` de una medición por consulta, los `CHECK` reales,
`weight_kg` decimal, notas históricas y la repetición sin operaciones
pendientes. Esas comprobaciones están pendientes, no aprobadas ni inferidas.

## Revisión

El `CODEOWNERS` de `develop` todavía asigna `/docs/data/` y migraciones solo a
Diana. La rama `chore/data-cross-reviewers` propone incluir temporalmente a
Alex y Fernanda, pero no está integrada en esta base. Cuando ese cambio esté
en `develop`, se solicitará revisión de Fernanda para la migración resultante;
no se aprobará ni fusionará trabajo propio.
