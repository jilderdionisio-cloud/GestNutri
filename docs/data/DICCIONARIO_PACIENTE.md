# Diccionario de Paciente — Sprint 1

Responsable: Diana (`dianabojorquezcetina-max`). Referencias: Issues #2 y #3.

**Estado: acuerdos de datos confirmados para la inicial e implementados en la PR #9; integración pendiente.** Véase la trazabilidad del [contrato](CONTRATO_PACIENTE_S1.md). Los diez nombres siguientes son los campos canónicos externos de la API. No hay alias. Véanse [contrato](CONTRATO_PACIENTE_S1.md) y [ERD](ERD_S1.md).

| Campo canónico | Tipo JSON / Django / PostgreSQL | Entrada al crear | Nulidad y valor por defecto | Validación acordada | Ejemplo ficticio |
| --- | --- | --- | --- | --- | --- |
| `id` | string UUID / UUIDField(primary_key=True) / uuid | Solo lectura | NOT NULL; UUID v4 generado en servidor | Inmutable; no aceptar en entradas | `f58b634c-daf9-4b8c-9c23-a25f9c837fd2` |
| `first_name` | string / CharField(100) / varchar(100) | Obligatorio | NOT NULL; sin defecto | Recortar extremos; 1–100 caracteres; rechazar solo espacios; admitir acentos, espacios internos, guiones y apóstrofos | `Ana María` |
| `last_name` | string / CharField(150) / varchar(150) | Obligatorio | NOT NULL; sin defecto | Recortar extremos; 1–150 caracteres; mismas reglas que nombres | `Ejemplo Prueba` |
| `phone` | string / CharField(16) / varchar(16) | Obligatorio | NOT NULL; sin defecto | Formato internacional: `^\+[1-9][0-9]{7,14}$`; conservar como texto; no inferir país ni quitar dígitos | `+12025550123` |
| `email` | string / EmailField(254, blank=True) / varchar(254) | Opcional | NOT NULL; `""` al omitir | Recortar extremos; correo válido según validador de Django; máximo 254; `""` borra el valor | `ana.ejemplo@example.com` |
| `birth_date` | string de fecha o null / DateField(null=True, blank=True) / date | Opcional | NULL al omitir | Fecha real `AAAA-MM-DD`, no posterior a fecha local del servidor; `null` borra; no aceptar `""` | `1990-04-15` |
| `allergies` | string / TextField(blank=True) / text | Opcional | NOT NULL; `""` al omitir | Recortar extremos; máximo 2000 caracteres; texto plano; vacío significa no informado | `Alergia ficticia a cacahuate` |
| `restrictions` | string / TextField(blank=True) / text | Opcional | NOT NULL; `""` al omitir | Recortar extremos; máximo 2000 caracteres; texto plano; vacío significa no informado | `Restricción ficticia de lactosa` |
| `created_at` | string fecha-hora / DateTimeField(auto_now_add=True) / timestamp with time zone | Solo lectura | NOT NULL; servidor al crear | ISO 8601 en UTC, inmutable desde API | `2026-10-06T18:00:00Z` |
| `updated_at` | string fecha-hora / DateTimeField(auto_now=True) / timestamp with time zone | Solo lectura | NOT NULL; servidor al crear/actualizar | ISO 8601 en UTC; actualizado por servidor | `2026-10-06T18:00:00Z` |

## Reglas comunes

- UUID v4 está confirmado y generado por el servidor; el frontend trata `id` como identificador opaco.
- Solo `id` es único. Nombres, teléfono y correo pueden repetirse (familias pueden compartir contacto). No usar teléfono como clave primaria.
- `null` solo se acepta para `birth_date`. Un campo opcional omitido al crear usa el defecto de la tabla. En PATCH, omitir significa conservar; enviar `""` limpia un texto opcional y `null` limpia la fecha.
- No convertir números, booleanos, listas u objetos en texto automáticamente. La API valida tipo, longitud y formato antes de guardar.
- `allergies=""` no equivale a «sin alergias»: no hay información registrada. No inferir hechos clínicos a partir de un campo vacío.
- Obligatorios, límites, nulidad y no unicidad adicional fueron confirmados en la PR #9; no cambiar el modelo sin nueva coordinación.

## Reparto de validaciones

El servidor valida tipos, fechas y formatos. La inicial `backend/patients/migrations/0001_initial.py` conserva PK, NOT NULL, longitudes y cinco CHECK: nombres y apellidos no vacíos, formato internacional del teléfono y límites de 2000 para alergias/restricciones. La fecha futura se valida en servidor, no mediante un CHECK dinámico. Los validadores Django por sí solos no protegen escrituras SQL directas.

## Relación interna confirmada

`owner`: ForeignKey obligatoria a `settings.AUTH_USER_MODEL`, columna `owner_id` (entero para el User actual), NOT NULL, usuario 1:N pacientes, `on_delete=PROTECT` y dependencia intercambiable del modelo de usuario. Se asigna exclusivamente desde la sesión; no se acepta ni devuelve por API. No es un undécimo campo externo. Backend filtra por propietario, también para staff/superusuarios. PROTECT opera en Django; la FK de PostgreSQL preserva la integridad referencial.

No se añaden consultas, mediciones, notas ni documentos clínicos. Véase el [ERD](ERD_S1.md) y la [evidencia PostgreSQL de Fernanda](../api/VALIDACION_POSTGRESQL.md).
