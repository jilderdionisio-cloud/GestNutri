# Flujo de Sprint 1 — demostración local

Rama: feature/HU-02-patient-frontend, creada desde origin/develop.

Inicio simulado → lista/búsqueda → alta → guardar → expediente → editar → guardar. Cancelar y Volver regresan a la lista. Salir cierra la sesión visual. La navegación es estado interno de React; no define rutas de API.

- Acceso: botón de simulación, carga, éxito o error. No hay campos de credenciales mientras falta AUTENTICACION_S1.md.
- Lista: carga, resultados, búsqueda local por nombre/teléfono/correo, vacío y error con reintento.
- Alta/edición: formulario compartido, errores por campo, guardado en curso, cancelación, error simulado y éxito en expediente.
- Expediente: carga, identificación/contacto, alergias y restricciones, no encontrado y error con reintento.

El selector de escenarios permite reproducir los estados. Carga dura aproximadamente 450 ms. Para recuperar un error seleccionar Normal o reintentar; el escenario Error seguirá fallando hasta cambiarlo.

Los datos se centralizan en frontend/src/patients.js; frontend/src/client.js expone operaciones locales, sin llamadas HTTP. Se mantienen exclusivamente en memoria y se restablecen al recargar; salir no reinicia los datos de la demostración.

Pendiente: aprobación de #2/#3, contrato de autenticación, rutas y formatos API, integración real, pruebas visuales/componentes en navegador, revisión y PR hacia develop. No se declara terminada la integración ni el issue #4.
