# Sprint 2: propuesta de contrato de datos

Estado: propuesta de Diana para coordinación, no contrato aprobado ni esquema implementado.
Referencia: [datos #17](https://github.com/jilderdionisio-cloud/GestNutri/issues/17), [backend #18](https://github.com/jilderdionisio-cloud/GestNutri/issues/18). Cubre HU-06 a HU-10. No incluye IA ni interpretación clínica.

## Base y dependencias

Esta entrega documental parte de `develop` en `3ea9253`. En esa base todavía no están integrados Patient ni su inicial del Sprint 1. La referencia de compatibilidad es el backend `ef9356f` de PR #9 y la migración `95ada29` de PR #12; no se copian ni regeneran aquí. Los cambios documentales pendientes de Sprint 1 siguen conservados en `codex/data-docs-confirmed` (`5512626`).

Antes de migrar se requiere: Sprint 1 integrado; confirmación escrita de Fernanda del contrato, app, nombres de modelos/tablas, ruta, dependencia de migración y commit del modelo real; revisión de alcance por el orquestador. No se presupone que estos nombres conceptuales sean nombres Django definitivos. Fernanda y Diana deben acordar quién materializa el modelo en backend, porque #17 limita esta entrega a datos/documentación/migraciones y #18 prohíbe modelos paralelos.

## Relaciones propuestas

- Patient conserva su UUID y `owner` de Sprint 1. El profesional se obtiene de `Patient.owner`, no de un identificador enviado por el cliente.
- Consultation pertenece a un Patient mediante FK obligatoria y `PROTECT`. Patient 1:N Consultation. No duplicar `owner` en cada tabla: evita propietarios contradictorios. Confirmar si se necesita autor histórico distinto del propietario; no se implementa sin acuerdo.
- Measurement pertenece a una Consultation mediante relación 1:0..1 y `PROTECT`; la relación es obligatoria y única en Measurement. Una consulta puede existir sin medición. Confirmar si realmente se necesita más de una medición por consulta antes de ampliar cardinalidad.
- ManualNote pertenece a una Consultation mediante FK obligatoria y `PROTECT`; una consulta admite 0..N notas manuales. La nota no constituye un diagnóstico ni contenido generado por IA.
- Historial y evolución son lecturas derivadas; no requieren tablas que dupliquen consultas o diferencias.

La API debe comprobar la propiedad siguiendo `consulta.patient.owner` en toda lectura/escritura, incluidas mediciones y notas. La FK garantiza la relación, no autoriza acceso. No aceptar ni exponer `owner` nuevo. La transferencia de pacientes, eliminación y reasignación de consultas quedan fuera de esta propuesta y requieren coordinación explícita.

## Diccionario propuesto

Los nombres siguientes son únicos y canónicos dentro de esta propuesta; Fernanda confirma su adopción antes de publicar el contrato API. Todos los IDs propuestos son UUID v4 generados por servidor; timestamps conscientes de zona horaria, almacenamiento UTC y transporte ISO 8601 con offset.

| Entidad | Campo | Tipo y obligatoriedad | Regla propuesta |
| --- | --- | --- | --- |
| Consultation | id | UUID, PK | Generado por servidor |
| Consultation | patient | FK Patient, no nulo | Paciente del profesional autenticado; PROTECT |
| Consultation | occurred_at | datetime con zona, no nulo | Momento de la consulta; rechazar fecha sin zona y posterior al instante de recepción del servidor |
| Consultation | created_at | datetime, no nulo | Servidor, inmutable |
| Consultation | updated_at | datetime, no nulo | Servidor |
| Measurement | id | UUID, PK | Generado por servidor |
| Measurement | consultation | FK única, no nula | Una medición por consulta; PROTECT |
| Measurement | weight_kg | decimal(6,2), no nulo | Propuesta mínima para evolución: kilogramos, >0 y <=9999.99; límite técnico, no rango clínico |
| Measurement | created_at | datetime, no nulo | Servidor |
| Measurement | updated_at | datetime, no nulo | Servidor |
| ManualNote | id | UUID, PK | Generado por servidor |
| ManualNote | consultation | FK, no nula | Consulta del mismo profesional; PROTECT |
| ManualNote | kind | texto, no nulo | `note`, `preference` o `restriction`; CHECK de pertenencia |
| ManualNote | text | texto, no nulo | 1..2000 caracteres después de recortar extremos; debe contener texto no blanco |
| ManualNote | created_at | datetime, no nulo | Servidor |
| ManualNote | updated_at | datetime, no nulo | Servidor |

Peso es una propuesta, no un requisito clínico confirmado por los Issues. No se agregan talla, IMC, perímetros, diagnósticos, objetivos, fórmulas o rangos clínicos sin confirmar las HU y unidades con Fernanda/orquestador. El límite decimal es de representación y no debe presentarse al usuario como recomendación de salud. Si se acuerdan otras mediciones, cada una necesita nombre, unidad, precisión, nulidad y regla de comparación propios.

## Nulos, validación y restricciones

No hay campos numéricos vacíos ni cadenas `"null"`: una consulta sin medición se representa por ausencia de Measurement; la lectura derivada puede representar su peso con JSON null. No se usa cero como ausencia. Rechazar booleanos, NaN, infinito, negativos, cero, exceso de dos decimales y valores fuera de representación, sin redondeo silencioso. API y persistencia deben coordinarse: un numeric de PostgreSQL puede redondear exceso de escala; no se afirmará que un CHECK sustituye la validación previa del servidor.

Checks previstos: peso positivo/finito dentro del máximo, `kind` permitido, texto no blanco y longitud máxima. FK/PK/UNIQUE aseguran identidad y cardinalidad. `occurred_at <= ahora` es validación de servidor, no CHECK basado en tiempo cambiante. Verificar SQL real generado en PostgreSQL, incluida la semántica de NaN y el patrón de texto, antes de dar por válidas las restricciones.

Las notas/preferencias/restricciones de consulta son históricas y no sobreescriben `Patient.allergies` o `Patient.restrictions` del Sprint 1. Confirmar expresamente este alcance: si las preferencias deben ser permanentes de paciente, se requiere otro acuerdo de entidad y no duplicar el mismo dato en ambas rutas.

## Historial y evolución determinista

Historial por paciente: consultas descendentes por `(occurred_at, created_at, id)`. Desempates por UUID son estables, no significan anterioridad clínica. Notas dentro de consulta: ascendentes por `(created_at, id)`. Fernanda publica el formato de paginación; el orden se aplica antes de paginar.

Para evolucionar una consulta, ordenar todas las consultas del paciente ascendentemente por la misma terna y usar la inmediatamente anterior, aunque no tenga medición. No saltar valores ausentes para producir una comparación aparente. No comparar con otro paciente ni con el elemento anterior de una página incompleta. Si se permiten registros retroactivos, recalcular por el orden cronológico; las diferencias no se almacenan.

Propuesta de resultado lógico, a mapear por Fernanda al contrato API: `status`, `previous_consultation_id`, `previous_weight_kg`, `current_weight_kg`, `delta_kg`. Estados: `first`, `increase`, `decrease`, `equal`, `insufficient_data`, `invalid_data`. Diferencia decimal exacta `actual - anterior`, en kg, dos decimales, sin porcentajes ni calificar como mejor/peor.

Precedencia: (1) un valor presente inválido produce `invalid_data`; (2) sin consulta anterior, `first` aun si falta medición actual; (3) si existe anterior y falta alguno de los dos pesos, `insufficient_data`; (4) con dos valores válidos comparar diferencia con cero. Para estados no comparables, `delta_kg=null`. Valores inválidos no deben persistirse ni sustituirse por cero; `invalid_data` documenta una respuesta defensiva ante datos heredados/corruptos, no permite aceptarlos.

| Caso | Anterior kg | Actual kg | Estado | Delta kg |
| --- | --- | --- | --- | --- |
| Primera consulta | no existe consulta | 70.00 | first | null |
| Primera sin medición | no existe consulta | null | first | null |
| Aumento | 70.00 | 71.25 | increase | 1.25 |
| Disminución | 70.00 | 69.50 | decrease | -0.50 |
| Igualdad | 70.00 | 70.00 | equal | 0.00 |
| Sin medición anterior | null | 70.00 | insufficient_data | null |
| Sin medición actual | 70.00 | null | insufficient_data | null |
| Valor inválido presente | 70.00 | -1.00 | invalid_data / rechazar escritura | null |

## Decisiones que se solicitan a Fernanda y al orquestador

1. Confirmar el conjunto de mediciones de las HU: ¿peso en kg con dos decimales basta? Confirmar límites técnicos o aportar rangos funcionales expresos; no inventar rangos clínicos.
2. Confirmar Consultation, Measurement 0..1 por consulta y ManualNote 0..N con categorías, notas históricas frente a campos de Patient y propiedad derivada sin duplicar owner.
3. Confirmar fechas con zona, regla de futuro, nulos, no redondeo, orden/desempates y comparación con consulta inmediatamente anterior; adoptar/corregir los seis estados que cubren los cinco grupos de casos exigidos.
4. Confirmar app, modelos/tablas, ruta y dependencia de migración, autor del modelo y commit aprobado. No crear inicial paralela ni alterar la de Sprint 1.
5. Confirmar base integrada de Sprint 1 y entorno PostgreSQL nuevo/desechable para pruebas. Solo entonces generar la migración desde el modelo acordado y registrar evidencia.

No se declara ningún punto confirmado por silencio ni se cierra #17 con esta propuesta.
