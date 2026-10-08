# Reporte de defectos — Sprint 2 y Sprint 3

Abrir un Issue por defecto reproducible: `BUG S2/S3: <resumen>`. Enlazar #20 o #28, el Issue propietario (#17–#19 o #25–#27), PR y SHA probados.

```md
## Trazabilidad
- Caso: `S2-...` o `S3-...`
- Área: datos / backend / frontend / CI
- PR y commit:

## Entorno y datos ficticios
- PostgreSQL/version/locale (si aplica):
- Datos `QA-...`:
- Sesión/cuenta: A o B, sin credenciales

## Pasos reproducibles
1. ...

## Esperado / real
<solo contrato final o criterio aprobado; no una propuesta>

## Evidencia
<URL de CI, salida sanitizada, captura/video; no secretos ni datos reales>

## Severidad
Crítica / alta / media / baja, con justificación.
```

Un bloqueo no es un defecto: registrar la dependencia concreta en la matriz y avisar al orquestador.
