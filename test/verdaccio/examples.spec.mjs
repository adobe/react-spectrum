import {expect, takeSnapshot, test} from '@chromatic-com/playwright';

const FIXED_TIME = new Date('2025-02-03T12:00:00Z');
const PORT = Number(process.env.VERDACCIO_SERVER_PORT || 4173);

async function resolveBaseUrl() {
  if (process.env.VERDACCIO_BASE_URL) {
    return process.env.VERDACCIO_BASE_URL.replace(/\/+$/, '');
  }
  let res = await fetch(`http://127.0.0.1:${PORT}/__health`);
  if (!res.ok) {
    throw new Error(`Static server health check failed: ${res.status}`);
  }
  let {sha} = await res.json();
  return `http://127.0.0.1:${PORT}/reactspectrum/${sha}/verdaccio`;
}

function attachHealthChecks(page, {ignorePageErrors = []} = {}) {
  let pageErrors = [];
  let consoleErrors = [];
  let failedRequests = [];

  page.on('pageerror', error => {
    let message = error.message || String(error);
    if (ignorePageErrors.some(pattern => pattern.test(message))) {
      return;
    }
    pageErrors.push(message);
  });

  page.on('console', msg => {
    let text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    } else if (
      msg.type() === 'warning' &&
      /hydration failed|did not match|error while hydrating/i.test(text)
    ) {
      consoleErrors.push(`Hydration warning: ${text}`);
    }
  });

  page.on('requestfailed', req => {
    let url = req.url();
    if (url.endsWith('/favicon.ico')) {
      return;
    }
    let failure = req.failure()?.errorText || 'unknown error';
    // Ignore aborted requests caused by navigation/teardown.
    if (failure === 'net::ERR_ABORTED') {
      return;
    }
    failedRequests.push(`${url} (${failure})`);
  });

  page.on('response', res => {
    let url = res.url();
    if (url.endsWith('/favicon.ico')) {
      return;
    }
    if (res.status() >= 400) {
      failedRequests.push(`${res.status()} ${url}`);
    }
  });

  return {
    assertClean() {
      expect(pageErrors, 'Uncaught page errors').toEqual([]);
      expect(consoleErrors, 'Console/hydration errors').toEqual([]);
      expect(failedRequests, 'Failed network requests').toEqual([]);
    }
  };
}

async function waitForAssets(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    let images = Array.from(document.querySelectorAll('img')).filter(img => {
      let rect = img.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    await Promise.all(
      images.map(img => {
        if (img.complete) {
          return img.decode?.().catch(() => {});
        }
        return new Promise(resolve => {
          img.addEventListener('load', resolve, {once: true});
          img.addEventListener('error', resolve, {once: true});
          setTimeout(resolve, 10_000);
        });
      })
    );
  });
}

const S2_APPS = [
  {name: 'S2 Parcel', dir: 's2-parcel-example', heading: 'Spectrum 2 + Parcel'},
  {name: 'S2 Vite', dir: 's2-vite-project', heading: 'Spectrum 2 + Vite'},
  {name: 'S2 Webpack', dir: 's2-webpack-5-example', heading: 'Spectrum 2 + Webpack'},
  {name: 'S2 Next.js', dir: 's2-next-macros', heading: 'Spectrum 2 + Next.js'}
];

