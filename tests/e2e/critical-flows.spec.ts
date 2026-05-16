import { expect, test } from "@playwright/test";

const completarOnboarding = async (page: import("@playwright/test").Page, userName: string, categoryName: string) => {
  await page.goto("/");
  await page.getByPlaceholder("Escribe tu nombre...").fill(userName);
  await page.getByRole("button", { name: "Comenzar Aventura" }).click();

  await expect(page.getByRole("button", { name: /Nueva categor/i }).first()).toBeVisible();
  await page.getByRole("button", { name: /Nueva categor/i }).first().click();
  await page.getByPlaceholder(/Nombre de la categor/i).fill(categoryName);

  const tagEditor = page.locator(".pixel-border-sm.bg-secondary").first();
  await tagEditor.getByRole("button", { name: /A.*adir|Engadir|Add/i }).first().click();

  await expect(page.getByText(categoryName)).toBeVisible();
  await page.getByRole("button", { name: "Ir al Dashboard" }).click();
  await expect(page.getByText("ORGANIZADOR DE OCIO")).toBeVisible();
};

test("flujo critico: onboarding, crear categoria y anadir item", async ({ page }) => {
  await completarOnboarding(page, "Tester Pixel", "Podcasts");

  await page.getByRole("button", { name: /A.*adir|Engadir|Add/i }).first().click();
  await page.getByPlaceholder(/T.tulo|Titulo/i).fill("Programa Retro");
  await page.locator("form").last().getByRole("button", { name: /A.*adir|Engadir|Add/i }).first().click();
  await expect(page.getByText("Programa Retro")).toBeVisible();
});

test("dashboard: permite eliminar categorias", async ({ page }) => {
  await completarOnboarding(page, "Delete User", "Temporal");

  await page.getByRole("button", { name: /Eliminar categoria Temporal/i }).click();
  await expect(page.getByText("Temporal")).not.toBeVisible();
});

test("dashboard: permite editar nombre, icono y color de categorias", async ({ page }) => {
  await completarOnboarding(page, "Edit User", "Temporal");

  await page.getByRole("button", { name: /Editar categoria Temporal/i }).click();
  await page.getByPlaceholder(/Nombre|Name|Nome/i).fill("Renombrada");

  const modal = page.locator(".fixed.inset-0.z-50").last();
  await modal.locator("button").filter({ has: page.locator("svg") }).nth(1).click();
  await modal.locator("button[style*='rgb(59, 130, 246)'], button[style*='#3b82f6']").first().click();
  await modal.getByRole("button", { name: /Guardar|Save|Gardar/i }).click();

  await expect(page.locator("span.text-pixel-sm.text-foreground", { hasText: "Renombrada" }).first()).toBeVisible();
  await expect(page.locator("h2.text-pixel-lg.text-foreground")).toHaveText("Renombrada");

  await page.getByRole("button", { name: /Eliminar categoria Renombrada/i }).click();
  await expect(page.getByText("Renombrada")).not.toBeVisible();
});

test("flujo sync: generar codigo, exportar e importar", async ({ page }) => {
  await completarOnboarding(page, "Sync User", "Sync Cat");

  await page.getByRole("button", { name: /Sincronizacion/i }).click();
  await page.getByRole("button", { name: /Generar codigo/i }).click();

  const pairTextarea = page.getByPlaceholder("Pega aqui el codigo...");
  await expect(pairTextarea).not.toHaveValue("");

  await page.getByRole("button", { name: /Exportar datos/i }).click();
  await expect(page.getByPlaceholder("Sin datos")).not.toHaveValue("");

  await page.getByRole("button", { name: /Importar datos/i }).click();
  await expect(page.getByText(/Ultima sincronizacion/i)).toBeVisible();
});
