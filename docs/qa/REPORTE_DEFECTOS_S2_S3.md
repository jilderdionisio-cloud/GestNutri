# Reporte de defectos — Sprint 2 y Sprint 3

## DEF-S2-API-001 — Parcialmente resuelto: aún se aceptan transporte no JSON y notación exponencial

- **Estado:** parcialmente resuelto; revisado en `c9b1a2965233b65b060ee6a30acceebf0a9e9a1d`.
- **Correcciones verificadas:** fecha sin offset, claves desconocidas, peso número JSON y JSON malformado devuelven 400.
- **Pasos pendientes:** con sesión válida, enviar consulta válida como `multipart/form-data`; enviar medición `{ "weight_kg": "7e1" }`.
- **Resultado actual:** ambos devuelven 201.
- **Resultado esperado:** 415 para tipo de contenido no JSON y 400 para notación exponencial; el contrato exige JSON estricto y cadena decimal sin exponente.

## DEF-S2-API-002 — Parcialmente resuelto: parámetros de paginación inválidos y detalle de nota pendientes

- **Estado:** parcialmente resuelto; revisado en `c9b1a2965233b65b060ee6a30acceebf0a9e9a1d`.
- **Correcciones verificadas:** listas de consulta/medición/nota/historial devuelven envoltura paginada; historial conserva orden descendente; detalles de consulta/medición devuelven 200 al dueño y 404 al ajeno.
- **Pasos pendientes:** solicitar historial con `page=abc`, `page=0`, `page_size=abc` o `page_size=-1`; solicitar `GET /api/v1/notes/{id}/` como dueño.
- **Resultado actual:** páginas inválidas devuelven 404 o 200, en vez de 400; detalle de nota devuelve 404 aun al dueño porque la ruta no existe.
- **Resultado esperado:** 400 para parámetros inválidos, 404 sólo para página inexistente/recurso ajeno, y detalle de nota autorizado.

## DEF-S2-API-003 — Resuelto en candidato: evolución incorpora el sexto estado `invalid_data`

- **Estado:** resuelto en candidato; verificado el 2026-10-07.
- **Versión de corrección:** PR #34 `e655221090cd2052c111644589bf8ce3984b5f6e` (implementación en `e8747db`).
- **Evidencia:** Action 37719637557 ejecutó la prueba `test_invalid_data_is_defensive_for_corrupt_persisted_weight` dentro de `accounts patients followup`, 31/31 contra `postgres:17`.
- **Resultado:** la vista prioriza peso no finito/fuera de rango y responde 200, `status: invalid_data`, `delta_kg: null`.
- **Límite pendiente:** el caso construye una lectura simulada con `SimpleNamespace(weight_kg=Decimal('NaN'))` y parches; no prueba una inserción o corrupción real en PostgreSQL.

Abrir un Issue por defecto reproducible: `BUG S2/S3: <resumen>`. Enlazar #20 o #28, el Issue propietario (#17–#19 o #25–#27), PR y SHA probados.

```md
## Trazabilidad
- Caso: `S2-...` o `S3-...`
- Área: datos / backend / frontend / CI
- PR y commit:

## Entorno y datos ficticios
- PostgreSQL/version/locale (si aplica):
- Datos `QA-...`:
- Sesión/cuenta: A o B, sin credenciales

## Pasos reproducibles
1. ...

## Esperado / real
<solo contrato final o criterio aprobado; no una propuesta>

## Evidencia
<URL de CI, salida sanitizada, captura/video; no secretos ni datos reales>

## Severidad
Crítica / alta / media / baja, con justificación.
```

Un bloqueo no es un defecto: registrar la dependencia concreta en la matriz y avisar al orquestador.
