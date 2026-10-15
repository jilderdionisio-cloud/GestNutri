import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Workspace } from './main.jsx';

afterEach(cleanup);

const sharedProps = {
  view: 'list', status: 'ready', patient: null, values: {}, errors: {}, pagination: { count: 1 }, query: '', busy: false,
  notice: '', message: '', navigate: () => {}, save: () => {}, onRetry: () => {}, onChangeValues: () => {},
  setQuery: () => {}, setPage: () => {}, scenario: 'normal', setScenario: () => {},
};

describe('acciones de WhatsApp por paciente', () => {
  it('usa exclusivamente el teléfono internacional del registro y se actualiza al editarlo', () => {
    const firstPhone = '+12025550123';
    const patient = { id: 'patient-1', first_name: 'Ana', last_name: 'Prueba', phone: firstPhone, email: '' };
    const { rerender } = render(<Workspace {...sharedProps} rows={[patient]} />);
    const action = screen.getByRole('link', { name: 'Abrir WhatsApp para Ana Prueba' });
    expect(action.getAttribute('href')).toBe('https://wa.me/12025550123');
    expect(action.getAttribute('target')).toBe('_blank');
    expect(action.getAttribute('rel')).toBe('noopener noreferrer');
    rerender(<Workspace {...sharedProps} rows={[{ ...patient, phone: '+5215512345678' }]} />);
    expect(screen.getByRole('link', { name: 'Abrir WhatsApp para Ana Prueba' }).getAttribute('href')).toBe('https://wa.me/5215512345678');
  });

  it('deshabilita la acción y explica qué falta si el teléfono no es internacional válido', () => {
    render(<Workspace {...sharedProps} rows={[{ id: 'patient-2', first_name: 'Sin', last_name: 'Teléfono', phone: '5512345678', email: '' }]} />);
    expect(screen.queryByRole('link', { name: /WhatsApp/ })).toBeNull();
    expect(screen.getByTitle('Completa el teléfono internacional del paciente para usar WhatsApp.')).toHaveProperty('textContent', expect.stringContaining('WhatsApp'));
  });
});
