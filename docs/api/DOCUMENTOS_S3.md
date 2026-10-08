# Documentos privados S3 — contrato de candidata

Estado: implementado en la candidata #34; pendiente de revisión e integración en
`develop`. El almacenamiento de la entrega local es privado bajo `MEDIA_ROOT`:
no se publica una URL de medios ni se entrega un enlace público.

## API y autorización

- `GET/POST /api/v1/patients/{patient_id}/documents/` y
  `GET /api/v1/documents/{document_id}/download/` requieren sesión y CSRF para
  la escritura.
- La autorización se deriva siempre de `Document.patient.owner`. Una consulta es
  opcional, pero si se incluye debe pertenecer al mismo paciente y propietario.
- Recursos ajenos o inexistentes responden 404. La descarga se sirve sólo tras
  esa comprobación y registra `document.download` exitoso.

## Validación de carga

- Sólo se admiten PDF, JPEG y PNG; máximo 10 MiB.
- El endpoint comprueba el MIME declarado y la firma inicial del contenido
  (`%PDF-`, JPEG SOI o firma PNG) antes de guardar. Esta comprobación evita que
  un cuerpo arbitrario etiquetado como tipo permitido pase como válido; no es un
  parser antivirus ni una validación semántica completa del archivo.
- Tamaño, MIME y correspondencia paciente-consulta se validan en el endpoint
  autenticado mediante `full_clean()` y controles previos. No se prometen como
  `CHECK` de PostgreSQL para escrituras directas ORM/SQL, que están fuera del
  contrato de esta entrega.

No usar archivos, credenciales ni datos clínicos reales en pruebas.
