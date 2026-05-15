import { expect, test } from "@playwright/test";

test("flujo critico: onboarding, crear categoria y añadir item", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Escribe tu nombre...").fill("Tester Pixel");
  await page.getByRole("button", { name: "Comenzar Aventura" }).click();

  await expect(page.getByText("Configura tus categorías de ocio")).toBeVisible();

  await page.getByRole("button", { name: "Nueva categoría" }).first().click();
  await page.getByPlaceholder("Nombre de la categoría...").fill("Podcasts");
  await page.getByRole("button", { name: "Añadir" }).click();

  await page.getByRole("button", { name: "Ir al Dashboard" }).click();
  await expect(page.getByText("ORGANIZADOR DE OCIO")).toBeVisible();

  await page.getByRole("button", { name: "Añadir" }).first().click();
  await page.getByPlaceholder("Título...").fill("Programa Retro");
  await page.locator("form").last().getByRole("button", { name: "Añadir", exact: true }).click();
  await expect(page.getByText("Programa Retro")).toBeVisible();
});
