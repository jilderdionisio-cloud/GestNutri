# Matriz de pruebas — Sprint 1

**Fuente de requisitos:** Issue #5 (S1-QA), #2 (datos), #3 (backend) y #4 (frontend).  
**Estado de la matriz:** diseño inicial; no sustituye los contratos aprobados de datos ni API.  
**Última revisión:** 2026-10-06.  
**Leyenda:** `NOT RUN` = listo para ejecutar, aún no ejecutado. `BLOCKED` = una dependencia impide ejecutarlo. Ningún caso se registra como `PASS` sin evidencia de ejecución.

| ID | Historia | Prioridad | Precondición / dependencia | Datos ficticios | Pasos resumidos | Resultado esperado | Resultado real | Evidencia | Estado | Defecto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S1-HU01-01 | HU-01 Inicio de sesión | Crítica | Contrato de autenticación, usuario ficticio y entorno disponibles | `QA-USR-VALIDO` | Enviar credenciales válidas | Se concede acceso según contrato; no se exponen datos sensibles | Pendiente | Pendiente | BLOCKED | — |
| S1-HU01-02 | HU-01 Inicio de sesión | Alta | Endpoint/UI de login disponibles | `QA-USR-INVALIDO` | Enviar credenciales inválidas | Se rechaza con el error/código definido; sin filtrar información sensible | Pendiente | Pendiente | BLOCKED | — |
| S1-HU01-03 | HU-01 Inicio de sesión | Alta | UI y contrato disponibles | Sin credenciales | Intentar enviar campos vacíos | Se muestran las validaciones definidas y no se inicia sesión | Pendiente | Pendiente | BLOCKED | — |
| S1-HU01-04 | HU-01 Autorización | Crítica | Recurso protegido y sesión de prueba disponibles | Sin sesión | Solicitar recurso de pacientes sin autenticación | Respuesta 401/403 conforme al contrato, sin datos de pacientes | Pendiente | Pendiente | BLOCKED | — |
| S1-HU02-01 | HU-02 Lista | Crítica | Migración, API/UI y pacientes ficticios disponibles | `QA-PAC-COMPLETO`, `QA-PAC-OPCIONALES-VACIOS` | Abrir listado | Se visualiza la lista con nombres/campos definidos por el contrato | Pendiente | Pendiente | BLOCKED | — |
| S1-HU02-02 | HU-02 Lista vacía | Alta | API/UI con respuesta vacía controlable | `QA-LISTA-VACIA` | Abrir listado sin pacientes | Se muestra el estado vacío comprensible definido por UI | Pendiente | Pendiente | BLOCKED | — |
| S1-HU02-03 | HU-02 Búsqueda con coincidencia | Alta | Parámetro de búsqueda documentado | `QA-PAC-COMPLETO` | Buscar por el criterio acordado que sí coincide | Se devuelve/muestra solamente la coincidencia esperada | Pendiente | Pendiente | BLOCKED | — |
| S1-HU02-04 | HU-02 Búsqueda sin coincidencia | Alta | Parámetro de búsqueda documentado | `QA-BUSQUEDA-SIN-COINCIDENCIA` | Buscar un valor inexistente | Se muestra resultado vacío, sin error ni datos incorrectos | Pendiente | Pendiente | BLOCKED | — |
| S1-HU02-05 | HU-02 Error de carga | Media | UI con error de API simulable o endpoint controlable | `QA-ERROR-CARGA` | Provocar error de carga | Se muestra error comprensible y sin información sensible | Pendiente | Pendiente | BLOCKED | — |
| S1-HU03-01 | HU-03 Alta | Crítica | Contrato de campos/validaciones, API/UI y persistencia disponibles | `QA-PAC-COMPLETO` | Capturar y guardar paciente válido | Se crea conforme al contrato y queda disponible para consulta | Pendiente | Pendiente | BLOCKED | — |
| S1-HU03-02 | HU-03 Obligatorios | Alta | Campos obligatorios aprobados | `QA-ENTRADAS-INVALIDAS` | Omitir cada campo obligatorio y enviar | Se rechaza cada omisión con errores definidos; no persiste registro inválido | Pendiente | Pendiente | BLOCKED | — |
| S1-HU03-03 | HU-03 Formato y límites | Alta | Reglas de formato/límites aprobadas | `QA-ENTRADAS-INVALIDAS` | Enviar formatos y longitudes inválidos | Se aplican las validaciones de contrato en servidor y se comunican en UI | Pendiente | Pendiente | BLOCKED | — |
| S1-HU03-04 | HU-03 Cancelar | Media | Formulario disponible | `QA-PAC-COMPLETO` | Iniciar captura y cancelar sin guardar | No se persiste el paciente ni cambios parciales | Pendiente | Pendiente | BLOCKED | — |
| S1-HU03-05 | HU-03 Edición | Crítica | Paciente existente, detalle y actualización disponibles | `QA-PAC-COMPLETO` | Modificar un dato permitido y guardar | Se actualiza el dato correcto sin perder los restantes; persiste tras recarga | Pendiente | Pendiente | BLOCKED | — |
| S1-HU04-01 | HU-04 Expediente | Crítica | Detalle de paciente disponible | `QA-PAC-COMPLETO` | Abrir expediente del paciente creado | Muestra identificación/contacto, alergias y restricciones conforme al contrato | Pendiente | Pendiente | BLOCKED | — |
| S1-HU04-02 | HU-04 Opcionales vacíos | Alta | Detalle disponible | `QA-PAC-OPCIONALES-VACIOS` | Abrir expediente con opcionales ausentes | Los opcionales se representan conforme al contrato sin error ni datos inventados | Pendiente | Pendiente | BLOCKED | — |
| S1-HU04-03 | HU-04 No encontrado | Alta | Ruta/detalle disponible | `QA-ID-INEXISTENTE` | Solicitar paciente inexistente | Se informa no encontrado con respuesta/mensaje definido y sin datos sensibles | Pendiente | Pendiente | BLOCKED | — |
| S1-HU04-04 | HU-04 Error de carga | Media | Error de API simulable o endpoint controlable | `QA-ERROR-CARGA` | Provocar error al abrir expediente | Se muestra error comprensible y no se presentan datos obsoletos como actuales | Pendiente | Pendiente | BLOCKED | — |
| S1-INT-01 | Flujo integrado | Crítica | HU-01 a HU-04 integradas, contratos y entorno disponibles | `QA-USR-VALIDO`, `QA-PAC-COMPLETO` | Autenticarse → listar/buscar → crear → abrir expediente → editar → recargar | El paciente creado conserva los cambios y UI/API/datos coinciden | Pendiente | Pendiente | BLOCKED | — |
| S1-SEC-01 | Transversal | Crítica | API y UI disponibles | Sin sesión, entradas inválidas | Repetir accesos no autorizados y errores de validación/carga | 401/403 y errores no revelan credenciales, trazas ni datos de otros pacientes | Pendiente | Pendiente | BLOCKED | — |
| S1-CON-01 | Transversal | Alta | Diccionario, API y UI aprobados | `QA-PAC-COMPLETO` | Comparar nombres, tipos, opcionalidad y errores en las tres capas | Sin discrepancias entre contrato de datos, API y representación UI | Pendiente | Pendiente | BLOCKED | — |
| S1-CI-01 | CI inicial | Alta | Comandos backend/frontend estables y documentados | No aplica | Ejecutar los comandos publicados en un clon limpio | Los comandos terminan correctamente, sin credenciales reales; resultados adjuntos a CI | Pendiente | Pendiente | BLOCKED | — |

## Bloqueadores actuales

1. Los Issues #2, #3 y #4 continúan abiertos: no hay contrato de datos, contrato de API, migración, implementación ni entorno de prueba en `develop`.
2. El repositorio actual no contiene `backend/`, `frontend/`, `tests/`, archivos de dependencias ni comandos de prueba reproducibles.
3. Por los dos puntos anteriores, no se crea aún un workflow definitivo en `.github/workflows/`; hacerlo antes produciría un CI especulativo y no ejecutable.

Cuando las dependencias se integren, actualizar cada fila con fecha, rama/commit/PR, resultado real, enlace a evidencia y estado final en `REGISTRO_RESULTADOS_S1.md`.
