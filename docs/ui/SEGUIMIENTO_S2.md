# Sprint 2 — preparación visual de seguimiento

Issue #19. Rama feature/HU-06-followup-frontend, creada desde develop a255e23 (Sprint 1 integrado).

## Alcance disponible

Desde el expediente de Sprint 1, Abrir seguimiento nutricional conserva el contexto del paciente y ofrece Consultas, Mediciones, Historial, Evolución y Notas manuales. Volver al expediente mantiene el mismo paciente; volver a la lista y salir conservan sus flujos de Sprint 1.

Solo preparación visual. No crea campos, payloads, URLs ni cálculos de Sprint 2. No registra consultas/mediciones/notas ni muestra datos clínicos ficticios como resultados de API. Botones de registro deshabilitados con explicación. La vista vuelve a consultar el paciente usando el adaptador existente de Sprint 1: sesión/CSRF y permisos se conservan.

En npm run dev se puede desplegar Vista previa de estados para inspeccionar carga, vacío, error y validación. Son estados explícitamente simulados, no respuestas reales. En build/producción ese control no aparece. Cambio de sección reinicia la vista previa y mueve foco al encabezado; cambio de paciente reinicia el componente. El futuro adaptador deberá conservar errores por campo, paginación y semántica de nulos publicados por backend.

## Dependencias revisadas

- Diana: docs/data/S2_CONTRATO_PROPUESTO.md en PR #21, commit 25a094cc5fe1a3ac4d8c507d73a18c1647c54729. El documento dice propuesta, no contrato aprobado.
- Fernanda: PR #24, docs/api/SEGUIMIENTO_S2.md, commit e6f4e133a839ce33abbdb7a0fad1319d99e4c3dc. Contrato propuesto revisado: GET/POST, sesión/CSRF de Sprint 1, relaciones desde URL, listas paginadas, peso como cadena decimal, seis estados de evolución y notas históricas. Aún no hay modelo, migración ni endpoints Sprint 2. No se conecta este borrador.

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

## Actualización tras revisar PR #24

Se mantienen las cinco vistas originales y se agregan Resumen y Documentos como estructura visual sin campos ni datos. Registro de documentos deshabilitado, sin selección/subida de archivos. Resumen/documentos no aparecen en el contrato propuesto de #24: deben ser definidos por Fernanda/Diana antes de añadir formatos, metadatos, rutas o respuestas. No se asume que sean entidades nuevas ni se deriva un resumen clínico local.

Revisión de #24: relaciones en URL sin body adicional, peso textual sin conversión a float, paginación/orden de backend, seis estados de evolución sin cálculos locales, escritura mínima POST y no edición PATCH Sprint 2. Son pautas para la integración futura, no operaciones habilitadas. Esperar confirmación y SHA real de API/modelo/migración. Preservar adaptador y autenticación Sprint 1.

Después de la entrega de backend: integrar flujo real y vistas de resumen/documentos únicamente con su contrato publicado; conservar cookies incluidas, token CSRF rotado y recuperación de sesión, validaciones servidor, errores por campo, carga/vacío/error, permisos por propietario y evidencia de persistencia. La disponibilidad futura no queda asumida ni la tarea completada por estos paneles.

## Contrato confirmado y entrega técnica disponible

El responsable temporal de datos confirmó #21/#24 en issue #18, manteniendo la propuesta de Diana sin atribuirle una confirmación nueva. Se preparan solo los controles acordados: occurred_at (ISO 8601 con zona), weight_kg (cadena decimal en kg) y kind/text de notas manuales. Son controles deshabilitados; no escriben ni llaman endpoints. Validaciones de orientación centralizadas en followup-contract.js, sin float, redondeo ni cálculos de evolución. El servidor sigue siendo autoridad.

Las ramas nuevas codex/s2-followup-reconciled (#32) y codex/s2-s3-features (#34, f00450ae450d97bbcad32c1887a6aac373d31c85) contienen implementación/migraciones. La inspección de followup/views.py encontró que consultations, measurements, notes e history devuelven arrays sin paginación, pero el contrato acordado en SEGUIMIENTO_S2.md exige count/next/previous/results. El frontend no oculta esta discrepancia ni inventa un envelope: la comprobación de contrato rechaza listas incompatibles. La conexión real espera corrección del backend o una revisión explícita del contrato publicada por sus responsables. No se afirman pruebas reales S2 sobre estas ramas.

Sprint 3: issues #25/#26/#27 especifican formalización con fallback manual, resumen y documentos, pero siguen pendientes los contratos finales de rutas, respuestas, proveedor/consentimiento y almacenamiento/retención/tipo/tamaño. La rama #34 contiene código inicial de documentos sin contrato API S3 publicado en docs/api/. Se añade únicamente una sección visual Formalización de notas, sin enviar contenido a IA ni inferir metadatos de documentos desde modelos. Captura manual sigue disponible en la preparación de Notas manuales; no es una prueba de escritura real S2.

PR #35 modifica exclusivamente CODEOWNERS para revisión temporal de datos; sus cambios no se mezclan con la rama frontend. No se fusiona ninguna PR ni se declara completa #19/#27.

Verificación de esta actualización: 15 pruebas aprobadas (10 de adaptadores/contrato y 5 de componentes), build correcto y git diff --check sin errores. No se realizó ni se afirma integración real S2/S3.
