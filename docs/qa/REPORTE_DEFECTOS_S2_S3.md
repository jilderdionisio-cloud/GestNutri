# Reporte de defectos — Sprint 2 y Sprint 3

## DEF-S2-API-001 — Resuelto en candidato: transporte y decimal estrictos

- **Estado:** resuelto en candidato; verificado en `a520d079d800dcd1b2b6f9a9f53b623e3c88636e`.
- **Evidencia:** QA SQLite: multipart de consulta/medición/nota → 415 y `weight_kg: "7e1"` → 400; Action 37720944709: 32/32, incluyendo `followup` sobre `postgres:17`.
- **Límite:** requiere integración en `develop` antes de cerrar como entrega de Sprint.

## DEF-S2-API-002 — Resuelto en candidato: validación de página y detalle de nota

- **Estado:** resuelto en candidato; verificado en `a520d079d800dcd1b2b6f9a9f53b623e3c88636e`.
- **Evidencia:** QA SQLite: cuatro parámetros inválidos → 400; página inexistente → 404; `GET /notes/{id}/` → 200 dueño/404 ajeno. Action 37720944709 ejecutó `followup` en `postgres:17`.
- **Límite:** requiere integración en `develop` antes de cerrar como entrega de Sprint.

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
