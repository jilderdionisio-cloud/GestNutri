// Temporal: constantes del contrato compartido (sección 2) mientras se fusiona src/messages.js de Diana.
// Al fusionarse, reemplazar los imports de este archivo por './messages.js' y eliminarlo.
export const messages = {
  'login.invalid': 'Usuario o contraseña incorrectos.',
  'login.usernameRequired': 'Escribe tu usuario.',
  'login.passwordRequired': 'Escribe tu contraseña.',
  'field.required': 'Completa este campo.',
  'weight.notNumber': 'Escribe el peso con números, por ejemplo 68.5.',
  'weight.outOfRange': 'El peso debe estar entre 1 y 400 kg.',
  'measurement.duplicate': 'Esta consulta ya tiene una medición.',
  'document.invalidType': 'Sube un archivo PDF, PNG o JPG.',
  'document.tooLarge': 'El archivo supera el límite de 10 MiB.',
  'network.loadError': 'No pudimos cargar esta información.',
};
