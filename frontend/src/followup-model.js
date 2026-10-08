export const followupSections = [
  { id: 'consultations', title: 'Consultas', description: 'Registro de consultas del paciente.', action: 'Registrar consulta', empty: 'No hay consultas para mostrar.' },
  { id: 'measurements', title: 'Mediciones', description: 'Registro de mediciones asociado a una consulta.', action: 'Registrar medición', empty: 'No hay mediciones para mostrar.' },
  { id: 'history', title: 'Historial', description: 'Consulta del historial según el orden publicado por backend.', empty: 'El historial todavía no tiene registros.' },
  { id: 'evolution', title: 'Evolución', description: 'Comparación servida por backend, sin cálculos locales.', empty: 'No hay resultados de evolución para mostrar.' },
  { id: 'summary', title: 'Resumen', description: 'Resumen del seguimiento pendiente de definición en el contrato.', empty: 'No hay un resumen disponible.' },
  { id: 'formalization', title: 'Formalización de notas', description: 'IA pendiente de proveedor y contrato aprobado. La captura manual se conserva en Notas manuales.', action: 'Formalizar nota', empty: 'No hay una formalización disponible.' },
  { id: 'documents', title: 'Documentos', description: 'Documentos del seguimiento pendientes de contrato y disponibilidad del backend.', action: 'Agregar documento', empty: 'No hay documentos para mostrar.' },
  { id: 'notes', title: 'Notas manuales', description: 'Notas, preferencias y restricciones vinculadas al seguimiento.', action: 'Agregar nota manual', empty: 'No hay notas manuales para mostrar.' },
];
// Estados de presentación, no estados ni respuestas del contrato API de Sprint 2.
export const previewStates = [
  { id: 'pending', label: 'Contrato pendiente' },
  { id: 'loading', label: 'Carga' },
  { id: 'empty', label: 'Vacío' },
  { id: 'error', label: 'Error' },
  { id: 'validation', label: 'Validación' },
];
