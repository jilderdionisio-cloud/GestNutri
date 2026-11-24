# D-6: datos ficticios de revisión 03

Ejecutar `python database/seed_qa_d6.py` desde la raíz, con las dependencias de
`backend/requirements.txt`, sólo en una base de desarrollo desechable.
Configurar `DJANGO_DEBUG=true`, `GESTNUTRI_QA_SEED=BASE_DE_PRUEBAS` y las variables
`POSTGRES_*` mediante el entorno local. No guardar valores secretos en Git.
Las contraseñas se piden sin eco o se leen de `GESTNUTRI_QA_A_PASSWORD` y
`GESTNUTRI_QA_B_PASSWORD`; deben cumplir los validadores de Django.

Usuarios: `gestnutri_qa_d6_a` y `gestnutri_qa_d6_b`. A recibe al menos 25 pacientes
(dos veces PAGE_SIZE más uno si resulta mayor); B recibe uno. Cada cuenta tiene
en su primer paciente una consulta, peso de 68.50 kg, nota y PNG de un píxel.
Los correos usan example.com y el teléfono usa el número ficticio +12025550123.
Repetir la carga conserva los registros y actualiza las contraseñas QA. No elimina
datos ni crea superusuarios. No usar estas cuentas fuera del entorno desechable.

## Limpieza solicitada: peso ficticio de 1000 kg

No se ejecutó ninguna eliminación. Antes de la migración de rango de Fernanda,
el equipo debe confirmar que la base es de pruebas y autorizar el registro exacto.
En `python backend/manage.py shell`, inspeccionar primero:

```python
from decimal import Decimal
from followup.models import Measurement
candidates = Measurement.objects.filter(
    consultation__patient__first_name='Lucía',
    consultation__patient__last_name='QA Ficticia Auditoría',
    weight_kg=Decimal('1000.00'),
)
list(candidates.values('id', 'consultation_id', 'consultation__patient_id',
                       'consultation__patient__owner_id', 'weight_kg'))
```

Si los nombres se almacenaron de otra forma, identificar manualmente al paciente
sin ampliar la eliminación por coincidencia parcial. Registrar propietario,
paciente, consulta y medición; solicitar confirmación del equipo. Con respaldo de
la base QA, dentro de `transaction.atomic()`, bloquear con `select_for_update()`
el UUID confirmado, comprobar de nuevo paciente/propietario/peso y borrar sólo esa
medición. No borrar pacientes, consultas, archivos ni todas las mediciones de 1000 kg.
Volver a consultar y ejecutar la comprobación previa de la migración de Fernanda.

## Verificación después de integrar los cuatro PR

Usar PostgreSQL 18 y la rama `fix/revision-interfaz-03` con los PR fusionados.
Registrar SHA final y resultados reales para 390×844 y 1280×800. La compilación y
una prueba SQLite del cargador no acreditan QA visual ni persistencia PostgreSQL.

- [ ] Acceso vacío: sin petición, aviso anunciado; usuario inexistente: mensaje exacto.
- [ ] Peso 1000, 0 y abc: error junto al campo; 68.5 y coma decimal válidos.
- [ ] Segunda medición y archivo txt: error local, sin Reintentar, lista conservada.
- [ ] Guardar paciente vacío: foco y vista en Nombre.
- [ ] Foco en h1 al navegar por Pacientes, Nuevo, Editar, Expediente y Salir.
- [ ] Móvil: tarjetas sin desbordamiento; menú Escape y Cerrar menú.
- [ ] axe sin color-contrast en portada y expediente; etiqueta H-12 medida.
- [ ] Fechas, archivos y singular legibles; campo Fecha y hora de la consulta.
- [ ] B no lista ni abre pacientes, consultas, notas o documentos de A.
- [ ] Anterior y Siguiente funcionan con dos páginas o más.

Dependencia conocida al preparar esta entrega: PR #44 de Fernanda aún abierto.
No se considera aprobada ninguna casilla por falta de respuesta del equipo.
