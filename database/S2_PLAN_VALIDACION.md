# Sprint 2: plan de validación pendiente

Estado: no se ha generado migración ni ejecutado validación PostgreSQL de Sprint 2. Este documento no constituye evidencia de aprobación. Depende del [contrato propuesto](../docs/data/S2_CONTRATO_PROPUESTO.md).

## Puerta previa

- Acuerdos escritos de Diana/Fernanda y revisión del orquestador, enlazados en #17/#18.
- Sprint 1 integrado y SHA de develop registrado.
- App, ruta de migraciones, modelos/tablas, dependencia y commit real confirmados. Generar con las dependencias fijadas del backend, no escribir un esquema alternativo a mano.
- Entorno PostgreSQL nuevo y desechable: registrar versión, encoding, locale/collation y proveedor; configuración sin credenciales. No usar bases compartidas ni de pacientes reales.

## Ejecución cuando se resuelvan las dependencias

Desde backend con settings normales y POSTGRES_* configurado para la base de pruebas: `python manage.py check`, `python manage.py makemigrations --check --dry-run`, `python manage.py migrate --plan`, `python manage.py migrate --noinput`, `python manage.py showmigrations`, `python manage.py test --noinput` y segundo `python manage.py migrate --noinput`. Registrar salida, código de retorno y commits de datos/backend. Comprobar que la conexión activa es PostgreSQL; SQLite no sustituye esta evidencia.

Revisar SQL e introspección de PK, FK, UNIQUE, CHECK e índices. Probar restricciones por escritura directa en transacciones de pruebas que se reviertan; validar API y permisos en las pruebas de Fernanda. Verificar que la inicial de Patient sigue intacta y que el segundo migrate no tiene pendientes. La ausencia de migración aquí es una dependencia explícita, no un resultado `No changes detected`.

## Casos ficticios a convertir en fixtures/pruebas tras confirmar el modelo

Crear dos profesionales sintéticos y un paciente sintético de cada uno. No usar nombres, teléfonos ni expedientes reales. Los UUID de fixtures se definirán con el esquema final; no publicar contraseñas o .env.

| Caso | Datos propuestos | Resultado esperado |
| --- | --- | --- |
| Evolución mínima | pesos 70.00, 71.25, 69.50, 69.50 en consultas consecutivas | first, increase(+1.25), decrease(-1.75), equal(0.00) |
| Nulos | consulta sin medición entre dos consultas con peso | las dos comparaciones adyacentes son insufficient_data; no saltar la consulta vacía |
| Primera sin medición | único registro sin Measurement | first, delta null |
| Inválidos | peso 0, -1, NaN, infinito, 10000, 70.001, booleano | rechazo de entrada; CHECK para reglas que correspondan a BD; sin redondeo silencioso en API |
| Propiedad | profesional B intenta consultar/modificar registros de A | denegación sin filtrar datos, según contrato API de Fernanda |
| Cardinalidad | segunda medición de la misma consulta | UNIQUE rechaza duplicado |
| Referencias | FK inexistente, borrar Patient/Consultation referenciado | integridad/PROTECT; no cascada |
| Notas | categoría desconocida, blanco, 2001 caracteres | rechazo; 1 y 2000 caracteres válidos |
| Fechas/orden | igual occurred_at, distinto created_at/id; consulta retroactiva; páginas sucesivas | orden estable y comparación global por paciente; fecha sin zona/futura rechazada por API |
| Regresión Sprint 1 | suite normal de autenticación/pacientes | sin regresiones |

El conjunto exacto de fixtures y pruebas se adaptará al contrato aprobado, sin alterar campos por conveniencia del test. La PR definitiva debe adjuntar resultados reales, revisión CODEOWNER/CI y humana, mantenerse sin fusionar y no declarar finalizado el Sprint antes de integración.
