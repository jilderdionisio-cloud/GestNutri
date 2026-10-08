# E2E real — candidato #34

Base de prueba: PR #34, `8a8128a589fc91b330458a724648788a211b0f9c`.

La automatización vive en `tests/e2e/` y usa únicamente cuentas, paciente, nota y PDF sintéticos. El job `Followup E2E candidate` crea PostgreSQL efímero, ejecuta migraciones, inicia Django y Vite con `VITE_DATA_MODE=api`, y usa Chromium mediante Playwright.

El caso cubre login, alta de paciente, consulta, medición, nota, historial, evolución, resumen, carga y descarga, recarga con persistencia, logout y aislamiento A/B. Un resultado PASS sólo se registra cuando el job remoto pasa sobre el SHA de esta rama; la automatización no sustituye aprobación humana ni la integración de #34 en `develop`.
