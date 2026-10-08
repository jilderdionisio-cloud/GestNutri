# Plantilla de reporte de defectos — Sprint 1

Abrir un Issue independiente por fallo reproducible con el título `BUG S1: <comportamiento corto>`. Enlazarlo con #5 y con el Issue/PR propietaria (#2 datos, #3 backend o #4 frontend). No registrar una suposición como defecto.

## Plantilla

```md
## Resumen
<Qué ocurre y dónde>

## Trazabilidad
- Caso QA: `S1-HUXX-XX`
- Issue de QA: #5
- Área propietaria: datos / backend / frontend
- Issue o PR relacionada: #...
- Rama y commit probados: `<rama>` / `<sha>`

## Entorno y datos ficticios
- Entorno: local / CI / pruebas
- Datos: `QA-...`
- Precondiciones: <sesión, migración, registro existente, etc.>

## Pasos para reproducir
1. ...
2. ...
3. ...

## Resultado esperado
<Según contrato o criterio de aceptación enlazado>

## Resultado real
<Solo lo observado>

## Severidad y prioridad
- Severidad: crítica / alta / media / baja
- Prioridad: crítica / alta / media / baja
- Justificación: ...

## Evidencia
<Log, captura, salida de CI o respuesta sanitizada; nunca secretos ni datos reales>
```

## Guía breve de clasificación

| Severidad | Uso orientativo |
| --- | --- |
| Crítica | Bloquea autenticación, acceso seguro o flujo esencial del Sprint sin alternativa. |
| Alta | Impide una historia esencial o permite datos incorrectos/no autorizados. |
| Media | Hay alternativa temporal, pero se incumple un comportamiento acordado. |
| Baja | Impacto menor de presentación, texto o usabilidad, sin pérdida de función ni datos. |

La severidad se confirma con el propietario y el orquestador cuando el contrato y la evidencia estén disponibles.
