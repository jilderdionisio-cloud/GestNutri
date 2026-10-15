export const followupSections = [
  { id: 'consultations', title: 'Consultas', description: 'Registro de consultas del paciente.', action: 'Registrar consulta', empty: 'No hay consultas para mostrar.' },
  { id: 'measurements', title: 'Mediciones', description: 'Registro de mediciones asociado a una consulta.', action: 'Registrar medición', empty: 'No hay mediciones para mostrar.' },
  { id: 'history', title: 'Historial', description: 'Consultas y mediciones del paciente, ordenadas por fecha.', empty: 'El historial todavía no tiene registros.' },
  { id: 'evolution', title: 'Evolución', description: 'Comparación cronológica de las mediciones registradas.', empty: 'No hay resultados de evolución para mostrar.' },
  { id: 'summary', title: 'Resumen', description: 'Vista general de los registros disponibles.', empty: 'No hay un resumen disponible.' },
  { id: 'documents', title: 'Documentos', description: 'Archivos privados vinculados al expediente del paciente.', action: 'Agregar documento', empty: 'No hay documentos para mostrar.' },
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
