import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Followup from './Followup.jsx';
import { initialPatients } from './patients.js';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const patient = initialPatients[0];

describe('presentación de seguimiento', () => {
  it('mantiene el paciente seleccionado y permite volver al expediente', async () => {
    const user = userEvent.setup(); const onBack = vi.fn();
    render(<Followup patient={patient} onBack={onBack} />);
    expect(screen.getByRole('heading', { name: 'Ana María Ejemplo Prueba' })).toBeTruthy();
    expect(screen.getByLabelText('Indicadores del paciente')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '← Volver al expediente' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('presenta cada sección como una vista, no como una respuesta serializada', async () => {
    const user = userEvent.setup(); render(<Followup patient={patient} onBack={() => {}} />);
    for (const title of ['Consultas', 'Mediciones', 'Historial', 'Evolución', 'Resumen', 'Documentos', 'Notas manuales']) {
      await user.click(screen.getByRole('button', { name: title, exact: true }));
      expect(screen.getByRole('heading', { name: title, exact: true })).toBeTruthy();
      expect(screen.getByRole('button', { name: title, exact: true }).getAttribute('aria-current')).toBe('page');
    }
    expect(document.querySelector('pre')).toBeNull();
  });

  it('conserva estados visuales de carga, vacío y error para verificación accesible', async () => {
    const user = userEvent.setup(); render(<Followup patient={patient} onBack={() => {}} preview />);
    await user.click(screen.getByText('Vista previa de estados · sin datos clínicos'));
    const selector = screen.getByLabelText('Estado visual');
    await user.selectOptions(selector, 'loading');
    expect(screen.getByText('Cargando historial…').parentElement.getAttribute('aria-busy')).toBe('true');
    await user.selectOptions(selector, 'empty');
    expect(screen.getByText('Este paciente aún no tiene consultas')).toBeTruthy();
    await user.selectOptions(selector, 'error');
    expect(screen.getByRole('alert').textContent).toContain('simulado');
  });
});
