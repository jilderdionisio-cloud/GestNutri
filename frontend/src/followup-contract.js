// Contrato de PR #24 confirmado en issue #18 por backend y responsable temporal de datos.
export const followupFields = {
 consultations: [{ key: 'occurred_at', label: 'Fecha y hora de consulta (ISO 8601 con zona)', type: 'text', required: true }],
 measurements: [{ key: 'weight_kg', label: 'Peso (kg)', type: 'text', required: true, inputMode: 'decimal' }],
 notes: [{ key: 'kind', label: 'Tipo de nota', options: [{ value: 'note', label: 'Nota' }, { value: 'preference', label: 'Preferencia' }, { value: 'restriction', label: 'Restricción' }], required: true }, { key: 'text', label: 'Texto manual', multiline: true, max: 2000, required: true }],
};
export const evolutionLabels = { first: 'Primera consulta', increase: 'Aumento', decrease: 'Disminución', equal: 'Igualdad', insufficient_data: 'Datos insuficientes', invalid_data: 'Datos inválidos' };
export function validateFollowup(section, values, now = Date.now()) {
 const errors = {};
 if (section === 'consultations') {
  const value = values.occurred_at;
  const dateParts = typeof value === 'string' ? value.slice(0,10).split('-').map(Number) : [];
  const calendar = new Date(Date.UTC(dateParts[0], (dateParts[1] || 0)-1, dateParts[2]));
  const validCalendar = calendar.getUTCFullYear() === dateParts[0] && calendar.getUTCMonth()+1 === dateParts[1] && calendar.getUTCDate() === dateParts[2];
  if (!validCalendar || typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value)) || Date.parse(value) > now) errors.occurred_at = 'Usa una fecha ISO 8601 con zona horaria, no futura. El servidor valida la fecha definitiva.';
 }
 if (section === 'measurements') {
  const value=values.weight_kg;
  if (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(value)) errors.weight_kg='Usa un decimal positivo de hasta dos decimales, sin notación exponencial.';
  else { const [integer, fraction='']=value.split('.'); const cents=BigInt(integer)*100n+BigInt(fraction.padEnd(2,'0')); if (cents <= 0n || cents > 999999n) errors.weight_kg='Debe ser mayor que cero y como máximo 9999.99 kg (límite técnico).'; }
 }
 if (section === 'notes') {
  if (!['note','preference','restriction'].includes(values.kind)) errors.kind='Selecciona un tipo de nota permitido.';
  if (typeof values.text !== 'string' || !values.text.trim() || values.text.trim().length > 2000) errors.text='Escribe entre 1 y 2000 caracteres de texto manual.';
 }
 return errors;
}
// No convertir arrays sin paginación ni adivinar envelopes de API.
export function requireFollowupPage(value) {
 if (!value || !Array.isArray(value.results) || !Number.isInteger(value.count) || value.count < 0 || !('next' in value) || !('previous' in value)) throw new Error('Respuesta de seguimiento incompatible con el contrato paginado aprobado.');
 return value;
}
