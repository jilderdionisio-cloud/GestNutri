import React, { useEffect, useRef, useState } from 'react';
import { patientName } from './patients.js';
import { followupSections, previewStates } from './followup-model.js';
import { apiMode, client } from './data-client.js';
export default function Followup({ patient, onBack, preview = false }) {
  const [sectionId, setSectionId] = useState('history');
  const [state, setState] = useState('pending');
  const titleRef = useRef(null);
  const section = followupSections.find(item => item.id === sectionId);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ occurred_at: '', consultation: '', weight_kg: '', kind: 'note', text: '', file: null });
  const [consultations, setConsultations] = useState([]);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => { titleRef.current?.focus(); }, [sectionId]);
  function open(id) { setSectionId(id); setState('pending'); }
  useEffect(() => {
    if (!apiMode || !['history', 'summary', 'documents'].includes(sectionId)) return;
    setState('loading'); setError('');
    client.followup(patient.id, sectionId).then(value => { setData(value); setState('ready'); }).catch(err => { setError(err.message); setState('error'); });
  }, [patient.id, sectionId, refresh]);
  useEffect(() => { if (apiMode) client.followup(patient.id, 'consultations').then(value => setConsultations(value.results || [])).catch(() => {}); }, [patient.id]);
  async function submit(event) {
    event.preventDefault(); setError('');
    try {
      if (sectionId === 'consultations') await client.createConsultation(patient.id, form.occurred_at);
      if (sectionId === 'measurements') await client.createMeasurement(form.consultation, form.weight_kg);
      if (sectionId === 'notes') await client.createNote(form.consultation, form.kind, form.text);
      if (sectionId === 'documents') await client.uploadDocument(patient.id, form.file, form.consultation);
      setRefresh(value => value + 1); open('history');
    } catch (err) { setError(err.data ? JSON.stringify(err.data) : err.message); setState('error'); }
  }
  return <section className="followup" aria-label="Seguimiento nutricional">
    <div className="patient-context"><div><p className="eyebrow">PACIENTE SELECCIONADO</p><h2>{patientName(patient)}</h2><p>Seguimiento nutricional · Sprint 2</p></div><button onClick={onBack}>Volver al expediente</button></div>
    <p className="contract-notice" role="status">{apiMode ? 'Conectado a la API autenticada de seguimiento.' : 'Demostración local sin persistencia.'}</p>
    <nav className="followup-nav" aria-label="Secciones de seguimiento">{followupSections.map(item => <button key={item.id} aria-current={sectionId === item.id ? 'page' : undefined} onClick={() => open(item.id)}>{item.title}</button>)}</nav>
    {preview && <details className="state-preview"><summary>Vista previa de estados · sin datos clínicos</summary><label>Estado visual<select value={state} onChange={event => setState(event.target.value)}>{previewStates.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><p>Estos estados son ejemplos de presentación; no representan respuestas reales de Sprint 2.</p></details>}
    <div className="followup-content" aria-busy={state === 'loading'}><div className="title"><div><h3 ref={titleRef} tabIndex="-1">{section.title}</h3><p>{section.description}</p></div>{section.action && <button className="primary" disabled aria-describedby="followup-dependency">{section.action}</button>}</div>
      {state === 'loading' && <p role="status">Cargando {section.title.toLocaleLowerCase()}…</p>}
      {state === 'empty' && <div className="empty" role="status"><h4>{section.empty}</h4><p>La representación final de registros y valores ausentes depende del contrato.</p></div>}
      {state === 'error' && <div className="error" role="alert"><p>{error || 'No se pudo cargar esta sección. Error de presentación simulado.'}</p><button onClick={() => open(sectionId)}>{apiMode ? 'Reintentar' : 'Restablecer vista previa'}</button></div>}
      {state === 'validation' && <p className="error" role="alert">Ejemplo visual: revisa los datos indicados antes de guardar. Los mensajes por campo se incorporarán con las reglas aprobadas.</p>}
      {state === 'pending' && <div className="empty"><h4>Preparada para recibir el contrato</h4><p>No hay campos, unidades, fechas ni registros de Sprint 2 definidos en el frontend.</p></div>}
      {state === 'ready' && <pre aria-label="Respuesta de seguimiento">{JSON.stringify(data, null, 2)}</pre>}
      {apiMode && ['consultations', 'measurements', 'notes', 'documents'].includes(sectionId) && <form onSubmit={submit} className="form-grid" noValidate>
        {sectionId === 'consultations' && <label>Fecha con zona horaria<input required type="datetime-local" value={form.occurred_at} onChange={e => setForm({...form, occurred_at: new Date(e.target.value).toISOString()})}/></label>}
        {sectionId !== 'consultations' && <label>Consulta<select required value={form.consultation} onChange={e => setForm({...form, consultation: e.target.value})}><option value="">Selecciona una consulta</option>{consultations.map(item => <option key={item.id} value={item.id}>{new Date(item.occurred_at).toLocaleString()}</option>)}</select></label>}
        {sectionId === 'measurements' && <label>Peso kg<input required value={form.weight_kg} onChange={e => setForm({...form, weight_kg: e.target.value})}/></label>}
        {sectionId === 'notes' && <><label>Tipo<select value={form.kind} onChange={e => setForm({...form, kind:e.target.value})}><option value="note">Nota</option><option value="preference">Preferencia</option><option value="restriction">Restricción</option></select></label><label>Texto<textarea required value={form.text} onChange={e => setForm({...form,text:e.target.value})}/></label></>}
        {sectionId === 'documents' && <label>Archivo<input required type="file" accept="application/pdf,image/jpeg,image/png" onChange={e => setForm({...form,file:e.target.files[0]})}/></label>}
        <button className="primary">Guardar</button>
      </form>}
      {apiMode && sectionId === 'documents' && Array.isArray(data) && data.map(item => <button key={item.id} onClick={() => window.location.assign(client.documentDownload(item.id))}>Descargar {item.original_name}</button>)}
      <p id="followup-dependency" className="dependency">Registro y edición pendientes de contrato API y migraciones disponibles. Resumen y documentos requieren además definición explícita de su alcance.</p>
    </div>
  </section>;
}
