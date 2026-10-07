# CI transitorio — Sprint 1

Este workflow valida código pendiente de integración sin fusionar las PR de
producto. Se ejecuta desde una PR de QA hacia `develop`, pero obtiene fuentes
fijadas en checkouts separados:

| Capa | PR | Commit fijado | Comandos |
| --- | --- | --- | --- |
| Backend | #9 | `ef9356faaa0b46b69c44a95b65f8a941e1168dde` | `check`, `migrate --plan`, `migrate`, `showmigrations`, `makemigrations --check --dry-run`, `test accounts patients --noinput` |
| Frontend | #11 | `afe5f4ce698dafb32918c40490321df158e42b67` | `npm ci`, `npm test`, `npm run build` |

El backend utiliza un servicio PostgreSQL 17 efímero (`gestnutri_ci`) creado
por GitHub Actions. Sus credenciales son de prueba, viven únicamente durante
el job y no representan un secreto de despliegue.

## Alcance y límites

- No fusiona, modifica ni prueba una combinación de ramas como si ya estuviera
  integrada en `develop`.
- No sustituye el E2E de navegador con `VITE_DATA_MODE=api` ni la revisión
  humana.
- Cuando backend y frontend entren en una rama de integración real, reemplazar
  los checkouts fijados por el checkout normal de esa rama y añadir el E2E.
- La aprobación debe ser de un CODEOWNER independiente de quien abra la PR.
