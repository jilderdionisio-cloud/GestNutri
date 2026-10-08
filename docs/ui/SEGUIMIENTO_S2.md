# Sprint 2 — preparación visual de seguimiento

Issue #19. Rama feature/HU-06-followup-frontend, creada desde develop a255e23 (Sprint 1 integrado).

## Alcance disponible

Desde el expediente de Sprint 1, Abrir seguimiento nutricional conserva el contexto del paciente y ofrece Consultas, Mediciones, Historial, Evolución y Notas manuales. Volver al expediente mantiene el mismo paciente; volver a la lista y salir conservan sus flujos de Sprint 1.

Solo preparación visual. No crea campos, payloads, URLs ni cálculos de Sprint 2. No registra consultas/mediciones/notas ni muestra datos clínicos ficticios como resultados de API. Botones de registro deshabilitados con explicación. La vista vuelve a consultar el paciente usando el adaptador existente de Sprint 1: sesión/CSRF y permisos se conservan.

En npm run dev se puede desplegar Vista previa de estados para inspeccionar carga, vacío, error y validación. Son estados explícitamente simulados, no respuestas reales. En build/producción ese control no aparece. Cambio de sección reinicia la vista previa y mueve foco al encabezado; cambio de paciente reinicia el componente. El futuro adaptador deberá conservar errores por campo, paginación y semántica de nulos publicados por backend.

## Dependencias revisadas

- Diana: docs/data/S2_CONTRATO_PROPUESTO.md en PR #21, commit 25a094cc5fe1a3ac4d8c507d73a18c1647c54729. El documento dice propuesta, no contrato aprobado.
- Fernanda: issue #18, sin documentos API Sprint 2 ni endpoints publicados en las ramas disponibles al revisar. No hay acuerdo escrito en comentarios de #18/#21.

La propuesta de Diana describe occurred_at, weight_kg y categorías/texto de notas, pero no se trasladan a controles editables ni modelos frontend hasta aprobación conjunta. Tampoco se adoptan sus estados de evolución como respuestas de API. No se interpreta la ausencia de comentarios como aprobación.

## Trabajo pendiente para completar #19

1. Recibir contrato aprobado de datos/API con campos, unidades, obligatoriedad, fechas, nulos, categorías, rutas/métodos, payloads, errores, orden y paginación.
2. Confirmar SHA backend/modelos/migraciones e instrucciones PostgreSQL desechable.
3. Definir campos centralizados de frontend y validaciones exclusivamente a partir del contrato.
4. Conectar consultas, mediciones, historial, evolución y notas al cliente autenticado. Mostrar resultados del cálculo backend sin recalcularlos en JavaScript.
5. Probar aumento, disminución, igualdad, primera consulta y nulos/inválidos de API real; comprobar persistencia tras recarga y aislamiento de propietarios.
6. Registrar SHA y evidencia de navegador/HTTP real, CI aplicable y revisiones.

## Comandos y comprobaciones

Node 22.22.2+ (rama 22), 24.15+ (rama 24) o 26+ para las dependencias de pruebas actuales; verificado con Node 24.18.0. Desde frontend/: npm ci, npm test, npm run build, npm run dev. npm test incluye siete pruebas existentes de Sprint 1 más cuatro de componentes Sprint 2 mediante Vitest/jsdom/Testing Library. Pasan 11/11 y build. npm run test:components ejecuta solo las cuatro de componentes.

Para API Sprint 1: frontend/.env local con VITE_DATA_MODE=api, reiniciar Vite y mantener backend/PostgreSQL disponibles. .env continúa ignorado. Para recorrer la estructura visual sin backend, iniciar con VITE_DATA_MODE=mock; eso no acredita la integración final Sprint 2.

Pruebas de componentes: paciente/retorno, cinco secciones y foco, bloqueo de escritura/ausencia de solicitudes, estados de presentación y limpieza al navegar/cambiar paciente. No prueban API Sprint 2 inexistente.

Entrega parcial en PR borrador; no cierra #19 ni declara integración API, E2E o CI del código Sprint 2 completos. El workflow transitorio actual usa fuentes fijas de Sprint 1 y no valida esta rama.

Revisión manual del navegador (modo mock, solo estructura): acceso Sprint 1 → expediente → seguimiento → cinco secciones → carga/vacío/error/validación simulados → regreso al expediente del mismo paciente. Captura SEGUIMIENTO_S2.png. Esta revisión no acredita llamadas ni persistencia Sprint 2.