for (let app of S2_APPS) {
  test(`${app.name} smoke test`, async ({page}, testInfo) => {
    let baseUrl = await resolveBaseUrl();
    let health = attachHealthChecks(page);

    await page.clock.install({time: FIXED_TIME});
    await page.goto(`${baseUrl}/${app.dir}/index.html`, {waitUntil: 'networkidle'});

    await expect(page.getByRole('heading', {name: app.heading, level: 1})).toBeVisible();

    // Load lazy-split components before taking the full-page Chromatic snapshot.
    let loadMore = page.getByRole('button', {name: 'Load more'});
    await expect(loadMore).toBeVisible();
    await loadMore.click();

    await expect(page.getByRole('heading', {name: 'Date and time'})).toBeVisible();
    await expect(page.getByRole('heading', {name: 'Content'})).toBeVisible();
    await expect(page.getByRole('grid', {name: 'Nature photos'})).toBeVisible();

    await page.waitForLoadState('networkidle');
    await waitForAssets(page);
    await page.evaluate(() => window.scrollTo(0, 0));

    await takeSnapshot(page, app.name, testInfo);

    // Computed styles sanity check (catches broken style macros or missing CSS).
    let primaryButton = page.getByRole('button', {name: 'Primary'});
    let styles = await primaryButton.evaluate(el => {
      let cs = getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderRadius: cs.borderRadius
      };
    });
    expect(styles.bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(styles.borderRadius).not.toBe('0px');

    // Verify rendered SVG icons have non-zero dimensions.
    let iconSize = await page.locator('svg').first().boundingBox();
    expect(iconSize?.width).toBeGreaterThan(0);
    expect(iconSize?.height).toBeGreaterThan(0);

    // Picker interaction.
    let layoutPicker = page.getByRole('button', {name: /CardView Layout/});
    await layoutPicker.click();
    let waterfallOption = page.getByRole('option', {name: 'Waterfall'});
    await expect(waterfallOption).toBeVisible();
    await waterfallOption.click();
    await expect(layoutPicker).toContainText('Waterfall');

    // MenuTrigger interaction.
    let menuButton = page.getByRole('button', {name: 'Menu', exact: true});
    await menuButton.click();
    await expect(page.getByRole('menuitem', {name: 'Cut'})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menuitem', {name: 'Cut'})).toBeHidden();

    // DialogTrigger interaction (from lazy-loaded chunk).
    await page.getByRole('button', {name: 'Check connectivity'}).click();
    let dialog = page.getByRole('dialog').filter({hasText: 'Internet Speed Test'});
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', {name: 'Cancel'}).click();
    await expect(dialog).toBeHidden();

    // TreeView interaction (scroll into view so virtualized rows mount).
    let tree = page.getByRole('treegrid', {name: 'Reorderable tree'});
    await tree.scrollIntoViewIfNeeded();
    await expect(tree).toBeVisible();
    await tree
      .getByRole('button', {name: /Expand/})
      .first()
      .click();
    await expect(tree.getByText('Projects-1', {exact: true})).toBeVisible();

    health.assertClean();
  });
}

test('S1 Next.js smoke test', async ({page}, testInfo) => {
  let baseUrl = await resolveBaseUrl();
  let health = attachHealthChecks(page, {
    // Allowlist pre-existing React #418 hydration mismatch in S1 TimeField
    // (Node ICU emits U+202F before AM/PM while Chromium hydrates with U+0020).
    ignorePageErrors: [/Minified React error #418/]
  });

  await page.goto(`${baseUrl}/next/index.html`, {waitUntil: 'networkidle'});

  await expect(
    page.getByRole('heading', {name: /React Spectrum \+ Next\.js/, level: 1})
  ).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Date and Time'})).toBeVisible();

  await waitForAssets(page);
  await page.evaluate(() => window.scrollTo(0, 0));

  await takeSnapshot(page, 'S1 Next.js', testInfo);

  // Computed styles sanity check (S1 primary button is outlined with pill border-radius).
  let primaryButton = page.getByRole('button', {name: 'Primary'}).first();
  let styles = await primaryButton.evaluate(el => {
    let cs = getComputedStyle(el);
    return {
      borderRadius: cs.borderRadius,
      borderTopWidth: cs.borderTopWidth
    };
  });
  expect(styles.borderRadius).not.toBe('0px');
  expect(styles.borderTopWidth).not.toBe('0px');

  // Verify rendered SVG icons have non-zero dimensions.
  let iconSize = await page.locator('svg').first().boundingBox();
  expect(iconSize?.width).toBeGreaterThan(0);
  expect(iconSize?.height).toBeGreaterThan(0);

  // Interactive check: toggle Switch.
  let powerSwitch = page.getByRole('switch', {name: 'Low power mode'});
  await expect(powerSwitch).not.toBeChecked();
  await powerSwitch.click();
  await expect(powerSwitch).toBeChecked();

  health.assertClean();
});
