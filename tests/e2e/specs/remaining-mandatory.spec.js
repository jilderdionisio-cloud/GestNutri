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

  for (const [index, expected] of ['first', 'equal', 'increase', 'decrease', 'insufficient_data'].entries()) {
    await page.getByLabel('Consulta para evolución').selectOption(fixture.consultations[index].id);
    await expect(page.getByLabel('Respuesta de seguimiento')).toContainText(`"status": "${expected}"`);
  }
});

test('formatos, límite y consulta opcional de documentos se validan contra PostgreSQL', async ({ page }) => {
  await login(page, other);
  const foreign = await createPatientAndConsultations(page, 'ForeignDocument', ['65.00']);
  await logout(page);

  await login(page, owner);
  const mine = await createPatientAndConsultations(page, 'DocumentRules', ['70.00']);
  const results = await page.evaluate(async ({ patientId, foreignConsultationId }) => {
    async function upload({ name, type, size, consultation }) {
      const csrf = await fetch('/api/v1/auth/csrf/').then(response => response.json());
      const bytes = new Uint8Array(size);
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
});
