import { test, expect } from "@playwright/test";
import {
  cpfValido,
  cnpjValido,
  erroSenha,
  formatarDocumento,
} from "../src/lib/cadastro";
test("validadores preservam documentos e respeitam bytes UTF-8", () => {
  expect(cpfValido("529.982.247-25")).toBe(true);
  expect(cpfValido("529.982.247-24")).toBe(false);
  expect(cpfValido("abc52998224725")).toBe(false);
  expect(cnpjValido("12.ABC.345/01DE-35")).toBe(true);
  expect(cnpjValido("12ABC34501DE36")).toBe(false);
  expect(formatarDocumento("12ABC34501DE35", true)).toBe("12.ABC.345/01DE-35");
  expect(erroSenha("á".repeat(37))).toContain("72 bytes");
  expect(erroSenha("uma frase com espaços")).toBe("");
});
test("jogador, perfil, empresa, arena publicada e segunda arena", async ({
  page,
}) => {
  await page.goto("/cadastro/jogador");
  await page.locator('[name="user.username"]').fill("e2e.jogador");
  await page.locator('[name="user.email"]').fill("e2e@example.test");
  await page.locator('[name="user.password"]').fill("minha frase de teste");
  await page.locator('[name="confirmacao"]').fill("minha frase de teste");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.locator('[name="user.name"]').fill("Jogador E2E");
  await page.locator('[name="user.cpf"]').fill("52998224725");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.locator('[name="address.state"]').selectOption("RS");
  await page.locator('[name="address.city"]').fill("Bagé");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  const rows = page.locator(".sport-row");
  await expect(rows.first()).toBeVisible();
  await rows.nth(0).getByRole("checkbox").check();
  await rows.nth(0).getByRole("combobox").selectOption({ index: 1 });
  await rows.nth(1).getByRole("checkbox").check();
  await rows.nth(1).getByRole("combobox").selectOption({ index: 2 });
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await expect(page).toHaveURL(/\/painel/);
  await page.goto("/perfil");
  await expect(page.locator(".sport-row input:checked")).toHaveCount(2);
  await page.locator(".sport-row input:checked").first().uncheck();
  await page
    .getByRole("button", { name: "Salvar perfil", exact: true })
    .click();
  await expect(page.locator(".cadastro-toast")).toContainText(
    "Perfil atualizado",
  );
  await page.reload();
  await expect(page.locator(".sport-row input:checked")).toHaveCount(1);
  const image = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5xkAAAAASUVORK5CYII=",
    "base64",
  );
  await page.locator("input[type=file]").setInputFiles({
    name: "perfil.png",
    mimeType: "image/png",
    buffer: image,
  });
  await expect(page.locator(".cadastro-toast")).toContainText("Imagem enviada");
  await page.reload();
  await expect(page.locator("figure img")).toBeVisible();
  await page.goto("/cadastro/empresa");
  await page.locator('[name="company.legalName"]').fill("Empresa E2E");
  await page.locator('[name="company.tradeName"]').fill("Esportes E2E");
  await page.locator('[name="company.cnpj"]').fill("12ABC34501DE35");
  await page.locator('[name="company.businessPhone"]').fill("53999999999");
  await page
    .locator('[name="company.businessEmail"]')
    .fill("empresa-e2e@example.test");
  await page.locator('[name="address.state"]').selectOption("RS");
  await page.locator('[name="address.city"]').fill("Pelotas");
  await page.locator('[name="address.neighborhood"]').fill("Centro");
  await page.locator('[name="address.street"]').fill("Rua Teste");
  await page.locator('[name="address.number"]').fill("123");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.locator('[name="arena.name"]').fill("Arena E2E");
  await page.locator('[name="arena.phone"]').fill("53999999999");
  await page.locator('[name="arena.email"]').fill("arena-e2e@example.test");
  await page
    .getByRole("checkbox", { name: "Usar o mesmo endereço da empresa" })
    .uncheck();
  await page.locator('[name="arenaAddress.city"]').fill("Bagé");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page
    .getByRole("button", { name: "Salvar cadastro", exact: true })
    .click();
  await expect(page).toHaveURL(/\/gestao$/);
  await page.getByRole("link", { name: "Arena E2E", exact: true }).click();
  await page
    .getByRole("button", { name: "Adicionar espaço", exact: true })
    .click();
  await page.locator('[name="spaces[0].name"]').fill("Quadra 1");
  await page.locator("fieldset").first().getByRole("checkbox").nth(1).check();
  await page
    .getByRole("button", { name: "Adicionar período", exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: "Publicar na busca de arenas" })
    .check();
  await page.getByRole("button", { name: "Salvar arena", exact: true }).click();
  await expect(page.locator(".cadastro-toast")).toContainText("Arena salva");
  await page.reload();
  await expect(page.locator('[name="spaces[0].name"]')).toHaveValue("Quadra 1");
  await page.goto("/painel?cidade=Bag%C3%A9");
  await expect(
    page.getByRole("heading", { name: "Arena E2E", exact: true }),
  ).toBeVisible();
  await page.goto("/gestao/nova");
  await page.locator('[name="arena.name"]').fill("Segunda Arena E2E");
  await page.locator('[name="arena.phone"]').fill("53999999999");
  await page.locator('[name="arena.email"]').fill("segunda@example.test");
  await page.locator('[name="address.state"]').selectOption("RS");
  await page.locator('[name="address.city"]').fill("Bagé");
  await page
    .getByRole("button", { name: "Criar arena e completar estrutura" })
    .click();
  await expect(page).toHaveURL(/\/gestao\/\d+/);
  await page.goto("/gestao");
  await expect(
    page.getByRole("link", { name: "Arena E2E", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Segunda Arena E2E", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/perfil");
  await expect(page.locator(".sport-row input:checked")).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/criar-partida");
  await page.locator('[name="title"]').fill("Partida E2E gratuita");
  await page.locator('[name="sportId"]').selectOption({ index: 1 });
  await page.locator('[name="skillLevelId"]').selectOption({ index: 1 });
  const future =
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) + "T18:00";
  await page.locator('[name="dateTime"]').fill(future);
  await page.locator('[name="city"]').fill("Bagé");
  await page.locator('[name="location"]').fill("Quadra combinada pelo grupo");
  await page
    .locator('[name="description"]')
    .fill("Trazer água e confirmar local com organizador.");
  await page
    .getByRole("button", { name: "Publicar partida", exact: true })
    .click();
  await expect(page).toHaveURL(/\/partidas\/\d+/);
  await expect(
    page.getByRole("heading", { name: "Partida E2E gratuita", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Sua participação: CONFIRMADA", { exact: true }),
  ).toBeVisible();
  await page.goto("/partidas?cidade=Bage&uf=RS");
  await expect(
    page.getByRole("link", { name: "Partida E2E gratuita", exact: true }),
  ).toBeVisible();
  await expect(page.locator('[name="cidade"]')).toHaveValue("Bage");
  await page.goto("/minhas-partidas");
  await expect(
    page.getByRole("link", { name: "Partida E2E gratuita", exact: true }),
  ).toBeVisible();
});
