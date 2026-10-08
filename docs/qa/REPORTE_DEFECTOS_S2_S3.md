# Reporte de defectos — Sprint 2 y Sprint 3

## DEF-S2-API-001 — Las rutas S2 aceptan entradas que el contrato exige rechazar

- **Estado:** abierto; reproducido por QA el 2026-10-07.
- **Versión:** PR #34 `f00450ae450d97bbcad32c1887a6aac373d31c85`.
- **Entorno:** worktree aislado; Django 5.2.18/Python 3.13.14, SQLite temporal. Pendiente PostgreSQL.
- **Pasos:** con sesión/CSRF válida, enviar: (a) consulta con `occurred_at` sin offset; (b) consulta o nota con clave extra `unexpected`; (c) medición `{ "weight_kg": 70.0 }` como número JSON.
- **Resultado actual:** cada solicitud devuelve 201.
- **Resultado esperado:** 400 sin escritura parcial: la fecha debe incluir zona, las claves desconocidas se rechazan y `weight_kg` debe ser cadena decimal conforme al contrato.

## DEF-S2-API-002 — Historial sin paginación y faltan rutas de detalle comprometidas

- **Estado:** abierto; reproducido por QA el 2026-10-07.
- **Versión:** PR #34 `f00450ae450d97bbcad32c1887a6aac373d31c85`.
- **Pasos:** crear más de dos consultas, solicitar `GET /api/v1/patients/{id}/history/?page=1&page_size=2`; solicitar `GET /api/v1/consultations/{id}/` y `GET /api/v1/measurements/{id}/`.
- **Resultado actual:** historial devuelve una lista simple completa (6 elementos en la prueba), ignora paginación; los detalles devuelven 404 porque las rutas no existen.
- **Resultado esperado:** envoltura paginada acordada y rutas de detalle disponibles con autorización/404 para recursos ajenos.

## DEF-S2-API-003 — La evolución no implementa el sexto estado `invalid_data`

- **Estado:** abierto; reproducido por inspección y ejecución QA el 2026-10-07.
- **Versión:** PR #34 `f00450ae450d97bbcad32c1887a6aac373d31c85`.
- **Pasos:** revisar `followup/views.py` y ejecutar los cinco escenarios alcanzables: primera, aumento, disminución, igualdad y falta de medición.
- **Resultado actual:** se obtienen `first`, `increase`, `decrease`, `equal` e `insufficient_data`; la vista no contiene una rama/valor `invalid_data`.
- **Resultado esperado:** implementar y probar el sexto estado defensivo acordado, sin permitir persistir valores inválidos ni emitir `NaN`/`Infinity`.

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
