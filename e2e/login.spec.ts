import { test, expect } from "@playwright/test"

const pid = process.env.STANDARD_BRUKER ?? process.env.TEST_PID

test.skip(!pid, "STANDARD_BRUKER eller TEST_PID må være satt i miljø")

test("Innlogging og utlogging via ID-porten TestID", async ({ page }) => {
  // --- 1. Gå til login-siden ---
  await page.goto("/login")
  await expect(page).toHaveURL("/login")

  // --- 2. Klikk "Logg inn med ID-porten" ---
  await page.getByRole("button", { name: /logg inn med id-porten/i }).click()

  // --- 3. Vent på ID-portens selector-side ---
  await page.waitForURL(/test\.idporten\.no/, { timeout: 15_000 })

  // --- 4. Velg "TestID på nivå høyt" ---
  await page.getByRole("link", { name: /testid på nivå høyt/i }).click()

  // --- 5. Fyll inn fødselsnummer og autentiser ---
  await page.getByLabel(/personidentifikator/i).fill(pid!)
  await page.getByRole("button", { name: /autentiser/i }).click()

  // --- 6. Vent på redirect til /dashboard ---
  await page.waitForURL("**/dashboard", { timeout: 15_000 })
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page).not.toHaveURL(/error/)

  // --- 7. Verifiser brukerinfo på dashboard ---
  const userInfoCard = page.locator("[data-testid='user-info']")
  await expect(userInfoCard).toContainText("FORNØYD BARBERSKUM")
  await expect(userInfoCard).toContainText(pid!)

  // --- 8. Verifiser "Logg ut"-knapp ---
  const loggUtLink = page.getByRole("link", { name: /logg ut/i })
  await expect(loggUtLink).toBeVisible()

  // --- 9. Logg ut og verifiser redirect til /login ---
  await loggUtLink.click()
  await page.waitForURL("**/login", { timeout: 15_000 })
  await expect(page).toHaveURL(/\/login$/)
  await expect(page).not.toHaveURL(/error/)
})
