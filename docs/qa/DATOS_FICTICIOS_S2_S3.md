# Datos ficticios — Sprint 2 y Sprint 3

Todos los valores son sintéticos. No usar contraseñas reales, historias clínicas reales, documentos personales ni secretos. Los campos S2 marcados como **propuestos** dependen de la confirmación de #21/#24.

| ID | Propósito | Datos sintéticos |
| --- | --- | --- |
| `QA-USR-A` / `QA-USR-B` | Aislamiento | Dos cuentas creadas solo en el entorno desechable; no versionar contraseñas. |
| `QA-S2-PAC-A` / `QA-S2-PAC-B` | Propiedad | Pacientes S1 ficticios distintos, uno por cuenta; registrar UUID generado. |
| `QA-S2-CONS-BASE` | Consulta válida propuesta | `occurred_at`: instante ISO 8601 con offset, anterior a la ejecución. |
| `QA-S2-CONS-FUTURA` | Fecha inválida | Instante posterior a la recepción del servidor. |
| `QA-S2-FECHA-SIN-ZONA` | Fecha inválida | Fecha/hora sin offset; usar solo si el contrato final conserva esa regla. |
| `QA-S2-PESO-BASE` | Peso propuesto válido | `"70.00"` kg; propuesta #21/#24, no rango clínico. |
| `QA-S2-EVO-AUMENTO` | Evolución propuesta | Consultas con `"70.00"` y `"71.25"`. |
| `QA-S2-EVO-DISMINUCION` | Evolución propuesta | Consultas con `"70.00"` y `"69.50"`. |
| `QA-S2-EVO-IGUAL` | Evolución propuesta | Consultas con `"70.00"` y `"70.00"`. |
| `QA-S2-SIN-MEDICION` | Dato insuficiente | Consulta sin Measurement, no peso cero. |
| `QA-S2-PESO-INVALIDO` | Negativos | `"0"`, `"-1.00"`, `"70.001"`, `"NaN"`, booleano y segunda medición; ejecutar solo contra reglas finales. |
| `QA-S2-NOTA-MANUAL` | Nota propuesta válida | `kind: note`, texto `Seguimiento ficticio sin interpretación clínica`. |
| `QA-S2-NOTA-INVALIDA` | Nota propuesta inválida | `kind` ajeno, texto blanco y 2001 caracteres. |
| `QA-S3-DOC-SINTETICO` | Documento S3 | Archivo de prueba no sensible solo tras acordar tipo/tamaño/retención; no subir hasta entonces. |

## Reglas de uso

1. Crear IDs y timestamps en ejecución y registrarlos sin exponer credenciales.
2. Preparar una base PostgreSQL nueva/desechable; eliminar o reiniciar según el procedimiento acordado.
3. No tratar peso/unidad, rutas, estados o límites propuestos como requisitos finales hasta aprobación explícita.
4. Para dos cuentas, conservar respuestas sanitizadas y evidencia de que B no accede a los recursos de A.
