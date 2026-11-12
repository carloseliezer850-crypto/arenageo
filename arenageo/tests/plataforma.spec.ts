import { test, expect } from "@playwright/test";

test("menu móvel mantém destinos e fecha por Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/quadro-tatico");
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation").getByRole("link", { name: "Quadro tático" })).toBeVisible();
  await expect(page.locator(".header-actions").getByRole("link", { name: "Entrar", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("quadro posiciona por clique e permite desfazer", async ({ page }) => {
  await page.goto("/quadro-tatico");
  const piece = page.locator('[data-peca]').first();
  const initial = await piece.getAttribute("transform");
  await piece.click();
  const field = page.locator('svg').first();
  await field.click({ position: { x: 200, y: 180 } });
  await expect(piece).not.toHaveAttribute("transform", initial!);
  await page.getByRole("button", { name: "Desfazer", exact: true }).click();
  await expect(piece).toHaveAttribute("transform", initial!);
});

test("painel comercial antigo redireciona", async ({ page }) => {
  await page.goto("/empresa/painel");
  await expect(page).toHaveURL(/\/(gestao|entrar)(\?|$)/);
});
