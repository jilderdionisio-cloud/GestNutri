# Registro de resultados — Sprint 2 y Sprint 3

Estados permitidos: `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`. No usar `PASS` por propuesta documental, mock o declaración manual sin la evidencia requerida por el Issue.

| Fecha | Entorno | Rama / commit / PR | Caso | Resultado real | Evidencia | Estado | Dependencia o defecto |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-07 | Revisión documental remota | #21 `25a094c`, #24 `e6f4e13`, #22 `9699efa` | Preparación S2/S3 | Se revisaron propuestas de datos/API y frontend visual. #21/#24 declaran que no hay modelo, migración ni endpoints; #22 declara que no realiza red/escritura S2. | PR #21, #22, #24 e Issues #17–#28 | PASS | PASS solo de revisión documental; todos los casos funcionales S2/S3 siguen bloqueados por implementación/contrato |
| 2026-10-07 | `develop` integrado | `develop` `c55c0c7` | S2-CI-01 / S3-E2E-01 | No ejecutado: no hay implementación S2/S3 integrada ni comandos aplicables para seguimiento, IA, documentos o auditoría. | Inventario de `develop`; PRs #21/#22/#24 abiertas/borrador | BLOCKED | Esperar migración, API, UI y contratos finales; no confundir CI S1 con cobertura S2/S3 |
| 2026-10-07 | Aislado local Windows | PR #22 `9699efa102861490f748a739616b07cfd04ef67d`; Node `v24.15.0`, npm `11.12.1` | S2-FE-PREP-01 | `npm ci` instaló 87 paquetes sin vulnerabilidades; `npm test` aprobó 7 pruebas Node + 4 de componentes y `npm run build` completó. | Salida QA: 11 pruebas aprobadas; Vite build completado en 2.03 s. | PASS | Alcance de mocks/preparación: no hubo llamada S2, API, PostgreSQL, dos cuentas ni prueba manual de UI. |

## Evidencia mínima por ejecución

- API/PostgreSQL: SHA, variables no sensibles, versión/locale PostgreSQL, comandos, códigos HTTP y respuestas sanitizadas.
- UI: SHA, pasos, captura/video o artefacto enlazado; estado visible de éxito/error/vacío.
- IA/documentos: configuración aprobada o fallback, sin prompts, archivos, tokens ni datos reales.
- CI: URL del run, job, comandos y conclusión.
