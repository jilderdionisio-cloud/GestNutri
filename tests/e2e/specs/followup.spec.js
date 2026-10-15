import { expect, test } from '@playwright/test';

const owner = { username: 'qa_e2e_owner', password: 'QA-E2E-owner-2026!' };
const other = { username: 'qa_e2e_other', password: 'QA-E2E-other-2026!' };
const patient = {
  first_name: 'QA E2E',
  last_name: 'Paciente Sintetico',
  phone: '+12025550991',
  email: 'qa.e2e.patient@example.test',
};

async function login(page, credentials) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bienvenida a GestNutri' })).toBeVisible();
  await page.getByLabel('Usuario').fill(credentials.username);
  await page.getByLabel('Contraseña').fill(credentials.password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Pacientes', exact: true })).toBeVisible();
}

async function openFollowup(page) {
  await page.getByRole('button', { name: '+ Nuevo paciente' }).click();
  for (const [name, value] of Object.entries(patient)) {
    await page.locator(`[name="${name}"]`).fill(value);
  }
  const created = page.waitForResponse(response =>
    response.url().endsWith('/api/v1/patients/') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Guardar paciente' }).click();
  const patientResponse = await created;
  expect(patientResponse.status()).toBe(201);
  const savedPatient = await patientResponse.json();
  await expect(page.getByText('Paciente guardado correctamente.')).toBeVisible();
  await page.getByRole('button', { name: 'Abrir seguimiento nutricional' }).click();
  await expect(page.getByRole('heading', { name: 'Seguimiento nutricional' })).toBeVisible();
  return savedPatient;
}

async function returnToFollowupAfterReload(page) {
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Pacientes', exact: true })).toBeVisible();
  await page.getByPlaceholder('Nombre, teléfono o correo').fill(patient.email);
  await page.getByRole('button', { name: `Ver expediente de ${patient.first_name} ${patient.last_name}` }).click();
  await page.getByRole('button', { name: 'Abrir seguimiento nutricional' }).click();
}

test('recorrido API real y aislamiento entre dos propietarios', async ({ page }) => {
  await login(page, owner);
  const savedPatient = await openFollowup(page);

  await page.getByRole('button', { name: 'Consultas' }).click();
  const consultationCreated = page.waitForResponse(response =>
    response.url().includes(`/api/v1/patients/${savedPatient.id}/consultations/`) && response.request().method() === 'POST');
  await page.getByLabel('Fecha con zona horaria').fill('2026-10-01T10:00');
  await page.locator('form').filter({ has: page.getByLabel('Fecha con zona horaria') }).getByRole('button', { name: 'Guardar consulta' }).click();
  const consultationResponse = await consultationCreated;
  expect(consultationResponse.status()).toBe(201);
  const consultation = await consultationResponse.json();

  // Reload proves persistence and refreshes the consultation selector from the real API.
  await returnToFollowupAfterReload(page);

  await page.getByRole('button', { name: 'Mediciones' }).click();
  await page.getByLabel('Consulta').selectOption(consultation.id);
  const measurementCreated = page.waitForResponse(response =>
    response.url().includes(`/api/v1/consultations/${consultation.id}/measurements/`) && response.request().method() === 'POST');
  await page.getByLabel('Peso en kilogramos').fill('70.00');
  await page.locator('form').filter({ has: page.getByLabel('Peso en kilogramos') }).getByRole('button', { name: 'Guardar medición' }).click();
  expect((await measurementCreated).status()).toBe(201);

  await page.getByRole('button', { name: 'Notas manuales' }).click();
  await page.getByLabel('Consulta').selectOption(consultation.id);
  const noteCreated = page.waitForResponse(response =>
    response.url().includes(`/api/v1/consultations/${consultation.id}/notes/`) && response.request().method() === 'POST');
  await page.getByLabel('Texto').fill('Nota E2E sintética sin interpretación clínica.');
  await page.locator('form').filter({ has: page.getByLabel('Texto') }).getByRole('button', { name: 'Guardar nota' }).click();
  expect((await noteCreated).status()).toBe(201);

  await expect(page.getByText('Registro guardado correctamente.')).toBeVisible();

  await page.getByRole('button', { name: 'Evolución' }).click();
  await page.getByLabel('Consulta').selectOption(consultation.id);
  await expect(page.getByText('Primera consulta')).toBeVisible();

  await page.getByRole('button', { name: 'Resumen' }).click();
  await expect(page.getByText('70 kg')).toBeVisible();

  await page.getByRole('button', { name: 'Documentos' }).click();
  await page.getByLabel('Consulta').selectOption(consultation.id);
  await page.getByLabel('Archivo privado').setInputFiles({
    name: 'qa-e2e.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 synthetic QA E2E'),
  });
  const documentCreated = page.waitForResponse(response =>
    response.url().includes(`/api/v1/patients/${savedPatient.id}/documents/`) && response.request().method() === 'POST');
  await page.locator('form').filter({ has: page.getByLabel('Archivo privado') }).getByRole('button', { name: 'Cargar documento' }).click();
  expect((await documentCreated).status()).toBe(201);

  await page.getByRole('button', { name: 'Documentos' }).click();
  const downloadButton = page.getByRole('link', { name: 'Descargar qa-e2e.pdf' });
  await expect(downloadButton).toBeVisible();
  const download = page.waitForEvent('download');
  await downloadButton.click();
  expect((await download).suggestedFilename()).toBe('qa-e2e.pdf');

  await returnToFollowupAfterReload(page);
  // History is the default section after reload and renders its real API response as a table/card.
  await expect(page.getByText('Medición disponible')).toBeVisible();

  await page.getByRole('button', { name: 'Salir' }).click();
  await expect(page.getByRole('heading', { name: 'Bienvenida a GestNutri' })).toBeVisible();

  await login(page, other);
  await page.getByPlaceholder('Nombre, teléfono o correo').fill(patient.email);
  await expect(page.getByText('No hay pacientes para mostrar')).toBeVisible();
  const isolation = await page.evaluate(async patientId => {
    const responses = await Promise.all([
      fetch(`/api/v1/patients/${patientId}/`),
      fetch(`/api/v1/patients/${patientId}/documents/`),
    ]);
    return responses.map(response => response.status);
  }, savedPatient.id);
  expect(isolation).toEqual([404, 404]);
});
