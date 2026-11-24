// Única definición de campos: diccionario de Diana y contrato implementado en PR #9; revisión pendiente.
export const fields = [
  { key: 'first_name', label: 'Nombre', required: true, max: 100 },
  { key: 'last_name', label: 'Apellidos', required: true, max: 150 },
  { key: 'phone', label: 'Teléfono internacional', required: true, max: 16, type: 'tel' },
  { key: 'email', label: 'Correo electrónico', max: 254, type: 'email' },
  { key: 'birth_date', label: 'Fecha de nacimiento', type: 'date' },
  { key: 'allergies', label: 'Alergias', max: 2000, multiline: true },
  { key: 'restrictions', label: 'Restricciones', max: 2000, multiline: true },
];
export const emptyPatient = () => Object.fromEntries(fields.map(f => [f.key, f.key === 'birth_date' ? null : '']));
export const patientName = patient => [patient.first_name, patient.last_name].join(' ');

export function formatBirthDate(value) {
  if (!value) return 'No informado';
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Fecha no disponible';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function formatFileType(value) {
  return ({ 'application/pdf': 'PDF', 'image/png': 'Imagen PNG', 'image/jpeg': 'Imagen JPG' })[value] || 'Archivo';
}

export function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return 'Tamaño no disponible';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`;
}

export const pluralPacientes = count => `${count} ${count === 1 ? 'paciente' : 'pacientes'}`;
export function whatsappUrl(phone) {
  const internationalPhone = typeof phone === 'string' ? phone.trim() : '';
  if (!/^\+[1-9][0-9]{7,14}$/.test(internationalPhone)) return null;
  return `https://wa.me/${internationalPhone.slice(1)}`;
}
export const initialPatients = [{ ...emptyPatient(), id: 'f58b634c-daf9-4b8c-9c23-a25f9c837fd2', first_name: 'Ana María', last_name: 'Ejemplo Prueba', phone: '+12025550123', email: 'ana.ejemplo@example.com', birth_date: '1990-04-15', allergies: 'Alergia ficticia a cacahuate', restrictions: 'Restricción ficticia de lactosa', created_at: '2026-10-06T18:00:00Z', updated_at: '2026-10-06T18:00:00Z' }];
export function validate(patient) {
  const errors = {};
  for (const f of fields) {
    const value = patient[f.key];
    if (f.required && !value?.trim()) errors[f.key] = 'Completa este campo.';
    else if (f.max && value?.trim().length > f.max) errors[f.key] = `Máximo ${f.max} caracteres.`;
  }
  if (patient.phone && !/^\+[1-9][0-9]{7,14}$/.test(patient.phone.trim())) errors.phone = 'Usa formato internacional, por ejemplo +12025550123.';
  if (patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email.trim())) errors.email = 'Revisa el formato del correo.';
  if (patient.birth_date) {
    const date = new Date(`${patient.birth_date}T00:00:00Z`);
    const today = new Date();
    if (Number.isNaN(date.valueOf()) || date.getUTCFullYear() !== Number(patient.birth_date.slice(0,4)) || date.getUTCMonth()+1 !== Number(patient.birth_date.slice(5,7)) || date.getUTCDate() !== Number(patient.birth_date.slice(8,10)) || date > today) errors.birth_date = 'Ingresa una fecha real que no sea futura.';
  }
  return errors;
}
