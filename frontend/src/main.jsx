import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { client } from './client.js';
import { emptyPatient, fields, patientName, validate } from './patients.js';
import './styles.css';
function App() {
  const [session, setSession] = useState(false);
  const [view, setView] = useState('list');
  const [id, setId] = useState(null);
  const [scenario, setScenario] = useState('normal');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [patient, setPatient] = useState(null);
  const [values, setValues] = useState(emptyPatient);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [retry, setRetry] = useState(0);
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, [view, session]);
  useEffect(() => {
    if (!session) return;
    let active = true;
    setStatus('loading'); setMessage(''); setErrors({});
    const work = view === 'list' ? client.list(query, scenario) : view === 'new' ? Promise.resolve(emptyPatient()) : client.detail(id, scenario);
    work.then(result => {
      if (!active) return;
      if (view === 'list') setRows(result);
      else if (view === 'new') setValues(result);
      else { setPatient(result); if (result) setValues(result); }
      setStatus(view !== 'list' && view !== 'new' && !result ? 'missing' : 'ready');
    }).catch(error => { if (active) { setMessage(error.message); setStatus('error'); } });
    return () => { active = false; };
  }, [session, view, id, query, scenario, retry]);
  function navigate(next, selected = null) { setView(next); setId(selected); setNotice(''); }
  async function login(event) {
    event.preventDefault(); setStatus('loading'); setMessage('');
    try { await client.login(scenario); setSession(true); setView('list'); } catch (error) { setMessage(error.message); setStatus('error'); }
  }
  async function save(event) {
    event.preventDefault();
    const found = validate(values); setErrors(found);
    if (Object.keys(found).length) { setMessage('Revisa los campos indicados.'); event.currentTarget.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus(); return; }
    setStatus('saving'); setMessage('');
    try { const saved = await client.save(values, view === 'edit' ? id : null, scenario); navigate('detail', saved.id); setNotice('Paciente guardado en la sesión de demostración.'); }
    catch (error) { setErrors(error.errors ?? {}); setMessage(error.message); setStatus('ready'); }
  }
  const busy = status === 'loading' || status === 'saving';
  return <><header><a className="brand" href="#" onClick={e => { e.preventDefault(); if (session) navigate('list'); }}>◉ GestNutri</a><span>Gestión de pacientes · Sprint 1</span>{session && <button onClick={() => { setSession(false); setStatus('idle'); setMessage(''); setNotice(''); }}>Salir</button>}</header>
    <main><aside className="demo"><strong>Demostración con datos ficticios</strong><span>Campos y reglas provisionales de Diana. API pendiente de aprobación.</span><label>Escenario visual <select value={scenario} onChange={e => setScenario(e.target.value)} disabled={status === 'saving'}><option value="normal">Normal</option><option value="error">Error</option><option value="empty">Lista vacía</option><option value="missing">Expediente no encontrado</option></select></label></aside>
    <section className="panel"><div className="title"><div><p className="eyebrow">ESPACIO DE NUTRICIÓN</p><h1 tabIndex="-1" ref={heading}>{!session ? 'Bienvenida a GestNutri' : { list: 'Pacientes', new: 'Nuevo paciente', edit: 'Editar paciente', detail: 'Expediente básico' }[view]}</h1></div>{session && view !== 'list' && <button onClick={() => navigate('list')}>Volver a pacientes</button>}</div>
    {notice && <p role="status" className="success">{notice}</p>}{message && <p role="alert" className="error">{message}</p>}
    {!session ? <form onSubmit={login} className="login"><p>Recorre el flujo de pacientes en una sesión simulada.</p><p>El formulario de credenciales se incorporará cuando se publique el contrato de autenticación.</p><button className="primary" disabled={busy}>{busy ? 'Iniciando…' : 'Simular inicio de sesión'}</button></form> : <>
    {view === 'list' && <div className="toolbar"><label className="search">Buscar pacientes<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre, teléfono o correo" /></label><button className="primary" onClick={() => navigate('new')}>+ Nuevo paciente</button></div>}
    {status === 'loading' && <p role="status">Cargando…</p>}
    {status === 'error' && <button onClick={() => setRetry(n => n + 1)}>Reintentar</button>}
    {status === 'missing' && <p role="status">No se encontró el paciente en esta demostración.</p>}
    {status === 'ready' && view === 'list' && (rows.length ? <div className="table-wrap"><table><thead><tr><th>Paciente</th><th>Contacto</th><th>Acciones</th></tr></thead><tbody>{rows.map(p => <tr key={p.id}><td><strong>{patientName(p)}</strong><small>Paciente ficticio</small></td><td>{p.phone}<small>{p.email || 'Correo no informado'}</small></td><td><button onClick={() => navigate('detail', p.id)} aria-label={`Ver expediente de ${patientName(p)}`}>Ver expediente</button> <button onClick={() => navigate('edit', p.id)} aria-label={`Editar a ${patientName(p)}`}>Editar</button></td></tr>)}</tbody></table></div> : <div className="empty"><h2>No hay pacientes para mostrar</h2><p>{query ? 'Prueba con otra búsqueda.' : 'Puedes agregar tu primer paciente ficticio.'}</p></div>)}
    {(status === 'ready' || status === 'saving') && (view === 'new' || view === 'edit') && <form onSubmit={save} noValidate><p>Los campos con * son obligatorios según la propuesta provisional.</p><div className="form-grid">{fields.map(f => <label key={f.key} className={f.multiline ? 'wide' : ''}>{f.label}{f.required ? ' *' : ''}{React.createElement(f.multiline ? 'textarea' : 'input', { name: f.key, type: f.type || 'text', value: values[f.key] ?? '', required: f.required, disabled: busy, 'aria-invalid': Boolean(errors[f.key]), 'aria-describedby': errors[f.key] ? `${f.key}-error` : undefined, onChange: e => setValues({ ...values, [f.key]: e.target.value }) })}{errors[f.key] && <span id={`${f.key}-error`} className="field-error">{errors[f.key]}</span>}</label>)}</div><div className="actions"><button type="button" disabled={busy} onClick={() => navigate('list')}>Cancelar</button><button className="primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar paciente'}</button></div></form>}
    {status === 'ready' && view === 'detail' && patient && <><h2>{patientName(patient)}</h2><dl className="details">{fields.map(f => <div key={f.key}><dt>{f.label}</dt><dd>{patient[f.key] || 'No informado'}</dd></div>)}</dl><button className="primary" onClick={() => navigate('edit', id)}>Editar paciente</button></>}
    </>}</section><footer>GestNutri · Datos locales en memoria. Los cambios se restablecen al recargar.</footer></main></>;
}
createRoot(document.getElementById('root')).render(<App />);
