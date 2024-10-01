import { test, takeSnapshot } from "@chromatic-com/playwright";
import { testApps } from "../scripts/buildTestApps";

test("Test Apps", async ({ page }, testInfo) => {
  testApps.forEach(async (app) => {
    await page.goto(`/${app.name}`);
    await takeSnapshot(page, app.name, testInfo); 
  });
});
