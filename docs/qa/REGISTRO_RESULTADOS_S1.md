# Registro de resultados — Sprint 1

Use una fila por ejecución. No marcar `PASS` sin enlazar evidencia verificable. Estados permitidos: `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`.

| Fecha (ISO-8601) | Entorno | Rama / commit / PR | Caso | Datos ficticios | Resultado esperado | Resultado real | Evidencia | Estado | Defecto / bloqueo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-06 | Revisión documental remota | `feature/HU-02-patient-data` / `81f2b36` / [#6](https://github.com/jilderdionisio-cloud/GestNutri/pull/6) | S1-DATA-01 | No aplica | Diccionario, contrato, ERD y guía coherentes; pendientes explícitos | Se revisaron los cuatro documentos: 10 campos y semántica propuesta consistentes. Persisten pendientes de aprobación, app/ruta, permisos, migración y comandos | Diff y archivos de PR #6 | PASS | No aplica: revisión documental ejecutada; no acredita migración ni pruebas funcionales |
| 2026-10-06 | Revisión de `develop` | `develop` / `2071dcc` / pendiente | S1-CI-01 | No aplica | Identificar comandos reproducibles para CI | `backend/`, `frontend/` y `tests/` existen solo con `.gitkeep`; faltan manifiestos de dependencias, pruebas ejecutables y comandos reproducibles. No se ejecutó CI | Inventario de archivos de `develop` (`git ls-tree -r --name-only 2071dcc`) y matriz QA de esta PR | BLOCKED | Bloqueado por entregas #2, #3 y #4; no crear workflow especulativo |

## Plantilla para una nueva ejecución

| Fecha (ISO-8601) | Entorno | Rama / commit / PR | Caso | Datos ficticios | Resultado esperado | Resultado real | Evidencia | Estado | Defecto / bloqueo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AAAA-MM-DD | Local / CI / pruebas | `rama` / `sha` / `#PR` | `S1-HUXX-XX` | `QA-...` | Copiar de la matriz | Describir únicamente lo observado | Enlace a log, captura o salida de CI | NOT RUN | — |

## Criterio de evidencia

- Para API: comando exacto, código HTTP, solicitud/respuesta sin secretos y log adjunto/enlazado.
- Para UI: versión/commit, pasos, captura o video y resultado visible.
- Para migraciones/CI: comando exacto, entorno y salida completa relevante.
- Para un bloqueo: dependencia ausente, Issue/PR relacionada y siguiente responsable.
