# Registro de resultados — Sprint 1

Use una fila por ejecución. No marcar `PASS` sin enlazar evidencia verificable. Estados permitidos: `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`.

| Fecha (ISO-8601) | Entorno | Rama / commit / PR | Caso | Datos ficticios | Resultado esperado | Resultado real | Evidencia | Estado | Defecto / bloqueo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-06 | Revisión documental remota | `feature/HU-02-patient-data` / `81f2b36` / [#6](https://github.com/jilderdionisio-cloud/GestNutri/pull/6) | S1-DATA-01 | No aplica | Diccionario, contrato, ERD y guía coherentes; pendientes explícitos | Se revisaron los cuatro documentos: 10 campos y semántica propuesta consistentes. Persisten pendientes de aprobación, app/ruta, permisos, migración y comandos | Diff y archivos de PR #6 | PASS | No aplica: revisión documental ejecutada; no acredita migración ni pruebas funcionales |
| 2026-10-06 | Worktree aislado, SQLite temporal | `feature/HU-01-backend-base` / `3028853` / [#9](https://github.com/jilderdionisio-cloud/GestNutri/pull/9) | S1-BE-01 a S1-BE-04 | Usuarios y pacientes ficticios creados por la suite | Autenticación, permisos, pacientes y validaciones conforme al borrador API | `pip check`: sin dependencias rotas; `manage.py check`: sin incidencias; 20 pruebas aprobadas en 3.256 s | `DJANGO_DEBUG=true`; `python -m pip check`; `manage.py check`; `manage.py test --settings=config.test_settings -v 2` | PASS | Cobertura temporal SQLite; no valida migración ni PostgreSQL |
| 2026-10-06 | Worktree aislado, SQLite temporal | `feature/HU-01-backend-base` / `3028853` / [#9](https://github.com/jilderdionisio-cloud/GestNutri/pull/9) | S1-BE-05 | No aplica | No deben quedar migraciones pendientes; validar PostgreSQL | `manage.py makemigrations patients --check --dry-run --verbosity 2` propone crear `patients/migrations/0001_initial.py`; PostgreSQL no está configurado ni probado | Salida del comando anterior | BLOCKED | Falta migración de pacientes coordinada con #2 y entorno PostgreSQL |
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
