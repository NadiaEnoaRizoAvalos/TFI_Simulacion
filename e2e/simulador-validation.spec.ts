import { expect, test } from "@playwright/test";

async function openSimulator(page: import("@playwright/test").Page) {
  await page.goto("/simulador");
  await expect(page.getByRole("heading", { name: "Parámetros de simulación" })).toBeVisible();
}

test("empty submit shows required validation", async ({ page }) => {
  await openSimulator(page);

  await page.getByRole("button", { name: /Iniciar simulación/ }).click();

  await expect(page.getByText("Este campo es obligatorio")).toHaveCount(2);
});

test("decimal printers are rejected", async ({ page }) => {
  await openSimulator(page);

  await page.getByLabel("Cantidad de impresoras").fill("1.5");
  await page.getByLabel("Espacio total del galpón (m³)").fill("10");
  await page.getByRole("button", { name: /Iniciar simulación/ }).click();

  await expect(page.getByText("Debe ser un número entero")).toBeVisible();
});

test("huge printers are rejected", async ({ page }) => {
  await openSimulator(page);

  await page.getByLabel("Cantidad de impresoras").fill("100001");
  await page.getByLabel("Espacio total del galpón (m³)").fill("10");
  await page.getByRole("button", { name: /Iniciar simulación/ }).click();

  await expect(page.getByText("El número es muy grande. Probá con uno más chico.")).toBeVisible();
});

test("huge warehouse capacity is rejected", async ({ page }) => {
  await openSimulator(page);

  await page.getByLabel("Cantidad de impresoras").fill("1");
  await page.getByLabel("Espacio total del galpón (m³)").fill("1000001");
  await page.getByRole("button", { name: /Iniciar simulación/ }).click();

  await expect(page.getByText("El número es muy grande. Probá con uno más chico.")).toBeVisible();
});

test("valid small input reaches results", async ({ page }) => {
  await openSimulator(page);

  await page.getByLabel("Cantidad de impresoras").fill("1");
  await page.getByLabel("Espacio total del galpón (m³)").fill("10");
  await page.getByRole("button", { name: /Iniciar simulación/ }).click();

  await expect(page.getByText("Debe ser un número entero")).toHaveCount(0);
  await expect(page.getByText("El número es muy grande. Probá con uno más chico.")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Resultados de la simulación" })).toBeVisible();
});
