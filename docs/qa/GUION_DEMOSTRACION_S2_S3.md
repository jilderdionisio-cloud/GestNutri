# Guion breve de demostración — S2/S3

Usar únicamente cuentas, pacientes y archivos sintéticos en el entorno integrado que autorice el equipo. Este guion no sustituye la evidencia automatizada del candidato #34/#36 ni convierte resultados en `develop` en aprobados hasta ejecutar CI allí.

1. Iniciar sesión con la cuenta A y comprobar que aparece la lista de pacientes.
2. Crear un paciente ficticio y abrir su expediente.
3. Abrir Seguimiento, crear una consulta con fecha válida y guardar.
4. Crear una medición `70.00` para esa consulta y una nota manual sintética.
5. Abrir Historial y Evolución; seleccionar la consulta y comprobar el estado/resultado servido por la API.
6. Abrir Resumen y confirmar que refleja los datos persistidos, sin interpretación clínica adicional.
7. En Documentos, cargar un PDF sintético, volver a la lista y descargarlo mediante el botón visible.
8. Recargar la página, volver al expediente y confirmar que consulta, medición, nota, resumen y documento siguen disponibles.
9. Cerrar sesión y confirmar el regreso a la pantalla de acceso.
10. Iniciar sesión con la cuenta B: buscar el paciente de A; no debe aparecer ni permitir abrir detalle, documentos o recursos de A.

Evidencia mínima: SHA de `develop`, URL del run CI, capturas o vídeo del recorrido, respuestas sanitizadas de A/B y nombre/tamaño/tipo sintético del archivo. No incluir contraseñas, tokens, datos clínicos reales ni archivos personales.

## Pendientes reales de cierre

- Integrar #34 y #36 en `develop` con revisiones humanas requeridas.
- Ejecutar este recorrido y la regresión S1/S2/S3 sobre el SHA integrado de `develop`.
- Completar S2-NOTE-01: tres tipos, 2001 caracteres y orden histórico.
- Confirmar los estados UI de vacío/error/validación de S2-FE-01 en la integración.
