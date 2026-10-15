import { expect, test } from '@playwright/test';

const owner = { username: 'qa_e2e_owner', password: 'QA-E2E-owner-2026!' };
const other = { username: 'qa_e2e_other', password: 'QA-E2E-other-2026!' };

async function login(page, credentials) {
  await page.goto('/');
  await page.getByLabel('Usuario').fill(credentials.username);
  await page.getByLabel('Contraseña').fill(credentials.password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Pacientes', exact: true })).toBeVisible();
}

async function logout(page) {
  await page.getByRole('button', { name: 'Salir' }).click();
  await expect(page.getByRole('heading', { name: 'Bienvenida a GestNutri' })).toBeVisible();
}

async function createPatientAndConsultations(page, label, weights = []) {
  return page.evaluate(async ({ label, weights }) => {
    async function post(path, body) {
      const csrf = await fetch('/api/v1/auth/csrf/').then(response => response.json());
      const response = await fetch(`/api/v1/${path}`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf.csrfToken },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      return response.json();
    }
    const patient = await post('patients/', {
      first_name: 'QA', last_name: label, phone: '+12025550992',
      email: `qa-${label.toLowerCase()}@example.test`, allergies: '', restrictions: '', birth_date: null,
    });
    const consultations = [];
    for (const [index, weight] of weights.entries()) {
      const consultation = await post(`patients/${patient.id}/consultations/`, {
        occurred_at: `2026-09-0${index + 1}T10:00:00Z`,
      });
      if (weight !== null) await post(`consultations/${consultation.id}/measurements/`, { weight_kg: weight });
      consultations.push(consultation);
    }
    if (consultations[0]) await post(`consultations/${consultations[0].id}/notes/`, { kind: 'note', text: 'Nota sintética de auditoría.' });
    return { patient, consultations };
  }, { label, weights });
}

test('estados reales restantes de evolución se muestran desde la API PostgreSQL', async ({ page }) => {
  await login(page, owner);
  const fixture = await createPatientAndConsultations(page, 'EvolutionStates', ['70.00', '70.00', '71.00', '70.00', null]);

  await page.getByPlaceholder('Nombre, teléfono o correo').fill(fixture.patient.email);
  await page.getByRole('button', { name: 'Ver expediente de QA EvolutionStates' }).click();
  await page.getByRole('button', { name: 'Abrir seguimiento nutricional' }).click();
  await page.getByRole('button', { name: 'Evolución' }).click();

  for (const [index, expected] of ['Primera consulta', 'Sin cambio registrado', 'Aumento registrado', 'Disminución registrada', 'Datos insuficientes'].entries()) {
    await page.getByLabel('Consulta').selectOption(fixture.consultations[index].id);
    await expect(page.getByText(expected, { exact: true })).toBeVisible();
  }
});

test('historial rechaza parámetros de paginación inválidos', async ({ page }) => {
  await login(page, owner);
  const fixture = await createPatientAndConsultations(page, 'HistoryPagination', []);
  const statuses = await page.evaluate(async patientId => Promise.all([
    'page=bad', 'page=0', 'page_size=bad', 'page_size=-1',
  ].map(query => fetch(`/api/v1/patients/${patientId}/history/?${query}`, { credentials: 'include' })
    .then(response => response.status))), fixture.patient.id);
  expect(statuses).toEqual([400, 400, 400, 400]);
});

test('Reintentar vuelve a ejecutar la solicitud fallida', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/v1/patients/**', async route => {
    attempts += 1;
    if (attempts === 1) await route.abort('failed');
    else await route.continue();
  });
  await login(page, owner);
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
  const retryResponse = page.waitForResponse(response => response.url().includes('/api/v1/patients/') && response.status() === 200);
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await retryResponse;
  await expect(page.getByRole('heading', { name: 'Pacientes', exact: true })).toBeVisible();
  expect(attempts).toBe(2);
});

test('formatos, límite y consulta opcional de documentos se validan contra PostgreSQL', async ({ page }) => {
  await login(page, other);
  const foreign = await createPatientAndConsultations(page, 'ForeignDocument', ['65.00']);
  await logout(page);

  await login(page, owner);
  const mine = await createPatientAndConsultations(page, 'DocumentRules', ['70.00']);
  const empty = await createPatientAndConsultations(page, 'EmptySummary', []);
  const results = await page.evaluate(async ({ patientId, foreignConsultationId }) => {
    async function upload({ name, type, size, consultation }) {
      const csrf = await fetch('/api/v1/auth/csrf/').then(response => response.json());
      const bytes = new Uint8Array(size);
      const signatures = {
        'application/pdf': [0x25, 0x50, 0x44, 0x46, 0x2d],
        'image/jpeg': [0xff, 0xd8, 0xff],
        'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      };
      (signatures[type] || []).forEach((byte, index) => { bytes[index] = byte; });
      const form = new FormData();
      form.append('file', new File([bytes], name, { type }));
      if (consultation) form.append('consultation', consultation);
      const response = await fetch(`/api/v1/patients/${patientId}/documents/`, {
        method: 'POST', credentials: 'include', headers: { 'X-CSRFToken': csrf.csrfToken }, body: form,
      });
      return response.status;
    }
    return {
      pdf: await upload({ name: 'rules.pdf', type: 'application/pdf', size: 64 }),
      jpeg: await upload({ name: 'rules.jpg', type: 'image/jpeg', size: 64 }),
      png: await upload({ name: 'rules.png', type: 'image/png', size: 64 }),
      exactLimit: await upload({ name: 'limit.pdf', type: 'application/pdf', size: 10 * 1024 * 1024 }),
      tooLarge: await upload({ name: 'too-large.pdf', type: 'application/pdf', size: 10 * 1024 * 1024 + 1 }),
      wrongType: await upload({ name: 'rules.txt', type: 'text/plain', size: 64 }),
      foreignConsultation: await upload({ name: 'foreign.pdf', type: 'application/pdf', size: 64, consultation: foreignConsultationId }),
    };
  }, { patientId: mine.patient.id, foreignConsultationId: foreign.consultations[0].id });

  expect(results).toEqual({
    pdf: 201, jpeg: 201, png: 201, exactLimit: 201,
    tooLarge: 400, wrongType: 400, foreignConsultation: 400,
  });
  const emptySummary = await page.evaluate(patientId => fetch(`/api/v1/patients/${patientId}/summary/`, { credentials: 'include' }).then(response => response.json()), empty.patient.id);
  expect(emptySummary).toMatchObject({ consultations: 0, measurements: 0, latest_weight_kg: null });
});
