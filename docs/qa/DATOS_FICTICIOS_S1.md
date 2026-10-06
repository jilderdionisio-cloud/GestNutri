# Datos ficticios — Sprint 1

Estos datos son sintéticos, anónimos y exclusivamente para pruebas. No contienen personas reales, credenciales reales, secretos ni bases de datos. Los nombres de campo son una **propuesta de datos de prueba**, basada en los campos que #2 debe acordar; no constituyen ni reemplazan el diccionario ni el payload de API.

## Conjunto de datos

| ID | Propósito | Valores sintéticos |
| --- | --- | --- |
| `QA-USR-VALIDO` | Inicio de sesión válido | Cuenta de prueba que el backend cree para el entorno; identificarla en el entorno, nunca versionar una contraseña. |
| `QA-USR-INVALIDO` | Inicio de sesión rechazado | Identificador ficticio `qa.invalido@example.test` y contraseña de prueba generada en ejecución; no reutilizar credenciales reales. |
| `QA-PAC-COMPLETO` | Alta, lista, búsqueda, detalle y edición | Según la propuesta v1 de PR #6: `first_name`: `Iris`; `last_name`: `Prueba Rivera`; `phone`: `+525550102020`; `email`: `iris.prueba@example.test`; `birth_date`: `1990-01-15`; `allergies`: `Ninguna conocida`; `restrictions`: `Sin restricciones`. |
| `QA-PAC-OPCIONALES-VACIOS` | Validar representación de opcionales | Según la propuesta v1 de PR #6: `first_name`: `Noa`; `last_name`: `Control`; `phone`: `+525550102021`; `email`, `allergies` y `restrictions`: `""`; `birth_date`: `null`. Usar esta forma solo cuando la propuesta se apruebe o el contrato final conserve su semántica. |
| `QA-LISTA-VACIA` | Estado vacío | Entorno aislado sin pacientes o respuesta simulada vacía autorizada por el propietario de la capa. |
| `QA-BUSQUEDA-SIN-COINCIDENCIA` | Búsqueda sin resultado | Texto: `ZZZ-NO-COINCIDE-S1`. |
| `QA-ID-INEXISTENTE` | Detalle no encontrado | Identificador inexistente creado conforme al formato de ID publicado por backend; no asumir un tipo de ID antes del contrato. |
| `QA-ENTRADAS-INVALIDAS` | Validaciones | Omitir un campo obligatorio por ejecución; usar fecha/formato/límite inválido solo cuando #2/#3 publiquen la regla concreta. |
| `QA-ERROR-CARGA` | Estados de error | Forzar respuesta de error mediante mecanismo de prueba documentado (mock/adaptador o entorno controlado); nunca mediante datos reales ni manipulación de producción. |

## Uso seguro y trazabilidad

1. Cargar los datos solo en un entorno local o de pruebas aislado tras recibir las instrucciones de migración y carga de #2/#3.
2. Registrar el identificador efectivo que genere el servidor en el resultado de la ejecución; no fijar ni suponer su formato.
3. Eliminar o reiniciar el entorno de pruebas al terminar según el procedimiento del propietario de datos/backend.
4. Si el contrato cambia, actualizar este documento y la matriz antes de ejecutar casos afectados. En particular, confirmar primero la propuesta de PR #6 con backend y el orquestador.
