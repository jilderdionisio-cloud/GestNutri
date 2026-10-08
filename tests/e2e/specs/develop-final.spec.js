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

test('UI muestra vacío real, error recuperable y validación del servidor', async ({ page }) => {
  await login(page);
  const unique = `qa-empty-${Date.now()}@example.test`;
  await page.getByPlaceholder('Nombre, teléfono o correo').fill(unique);
  await expect(page.getByRole('heading', { name: 'No hay pacientes para mostrar' })).toBeVisible();

  let failed = true;
  await page.route('**/api/v1/patients/**', async route => {
    if (failed) { failed = false; await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'fallo controlado' }) }); }
    else await route.continue();
  });
  await page.getByPlaceholder('Nombre, teléfono o correo').fill('');
  await expect(page.getByRole('alert')).toContainText('fallo controlado');
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByRole('heading', { name: 'Pacientes', exact: true })).toBeVisible();

  const invalid = await postJson(page, 'patients/', {
    first_name: 'QA', last_name: 'InvalidServer', phone: '123',
    email: 'not-an-email', allergies: '', restrictions: '', birth_date: null,
  });
  expect(invalid.status).toBe(400);
  expect(invalid.body).toBeTruthy();
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
