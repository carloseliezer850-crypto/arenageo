import { test, expect } from "@playwright/test";
function cpf(base: string) {
  let value = base;
  for (let size = 9; size < 11; size++) {
    const sum = [...value].reduce(
      (acc, d, i) => acc + Number(d) * (size + 1 - i),
      0,
    );
    const digit = (sum * 10) % 11;
    value += String(digit === 10 ? 0 : digit);
  }
  return value;
}
test("organizador aprova solicitação sem ocupar vaga antecipadamente", async ({
  page,
  browser,
}) => {
  const sports = await (
    await page.request.get("http://localhost:8088/esportes")
  ).json();
  const levels = await (
    await page.request.get("http://localhost:8088/niveis")
  ).json();
  async function register(username: string, base: string) {
    const r = await page.request.post("http://localhost:8088/jogadores", {
      data: {
        user: {
          name: username,
          username,
          email: `${username}@example.test`,
          cpf: cpf(base),
          password: "frase aprovar segura",
        },
        address: { state: "RS", city: "Bagé" },
        sports: [{ sportId: sports[0].id, skillLevelId: levels[0].id }],
      },
    });
    expect(r.ok()).toBeTruthy();
    return r.json();
  }
  const owner = await register("e2e.aprovador", "938201005");
  const guest = await register("e2e.solicitante", "938201006");
  await page
    .context()
    .addCookies([
      {
        name: "arenageo_sessao",
        value: owner.token,
        url: "http://localhost:3100",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  await page.goto("/criar-partida");
  await page.locator('[name="title"]').fill("Jogo com aprovação E2E");
  await page.locator('[name="sportId"]').selectOption(String(sports[0].id));
  await page
    .locator('[name="skillLevelId"]')
    .selectOption(String(levels[0].id));
  await page
    .locator('[name="dateTime"]')
    .fill(
      new Date(Date.now() + 8 * 86400000).toISOString().slice(0, 10) + "T18:00",
    );
  await page.locator('[name="maxPlayers"]').fill("2");
  await page.locator('[name="city"]').fill("Bagé");
  await page.locator('[name="location"]').fill("Local a combinar");
  await page
    .getByRole("textbox", { name: "Descrição e regras", exact: true })
    .fill("Partida gratuita, solicite sua participação.");
  await page.getByLabel("Exigir minha aprovação para participar").check();
  await page
    .getByRole("button", { name: "Publicar partida", exact: true })
    .click();
  await expect(page).toHaveURL(/\/partidas\/\d+$/);
  const matchUrl = page.url();
  const context = await browser.newContext({
    baseURL: "http://localhost:3100",
  });
  await context.addCookies([
    {
      name: "arenageo_sessao",
      value: guest.token,
      url: "http://localhost:3100",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  const applicant = await context.newPage();
  await applicant.goto(matchUrl);
  await applicant
    .getByRole("button", { name: "Solicitar participação", exact: true })
    .click();
  await expect(
    applicant.getByText("Sua participação: SOLICITADA", { exact: true }),
  ).toBeVisible();
  await expect(
    applicant.getByText("Gratuita · 1 de 2 participantes confirmados", {
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Aprovar e2e.solicitante", exact: true })
    .click();
  await expect(
    page.getByText("Nenhuma solicitação pendente.", { exact: true }),
  ).toBeVisible();
  await applicant.reload();
  await expect(
    applicant.getByText("Sua participação: CONFIRMADA", { exact: true }),
  ).toBeVisible();
  await context.close();
});
