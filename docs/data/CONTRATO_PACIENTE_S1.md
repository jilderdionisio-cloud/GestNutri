# Contrato de datos de Paciente — acuerdos de Sprint 1

Entrega inicial de Diana para desbloquear la coordinación con Fernanda (Issue #3) y Genny (Issue #4). Relacionado con #2; **no cierra #2**.

Estado al revisar `ef9356f`: acuerdos de datos confirmados, backend y migración implementados en PR #9; pendientes integración conjunta y decisión de fusión.

Trazabilidad: [confirmación de Fernanda](https://github.com/jilderdionisio-cloud/GestNutri/pull/9#issuecomment-6030448080), [autorización del orquestador](https://github.com/jilderdionisio-cloud/GestNutri/pull/9#issuecomment-6030509298), [migración de Diana, PR #12](https://github.com/jilderdionisio-cloud/GestNutri/pull/12) y [revisión cruzada de ef9356f](https://github.com/jilderdionisio-cloud/GestNutri/pull/9#issuecomment-6041945193).

## Fuente de verdad

[Diccionario de campos](DICCIONARIO_PACIENTE.md) y [modelo lógico](ERD_S1.md). Los nombres canónicos externos coinciden con el modelo; owner es exclusivamente interno. No usar `phoneNumber`, `nombre`, `birthDate` u otras variantes para esos campos.

## Ejemplos ficticios

Alta mínima:

```json
{"first_name":"Ana María","last_name":"Ejemplo Prueba","phone":"+12025550123"}
```

Objeto de respuesta (datos completamente ficticios):

```json
{
  "id": "f58b634c-daf9-4b8c-9c23-a25f9c837fd2",
  "first_name": "Ana María",
  "last_name": "Ejemplo Prueba",
  "phone": "+12025550123",
  "email": "ana.ejemplo@example.com",
  "birth_date": "1990-04-15",
  "allergies": "Alergia ficticia a cacahuate",
  "restrictions": "Restricción ficticia de lactosa",
  "created_at": "2026-10-06T18:00:00Z",
  "updated_at": "2026-10-06T18:00:00Z"
}
```

Edición parcial que elimina datos opcionales sin alterar los demás:

```json
{"email":"","birth_date":null,"restrictions":""}
```

## Semántica implementada en PR #9

- Crear exige `first_name`, `last_name` y `phone`; la respuesta incluye los diez campos, también los opcionales vacíos.
- PATCH valida solo los campos enviados y conserva los omitidos. PUT y DELETE no están expuestos: devuelven 405.
- `id`, `created_at` y `updated_at` son de solo lectura: rechazar su envío en solicitudes de escritura. Rechazar también nombres de campos desconocidos para detectar contratos incompatibles.
- Errores de validación: HTTP 400 con un objeto de listas de mensajes por campo; errores generales bajo `non_field_errors`. Ejemplo: `{"phone":["Usa formato internacional, por ejemplo +12025550123."]}`. Las frases no son identificadores estables.
- Las fechas no incluyen hora; timestamps se serializan en UTC. No guardar edad calculada ni prefijos regionales por separado.
- Para WhatsApp, la interfaz podrá derivar el destino quitando únicamente el signo `+` de un teléfono ya validado. No almacenar una URL adicional ni enviar mensajes automáticamente. Los ejemplos no se usan para contactar personas.
- La UI puede mostrar validaciones equivalentes para orientar; el servidor sigue siendo la autoridad. El [contrato API](../api/v1-patients.md) define las rutas, búsqueda y paginación.

## Acuerdos implementados y evidencia

- App `patients`, modelo `patients.Patient`, tabla `patients_patient`.
- Modelo base `3028853`; inicial de Diana `95ada29`, incorporada sin cambios a #9. No generar otra inicial.
- UUID v4, campos del diccionario, solo fecha nullable y contactos sin unicidad adicional.
- `owner` interno obligatorio, FK a AUTH_USER_MODEL con PROTECT, asignado desde sesión y no expuesto; aislamiento por profesional.
- Sesiones/CSRF según [autenticación](../api/v1-auth.md); GET/POST en `/api/v1/patients/`, GET/PATCH por UUID. Errores 400 por validación, 403 sesión/CSRF, 404 paciente inexistente o ajeno.
- Lista `{count,next,previous,results}`, página de 20 y máximo 100. Búsqueda de subcadenas en nombres, apellidos, teléfono y correo, máximo 150; orden `last_name/first_name/id`, siempre dentro del propietario.
- Django 5.2.18, DRF 3.16.1 y psycopg 3.3.6, fijados en requirements. Fernanda publicó evidencia de PostgreSQL 17.11, UTF8, ICU `es`, collation 153.14.37. En los casos probados `Ana María` coincide con `ana maría`, pero no con `ana maria`; otra collation requiere repetir pruebas.
- [Evidencia PostgreSQL](../api/VALIDACION_POSTGRESQL.md): 21 pruebas y migraciones reales reportadas por Fernanda. Revisión local de Diana: 21 pruebas SQLite con settings normales y sin cambios de modelo pendientes. No son la misma ejecución.

La validación publicada no constituye aprobación global de integración ni prueba conjunta con frontend. Mantener las PR #6/#9/#12 sin fusionar o cerrar hasta la decisión del equipo.

## Casos de aceptación del contrato

| Caso | Resultado esperado |
| --- | --- |
| Alta mínima del ejemplo | Persistir obligatorios; opcionales vacíos/NULL y valores de servidor |
| Falta nombre/apellidos/teléfono, o nombre solo espacios | Error del campo; sin escritura parcial |
| Longitud exactamente al límite / un carácter por encima | Aceptar / rechazar |
| Teléfono como número, sin `+`, con letras o fuera de 8–15 dígitos | Rechazar |
| Fecha inexistente, futura o cadena vacía | Rechazar; `null` sí válido |
| Correo vacío / correo mal formado | Aceptar / rechazar |
| NULL en texto opcional u obligatorio | Rechazar |
| Teléfono o correo compartido por dos pacientes | Permitir |
| PATCH omite un campo / lo limpia explícitamente | Conservar / limpiar según diccionario |
| Enviar ID, timestamp o campo desconocido | Rechazar |
| Actualizar paciente | Conservar ID/created_at y actualizar updated_at |
| Acceso de usuario no autorizado | Rechazar según sesión y propietario |

Esta tabla define criterios; los resultados ejecutados y sus límites se consultan en la evidencia enlazada. No representa una ejecución nueva de todos los casos.
