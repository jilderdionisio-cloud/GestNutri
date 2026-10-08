import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Followup from './Followup.jsx';
import { initialPatients } from './patients.js';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const patient = initialPatients[0];
describe('seguimiento pendiente de contrato', () => {
 it('mantiene paciente seleccionado y permite volver al expediente', async () => {
  const user = userEvent.setup(); const onBack = vi.fn();
  render(<Followup patient={patient} onBack={onBack}/>);
  expect(screen.getByRole('heading', { name: 'Ana María Ejemplo Prueba' })).toBeTruthy();
  expect(screen.queryByText('Vista previa de estados · sin datos clínicos')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Volver al expediente' }));
  expect(onBack).toHaveBeenCalledOnce();
 });
 it('navega entre las ocho vistas sin solicitudes ni escritura y mueve el foco', async () => {
  const user=userEvent.setup(); const fetcher=vi.fn(); vi.stubGlobal('fetch',fetcher);
  render(<Followup patient={patient} onBack={() => {}}/>);
  for (const title of ['Consultas','Mediciones','Historial','Evolución','Resumen','Formalización de notas','Documentos','Notas manuales']) {
   await user.click(screen.getByRole('button',{name:title,exact:true}));
   const heading=screen.getByRole('heading',{name:title,exact:true});
   expect(document.activeElement).toBe(heading);
   expect(screen.getByRole('button',{name:title,exact:true}).getAttribute('aria-current')).toBe('page');
  }
  expect(screen.getByRole('button',{name:'Agregar nota manual'}).disabled).toBe(true);
  await user.click(screen.getByRole('button',{name:'Documentos',exact:true}));
  expect(screen.getByRole('button',{name:'Agregar documento'}).disabled).toBe(true);
  expect(document.querySelector('input[type=file]')).toBeNull();
  expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  expect(fetcher).not.toHaveBeenCalled();
 });
 it('presenta carga, vacío, error y validación explícitamente simulados', async () => {
  const user=userEvent.setup(); render(<Followup patient={patient} onBack={() => {}} preview/>);
  await user.click(screen.getByText('Vista previa de estados · sin datos clínicos'));
  const selector=screen.getByLabelText('Estado visual');
  await user.selectOptions(selector,'loading');
  expect(screen.getByText('Cargando historial…')).toBeTruthy();
  expect(screen.getByText('Cargando historial…').parentElement.getAttribute('aria-busy')).toBe('true');
  await user.selectOptions(selector,'empty'); expect(screen.getByText('El historial todavía no tiene registros.')).toBeTruthy();
  await user.selectOptions(selector,'error'); expect(screen.getByRole('alert').textContent).toContain('simulado');
  await user.click(screen.getByRole('button',{name:'Restablecer vista previa'})); expect(screen.queryByRole('alert')).toBeNull();
  await user.selectOptions(selector,'validation'); expect(screen.getByRole('alert').textContent).toContain('reglas aprobadas');
 });
 it('no arrastra un error al cambiar de sección y reinicia al cambiar paciente', async () => {
  const user=userEvent.setup(); const {rerender}=render(<Followup key={patient.id} patient={patient} onBack={() => {}} preview/>);
  await user.click(screen.getByText('Vista previa de estados · sin datos clínicos'));
  await user.selectOptions(screen.getByLabelText('Estado visual'),'error');
  await user.click(screen.getByRole('button',{name:'Consultas',exact:true})); expect(screen.queryByRole('alert')).toBeNull();
  rerender(<Followup key="otro" patient={{...patient,id:'otro',first_name:'Otra',last_name:'Persona ficticia'}} onBack={() => {}} preview/>);
  expect(screen.getByRole('heading',{name:'Otra Persona ficticia'})).toBeTruthy();
  expect(screen.getByRole('button',{name:'Historial',exact:true}).getAttribute('aria-current')).toBe('page');
 });
 it('muestra solo los campos confirmados de consulta, peso y nota, todos bloqueados', async () => {
  const user=userEvent.setup(); render(<Followup patient={patient} onBack={() => {}}/>);
  for (const [section,names] of [['Consultas',['occurred_at']],['Mediciones',['weight_kg']],['Notas manuales',['kind','text']]]) {
   await user.click(screen.getByRole('button',{name:section,exact:true}));
   const form=screen.getByRole('form',{name:'Formulario acordado pendiente de API'});
   const controls=[...form.querySelectorAll('input,textarea,select')];
   expect(controls.map(control => control.name)).toEqual(names);
   expect(controls.every(control => control.matches(':disabled'))).toBe(true);
  }
 });

});
