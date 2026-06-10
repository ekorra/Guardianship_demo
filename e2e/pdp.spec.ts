import { test, expect } from "@playwright/test"

const pid = process.env.STANDARD_BRUKER ?? process.env.TEST_PID

test.skip(!pid, "STANDARD_BRUKER eller TEST_PID må være satt i miljø")

async function loggInn(page: Parameters<Parameters<typeof test>[1]>[0]) {
  await page.goto("/")
  await page.getByTestId("login-tjenesteeier").click()
  await page.waitForURL(/test\.idporten\.no/, { timeout: 15_000 })
  try {
    await page.getByRole("link", { name: /testid/i }).first().click({ timeout: 5_000 })
  } catch {
    // Allerede på PID-input-siden
  }
  await page.getByLabel(/personidentifikator/i).first().fill(pid!)
  await page.getByRole("button", { name: /autentiser/i }).click()
  await page.waitForURL("**/dashboard", { timeout: 15_000 })
}

test("Sjekk tilgang-knapp vises og badge rendres etter klikk (selv)", async ({
  page,
}) => {
  await loggInn(page)

  // Finn selv-sjekk-knappen i brukerinfo-kortet
  const selfCheck = page.locator("[data-testid='user-info']").getByRole("button", { name: /sjekk tilgang/i })
  await expect(selfCheck).toBeVisible()

  await selfCheck.click()

  // Badge skal vises — ett av de tre utfallene
  const badge = page.locator("[data-testid='user-info']").locator("span").filter({
    hasText: /tilgang|ingen tilgang|ikke aktuelt/i,
  })
  await expect(badge).toBeVisible({ timeout: 10_000 })
})

test("Sjekk tilgang-knapp vises for vergeparter i listen", async ({ page }, testInfo) => {
  await loggInn(page)

  const listButtons = page.locator("ul li").getByRole("button", {
    name: /sjekk tilgang/i,
  })

  // Hopp over hvis testbrukeren ikke har vergeparter med TilgangKnapp
  const count = await listButtons.count()
  testInfo.skip(count === 0, "Testbrukeren har ingen vergeparter med tilgangsknapp")

  await expect(listButtons.first()).toBeVisible()

  // Klikk den første og verifiser badge
  await listButtons.first().click()
  const badge = page.locator("ul li").locator("span").filter({
    hasText: /tilgang|ingen tilgang|ikke aktuelt/i,
  })
  await expect(badge.first()).toBeVisible({ timeout: 10_000 })
})
