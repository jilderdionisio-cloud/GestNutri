# Registro de resultados — Sprint 1

Use una fila por ejecución. No marcar `PASS` sin enlazar evidencia verificable. Estados permitidos: `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`.

| Fecha (ISO-8601) | Entorno | Rama / commit / PR | Caso | Datos ficticios | Resultado esperado | Resultado real | Evidencia | Estado | Defecto / bloqueo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-06 | Revisión de `develop` | `test/S1-qa-plan` / `2071dcc` / pendiente | S1-CI-01 | No aplica | Identificar comandos reproducibles para CI | No existen `backend/`, `frontend/`, `tests/` ni archivos de dependencias/comandos en `develop`; no se ejecutó CI | `git status`, inventario de archivos y matriz QA de esta PR | BLOCKED | Bloqueado por entregas #2, #3 y #4; no crear workflow especulativo |

## Plantilla para una nueva ejecución

| Fecha (ISO-8601) | Entorno | Rama / commit / PR | Caso | Datos ficticios | Resultado esperado | Resultado real | Evidencia | Estado | Defecto / bloqueo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AAAA-MM-DD | Local / CI / pruebas | `rama` / `sha` / `#PR` | `S1-HUXX-XX` | `QA-...` | Copiar de la matriz | Describir únicamente lo observado | Enlace a log, captura o salida de CI | NOT RUN | — |

## Criterio de evidencia

- Para API: comando exacto, código HTTP, solicitud/respuesta sin secretos y log adjunto/enlazado.
- Para UI: versión/commit, pasos, captura o video y resultado visible.
- Para migraciones/CI: comando exacto, entorno y salida completa relevante.
- Para un bloqueo: dependencia ausente, Issue/PR relacionada y siguiente responsable.
