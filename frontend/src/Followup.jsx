import React, { useEffect, useRef, useState } from 'react';
import FollowupFormPreview from './FollowupFormPreview.jsx';
import { patientName } from './patients.js';
import { followupSections, previewStates } from './followup-model.js';
export default function Followup({ patient, onBack, preview = false }) {
  const [sectionId, setSectionId] = useState('history');
  const [state, setState] = useState('pending');
  const titleRef = useRef(null);
  const section = followupSections.find(item => item.id === sectionId);
  useEffect(() => { titleRef.current?.focus(); }, [sectionId]);
  function open(id) { setSectionId(id); setState('pending'); }
  return <section className="followup" aria-label="Seguimiento nutricional">
    <div className="patient-context"><div><p className="eyebrow">PACIENTE SELECCIONADO</p><h2>{patientName(patient)}</h2><p>Seguimiento nutricional · Sprint 2</p></div><button onClick={onBack}>Volver al expediente</button></div>
    <p className="contract-notice" role="status">Preparación visual. Los campos de Sprint 2 siguen el contrato confirmado en #18. La conexión espera API y migración verificadas. No se guardan consultas, mediciones, notas ni documentos en esta vista.</p>
    <nav className="followup-nav" aria-label="Secciones de seguimiento">{followupSections.map(item => <button key={item.id} aria-current={sectionId === item.id ? 'page' : undefined} onClick={() => open(item.id)}>{item.title}</button>)}</nav>
    {preview && <details className="state-preview"><summary>Vista previa de estados · sin datos clínicos</summary><label>Estado visual<select value={state} onChange={event => setState(event.target.value)}>{previewStates.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><p>Estos estados son ejemplos de presentación; no representan respuestas reales de Sprint 2.</p></details>}
    <div className="followup-content" aria-busy={state === 'loading'}><div className="title"><div><h3 ref={titleRef} tabIndex="-1">{section.title}</h3><p>{section.description}</p></div>{section.action && <button className="primary" disabled aria-describedby="followup-dependency">{section.action}</button>}</div>
      {state === 'loading' && <p role="status">Cargando {section.title.toLocaleLowerCase()}…</p>}
      {state === 'empty' && <div className="empty" role="status"><h4>{section.empty}</h4><p>La representación final de registros y valores ausentes depende del contrato.</p></div>}
      {state === 'error' && <div className="error" role="alert"><p>No se pudo cargar esta sección. Error de presentación simulado.</p><button onClick={() => setState('pending')}>Restablecer vista previa</button></div>}
      {state === 'validation' && <p className="error" role="alert">Ejemplo visual: revisa los datos indicados antes de guardar. Los mensajes por campo se incorporarán con las reglas aprobadas.</p>}
      {state === 'pending' && <div className="empty"><h4>Preparada para recibir el contrato</h4><p>Los campos acordados se preparan sin registros. Resumen, IA y documentos esperan contratos finales.</p></div>}
      <FollowupFormPreview section={sectionId}/>
      <p id="followup-dependency" className="dependency">Registro y edición pendientes de contrato API y migraciones disponibles. Resumen y documentos requieren además definición explícita de su alcance.</p>
    </div>
  </section>;
}
