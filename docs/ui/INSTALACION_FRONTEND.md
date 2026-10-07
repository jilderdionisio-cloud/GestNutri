# Instalación del frontend

Requisito: Node.js compatible con Vite 7 (20.19+ o 22.12+). Verificado con Node 24.18.0 y npm 11.16.0.

Desde frontend/:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Vite indica la URL local al arrancar. Los tests usan node:test y prueban el adaptador/flujo de datos y validaciones; no son pruebas de componentes DOM ni integración con API.

No se necesita .env. La variable VITE_API_BASE_URL queda únicamente como nombre propuesto de configuración futura, sin valor ni uso en código hasta que Fernanda confirme URL, CORS y entorno. No guardar secretos en variables VITE_* (se publican en el cliente).

No hay fetch, endpoints, tokens, cookies ni persistencia de credenciales. Para integrar, confirmar AUTENTICACION_S1.md y PACIENTES_S1.md aprobados, diccionario final, métodos, payloads, errores y mecanismo de autenticación. Reemplazar el adaptador local y ajustar la interfaz a esos contratos sin dispersar campos.
