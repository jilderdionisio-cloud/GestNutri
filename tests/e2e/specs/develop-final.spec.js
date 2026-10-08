import { expect, test } from '@playwright/test';

const owner = { username: 'qa_e2e_owner', password: 'QA-E2E-owner-2026!' };

async function login(page) {
  await page.goto('/');
  await page.getByLabel('Usuario').fill(owner.username);
  await page.getByLabel('Contraseña').fill(owner.password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Pacientes', exact: true })).toBeVisible();
}

async function postJson(page, path, body) {
  return page.evaluate(async ({ path, body }) => {
    const csrf = await fetch('/api/v1/auth/csrf/').then(response => response.json());
    const response = await fetch(`/api/v1/${path}`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf.csrfToken },
      body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }, { path, body });
}

test('seguimiento S2 muestra vacío real y error 500 recuperable', async ({ page }) => {
  await login(page);
  const suffix = Date.now();
  const created = await postJson(page, 'patients/', {
    first_name: 'QA', last_name: `EmptyFollowup${suffix}`, phone: '+12025550994',
    email: `qa-empty-followup-${suffix}@example.test`, allergies: '', restrictions: '', birth_date: null,
  });
  expect(created.status).toBe(201);
  await page.getByPlaceholder('Nombre, teléfono o correo').fill(`qa-empty-followup-${suffix}@example.test`);
  await page.getByRole('button', { name: `Ver expediente de QA EmptyFollowup${suffix}` }).click();
  await page.getByRole('button', { name: 'Abrir seguimiento nutricional' }).click();
  await expect(page.locator('.empty[role="status"]')).toContainText('Este paciente aún no tiene consultas.');
  await expect(page.getByRole('button', { name: 'Crear primera consulta' })).toBeVisible();

  let injected = true;
  await page.route('**/api/v1/patients/*/history/**', async route => {
    if (injected) {
      injected = false;
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'fallo controlado QA' }) });
    } else await route.continue();
  });
  await page.getByRole('button', { name: 'Consultas' }).click();
  await page.getByRole('button', { name: 'Historial' }).click();
  await expect(page.getByRole('alert')).toContainText('fallo controlado QA');
  const recovered = page.waitForResponse(response => response.url().includes('/history/') && response.status() === 200);
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await recovered;
  await expect(page.locator('.empty[role="status"]')).toContainText('Este paciente aún no tiene consultas.');
  expect(injected).toBe(false);
});

test('formulario S2 muestra en pantalla la validación real del servidor', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: '+ Nuevo paciente' }).click();
  await page.getByLabel('Nombre').fill('QA');
  await page.getByLabel('Apellidos').fill(`ServerValidation${Date.now()}`);
  await page.getByLabel('Teléfono internacional').fill('+12025550995');
  await page.getByLabel('Correo electrónico').fill(`qa-validation-${Date.now()}@example.test`);
  await page.getByRole('button', { name: 'Guardar paciente' }).click();
  await page.getByRole('button', { name: 'Abrir seguimiento nutricional' }).click();
  await page.getByRole('button', { name: 'Consultas' }).click();
  await page.getByLabel('Fecha con zona horaria').fill('2026-10-01T10:00');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('button', { name: 'Mediciones' })).toBeVisible();
  await page.getByRole('button', { name: 'Mediciones' }).click();
  await page.locator('form').getByLabel('Consulta').selectOption({ index: 1 });
  await page.getByLabel('Peso kg').fill('70');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('button', { name: 'Mediciones' })).toBeVisible();
  await page.getByRole('button', { name: 'Mediciones' }).click();
  await page.locator('form').getByLabel('Consulta').selectOption({ index: 1 });
  await page.getByLabel('Peso kg').fill('71');
  const duplicate = page.waitForResponse(response => response.url().includes('/measurements/') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Guardar' }).click();
  expect((await duplicate).status()).toBe(400);
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText(/measurement|medición|unique|consulta/i);
});

test('regresión S1 con datos S2: edición persiste y logout', async ({ page }) => {
  await login(page);
  const suffix = Date.now();
  const original = `QA S1 ${suffix}`;
  const edited = `QA S1 Editado ${suffix}`;
  await page.getByRole('button', { name: '+ Nuevo paciente' }).click();
  await page.getByLabel('Nombre').fill('QA');
  await page.getByLabel('Apellidos').fill(original);
  await page.getByLabel('Teléfono internacional').fill('+12025550993');
  await page.getByLabel('Correo electrónico').fill(`qa-s1-${suffix}@example.test`);
  await page.getByRole('button', { name: 'Guardar paciente' }).click();
  await expect(page.getByRole('heading', { name: `QA ${original}` })).toBeVisible();
  await page.getByRole('button', { name: 'Volver a pacientes' }).click();
  await page.getByPlaceholder('Nombre, teléfono o correo').fill(`qa-s1-${suffix}@example.test`);
  await page.getByRole('button', { name: `Ver expediente de QA ${original}` }).click();
  await expect(page.getByRole('heading', { name: `QA ${original}` })).toBeVisible();
  await page.getByRole('button', { name: 'Editar paciente' }).click();
  await page.getByLabel('Apellidos').fill(edited);
  await page.getByRole('button', { name: 'Guardar paciente' }).click();
  await expect(page.getByRole('heading', { name: `QA ${edited}` })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Pacientes', exact: true })).toBeVisible();
  await page.getByPlaceholder('Nombre, teléfono o correo').fill(`qa-s1-${suffix}@example.test`);
  await page.getByRole('button', { name: `Ver expediente de QA ${edited}` }).click();
  await expect(page.getByRole('heading', { name: `QA ${edited}` })).toBeVisible();
  await page.getByRole('button', { name: 'Salir' }).click();
  await expect(page.getByRole('heading', { name: 'Bienvenida a GestNutri' })).toBeVisible();
});
