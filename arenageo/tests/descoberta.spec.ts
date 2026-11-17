import { test, expect } from "@playwright/test";

test("descoberta é voluntária, filtros persistem e cookie forjado não autentica o cabeçalho", async ({
  page,
}) => {
  const fakeClaims = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
  ).toString("base64url");
  await page.context().addCookies([
    {
      name: "arenageo_sessao",
      value: `invalid.${fakeClaims}.invalid`,
      url: "http://localhost:3100",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Meu painel", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.locator("header").getByRole("link", { name: "Entrar", exact: true }),
  ).toBeVisible();
  const sports = await (
    await page.request.get("http://localhost:8088/esportes")
  ).json();
  const levels = await (
    await page.request.get("http://localhost:8088/niveis")
  ).json();
  const response = await page.request.post("http://localhost:8088/jogadores", {
    data: {
      user: {
        name: "Nome cadastral reservado",
        username: "e2e.descoberta",
        email: "descoberta@example.test",
        cpf: "39053344705",
        password: "frase descoberta segura",
      },
      address: { state: "RS", city: "Pelotas" },
      sports: [{ sportId: sports[0].id, skillLevelId: levels[0].id }],
    },
  });
  expect(response.ok()).toBeTruthy();
  const auth = await response.json();
  await page.context().addCookies([
    {
      name: "arenageo_sessao",
      value: auth.token,
      url: "http://localhost:3100",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await page.goto("/perfil/descoberta");
  await expect(
    page.getByLabel("Quero aparecer na busca de jogadores"),
  ).not.toBeChecked();
  await page
    .getByLabel("Nome público", { exact: true })
    .fill("Perfil público E2E");
  await page.getByLabel("Cidade pública", { exact: true }).fill("Bagé");
  await page.getByLabel("Quero aparecer na busca de jogadores").check();
  await page
    .getByRole("button", { name: "Adicionar horário", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Salvar descoberta", exact: true })
    .click();
  await expect(
    page.getByText("Descoberta atualizada.", { exact: true }),
  ).toBeVisible();
  const anonymous = await page
    .context()
    .browser()!
    .newContext({ baseURL: "http://localhost:3100" });
  const viewer = await anonymous.newPage();
  await viewer.goto("/jogadores");
  await viewer.getByLabel("Cidade", { exact: true }).fill("bage");
  await viewer.getByLabel("UF", { exact: true }).selectOption("RS");
  await viewer.getByLabel("Nome público", { exact: true }).fill("publico E2E");
  await viewer
    .getByRole("button", { name: "Pesquisar jogadores", exact: true })
    .click();
  await expect(
    viewer.getByRole("heading", { name: "Perfil público E2E", exact: true }),
  ).toBeVisible();
  await viewer.reload();
  await expect(viewer.getByLabel("Cidade", { exact: true })).toHaveValue(
    "bage",
  );
  await viewer.getByRole("link", { name: "Ver perfil", exact: true }).click();
  const detail = viewer.url();
  await expect(
    viewer.getByRole("heading", { name: "Perfil público E2E", exact: true }),
  ).toBeVisible();
  await expect(
    viewer.getByText("Nome cadastral reservado", { exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Quero aparecer na busca de jogadores").uncheck();
  await page
    .getByRole("button", { name: "Salvar descoberta", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Salvar descoberta", exact: true }),
  ).toBeEnabled();
  const publicPath = new URL(detail).pathname;
  await expect
    .poll(async () =>
      (await viewer.request.get("http://localhost:8088" + publicPath)).status(),
    )
    .toBe(404);
  await viewer.goto(detail);
  await expect(
    viewer.getByRole("heading", { name: "Perfil público E2E", exact: true }),
  ).toHaveCount(0);
  await expect(
    viewer.getByRole("heading", { name: /não encontrad/i }),
  ).toBeVisible();
  await anonymous.close();
});
