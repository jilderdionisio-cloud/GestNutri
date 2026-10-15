import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const api = vi.hoisted(() => ({ followup: vi.fn(), evolution: vi.fn(), measurements: vi.fn(), notes: vi.fn(), createConsultation: vi.fn(), createMeasurement: vi.fn(), createNote: vi.fn(), uploadDocument: vi.fn(), documentDownload: vi.fn() }));
vi.mock('./data-client.js', () => ({ apiMode: true, client: api }));
import Followup from './Followup.jsx';

const patient = { id: 'patient-api', first_name: 'Ana', last_name: 'API' };
const consultation = { id: 'consultation-old', occurred_at: '2026-10-01T12:00:00Z' };
const history = { id: 'consultation-old', occurred_at: '2026-10-01T12:00:00Z', measurement: { weight_kg: '68.50' } };
function response(section, consultations = [consultation]) {
  if (section === 'consultations') return Promise.resolve({ results: consultations, count: consultations.length });
  if (section === 'history') return Promise.resolve({ results: consultations.length ? [history] : [], count: consultations.length });
  if (section === 'summary') return Promise.resolve({ consultations: consultations.length, measurements: consultations.length, latest_weight_kg: consultations.length ? '68.50' : null });
  if (section === 'documents') return Promise.resolve([]);
  return Promise.resolve({ results: [] });
}
beforeEach(() => { vi.clearAllMocks(); api.followup.mockImplementation((_id, section) => response(section)); api.evolution.mockResolvedValue({ status: 'first', current_weight_kg: '68.50', previous_weight_kg: null, delta_kg: null }); api.measurements.mockResolvedValue({ results: [] }); api.notes.mockResolvedValue({ results: [] }); api.documentDownload.mockReturnValue('/private-download'); });
afterEach(() => cleanup());

describe('seguimiento conectado a API', () => {
  it('muestra un vacío comprensible y permite crear la primera consulta', async () => {
    const user = userEvent.setup(); api.followup.mockImplementation((_id, section) => response(section, []));
    render(<Followup patient={patient} onBack={() => {}} />);
    expect(await screen.findByRole('heading', { name: 'Este paciente aún no tiene consultas' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Crear primera consulta' }));
    expect(screen.getByRole('heading', { name: 'Consultas', exact: true })).toBeTruthy();
    expect(screen.getByLabelText('Fecha con zona horaria')).toBeTruthy();
  });

  it('presenta historial, resumen y evolución con etiquetas legibles', async () => {
    const user = userEvent.setup(); render(<Followup patient={patient} onBack={() => {}} />);
    expect((await screen.findAllByText('68.5 kg')).length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Resumen', exact: true }));
    expect((await screen.findAllByText('Último peso')).length).toBeGreaterThan(1);
    await user.click(screen.getByRole('button', { name: 'Evolución', exact: true }));
    expect(await screen.findByText('Esta es la primera consulta registrada; todavía no hay una consulta anterior para comparar.')).toBeTruthy();
    expect(document.querySelector('pre')).toBeNull();
  });

  it('reintenta la misma solicitud fallida y muestra una respuesta recuperada', async () => {
    const user = userEvent.setup(); render(<Followup patient={patient} onBack={() => {}} />);
    await screen.findByText('Medición disponible');
    let attempts = 0;
    api.followup.mockImplementation((_id, section) => { if (section !== 'summary') return response(section); attempts += 1; return attempts === 1 ? Promise.reject(new Error('Servicio temporalmente no disponible')) : response('summary'); });
    await user.click(screen.getByRole('button', { name: 'Resumen', exact: true }));
    expect(await screen.findByRole('alert')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Registros disponibles en el seguimiento.')).toBeTruthy();
    expect(attempts).toBeGreaterThan(1);
  });

  it('crea una consulta y utiliza la selección recién creada en formularios posteriores', async () => {
    const user = userEvent.setup(); const created = { id: 'consultation-new', occurred_at: '2026-10-02T12:00:00Z' };
    api.createConsultation.mockResolvedValue(created); render(<Followup patient={patient} onBack={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Consultas', exact: true }));
    fireEvent.change(screen.getByLabelText('Fecha con zona horaria'), { target: { value: '2026-10-02T06:00' } });
    await user.click(screen.getByRole('button', { name: 'Guardar consulta' }));
    await waitFor(() => expect(api.createConsultation).toHaveBeenCalledOnce());
    expect(await screen.findByText('Registro guardado correctamente.')).toBeTruthy();
  });
});
