import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const api = vi.hoisted(() => ({
  followup: vi.fn(),
  evolution: vi.fn(),
  createConsultation: vi.fn(),
  createMeasurement: vi.fn(),
  createNote: vi.fn(),
  uploadDocument: vi.fn(),
  documentDownload: vi.fn(),
}));

vi.mock('./data-client.js', () => ({ apiMode: true, client: api }));

import Followup from './Followup.jsx';

const patient = { id: 'patient-api', first_name: 'Ana', last_name: 'API' };
const initialConsultation = { id: 'consultation-old', occurred_at: '2026-10-01T12:00:00Z' };
const newConsultation = { id: 'consultation-new', occurred_at: '2026-10-02T12:00:00Z' };

function followupResponse(section, consultations) {
  if (section === 'consultations') return Promise.resolve({ results: consultations });
  if (section === 'history') return Promise.resolve({ results: [] });
  if (section === 'summary') return Promise.resolve({ consultations: 0, measurements: 0, latest_weight_kg: null });
  if (section === 'documents') return Promise.resolve([]);
  return Promise.resolve({ results: [] });
}

beforeEach(() => {
  vi.clearAllMocks();
  api.followup.mockImplementation((_patientId, section) => followupResponse(section, [initialConsultation]));
  api.evolution.mockResolvedValue({ status: 'first' });
  api.createConsultation.mockResolvedValue(newConsultation);
  api.documentDownload.mockReturnValue('/private-download');
});

afterEach(() => cleanup());

describe('seguimiento conectado a API', () => {
  it('refresca y selecciona la consulta recién creada sin recargar la página', async () => {
    const user = userEvent.setup();
    let consultations = [initialConsultation];
    api.followup.mockImplementation((_patientId, section) => followupResponse(section, consultations));
    api.createConsultation.mockImplementation(async () => {
      consultations = [newConsultation, ...consultations];
      return newConsultation;
    });
    render(<Followup patient={patient} onBack={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Consultas', exact: true }));
    fireEvent.change(screen.getByLabelText('Fecha con zona horaria'), { target: { value: '2026-10-02T06:00' } });
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(api.followup.mock.calls.filter(([, section]) => section === 'consultations')).toHaveLength(2));
    await user.click(screen.getByRole('button', { name: 'Mediciones', exact: true }));
    await screen.findByRole('option', { name: new Date(newConsultation.occurred_at).toLocaleString() });
    expect(screen.getByLabelText('Consulta').value).toBe(newConsultation.id);
  });

  it('reintenta la misma solicitud fallida y muestra la respuesta recuperada', async () => {
    const user = userEvent.setup();
    api.followup.mockImplementation((_patientId, section) => {
      if (section !== 'history') return followupResponse(section, [initialConsultation]);
      return api.followup.mock.calls.filter(([, requested]) => requested === 'history').length === 1
        ? Promise.reject(new Error('Servicio temporalmente no disponible'))
        : Promise.resolve({ results: [{ id: 'history-after-retry' }] });
    });
    render(<Followup patient={patient} onBack={() => {}} />);
    await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(api.followup.mock.calls.filter(([, section]) => section === 'history')).toHaveLength(2));
    expect((await screen.findByLabelText('Respuesta de seguimiento')).textContent).toContain('history-after-retry');
  });
});
