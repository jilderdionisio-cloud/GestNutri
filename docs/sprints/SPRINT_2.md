# Sprint 2 - Seguimiento nutricional integrado

**Fecha:** 7-8 de octubre de 2026  
**Sprint Goal:** permitir que el nutricionista registre consultas y mediciones, consulte el historial y vea la evolución con datos persistentes y contratos comprobados.

## Alcance priorizado

| ID | Resultado | Responsable líder | Criterio mínimo de aceptación |
| --- | --- | --- | --- |
| HU-06 | Registrar consulta | Fernanda + Genny | Una consulta válida se guarda ligada al paciente. |
| HU-08 | Registrar mediciones | Diana + Fernanda | Mediciones válidas persisten con fecha y paciente. |
| HU-07 | Historial de consultas | Genny + Fernanda | El historial muestra datos del paciente correcto en orden definido. |
| HU-09 | Comparar evolución | Genny + Fernanda + Diana | Cubre aumento, disminución, igualdad, primera consulta y valores nulos/inválidos. |
| HU-10 | Notas y restricciones | Genny + Fernanda | Se guardan manualmente sin depender de IA. |
| S2-QA | Integración y regresión | Alex | CI y pruebas críticas del flujo completo pasan. |

## Orden de trabajo obligatorio

1. Diana documenta cambios de entidades/relaciones y entrega migraciones por PR.
2. Fernanda publica o actualiza el contrato API y sus pruebas.
3. Genny construye las pantallas contra el contrato aprobado; no adivina nombres de campos.
4. Alex incorpora casos de integración y regresión.
5. El orquestador verifica semánticamente datos, API y UI antes de cada integración.

## Recorte si el tiempo no alcanza

Se conservan HU-06, HU-08, HU-07 y la comparación mínima de HU-09. HU-10 y cualquier presentación visual no esencial se posponen al backlog, nunca se integran parcialmente sin pruebas.
