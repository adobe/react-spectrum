const {chromium, firefox, webkit} = require('playwright');
const {exec} = require('child_process');
const http = require('http');
const path = require('path');
const glob = require('glob-promise');

function parseArgs() {
  const args = process.argv.slice(2);
  const browser = args[0] || 'chromium';
  if (!['chromium', 'firefox', 'webkit'].includes(browser)) {
    console.error('Invalid browser specified. Must be "chromium", "firefox", or "webkit". Using "chromium" as default.');
    return 'chromium';
  }
  return browser;
}

async function startServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting documentation server...');
    const child = exec('yarn start:docs', {
      env: {...process.env, DOCS_ENV: 'dev'}
    });
    child.stdout.on('data', (data) => {
      console.log(`Server output: ${data}`);
      if (data.includes('Server running at')) {
        console.log('Documentation server is running');
        resolve({process: child, baseUrl: data.split(' ')[3].trim()});
      }
    });
    child.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });
  });
}

function waitForServer(url, timeout = 30000, interval = 1000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkServer = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          retryOrFail();
        }
      }).on('error', retryOrFail);
    };

    const retryOrFail = () => {
      if (Date.now() - startTime < timeout) {
        setTimeout(checkServer, interval);
      } else {
        reject(new Error('Server did not start in time'));
      }
    };

    checkServer();
  });
}

async function getPageLinks() {
  const packagePaths = [
    'packages/@react-{spectrum,aria,stately}/*/docs/*.mdx',
    'packages/react-aria-components/docs/**/*.mdx',
    'packages/@internationalized/*/docs/*.mdx'
  ];

  const rootPages = 'packages/dev/docs/pages/**/*.mdx';

  let links = [];

  for (const pattern of packagePaths) {
    const files = await glob(pattern);
    for (const file of files) {
      const parts = file.split(path.sep);
      const packageName = parts[1].replace('@', '');
      const componentName = path.basename(file, '.mdx');
      links.push(`/${packageName}/${componentName}.html`);
    }
  }

  const rootFiles = await glob(rootPages);
  for (const file of rootFiles) {
    const relativePath = path.relative('packages/dev/docs/pages', file);
    const urlPath = path.join('/', path.dirname(relativePath), path.basename(relativePath, '.mdx'));
    links.push(`${urlPath}.html`);
  }

  return links;
}

async function testDocs() {
  let server;
  let browser;
  let messages = [];
  let currentPage = '';

  const browserType = parseArgs();
  console.log(`Using ${browserType} browser for testing`);

  try {
    server = await startServer();
    await waitForServer(server.baseUrl);

    const pageLinks = await getPageLinks().then((links) => links.map((link) => `${server.baseUrl}${link}`));
    console.log(`Found ${pageLinks.length} pages to test`);

    switch (browserType) {
      case 'firefox':
        browser = await firefox.launch();
        break;
      case 'webkit':
        browser = await webkit.launch();
        break;
      default:
        browser = await chromium.launch();
    }

    const context = await browser.newContext();

    context.on('console', (msg) => {
      const msgUrl = msg.location().url;
      if (msgUrl.startsWith(server.baseUrl) && (msg.type() === 'error' || msg.type() === 'warning')) {
        console.log(`${msg.type().toUpperCase()} on ${currentPage}: ${msg.text()}`);
        messages.push({type: msg.type(), path: currentPage, text: msg.text()});
      }
    });

    for (let i = 0; i < pageLinks.length; i++) {
      const url = pageLinks[i];
      currentPage = new URL(url).pathname;
      console.log(`Testing page (${i + 1}/${pageLinks.length}): ${currentPage}`);

      const page = await context.newPage();

      try {
        const response = await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        if (!response.ok()) {
          console.error(
            `Failed to load ${currentPage}: ${response.status()} ${response.statusText()}`
          );
        }

        await page.waitForTimeout(1000);
      } catch (error) {
        console.error(`Error on ${currentPage}:`, error.message);
      } finally {
        await page.close();
      }
    }

    console.log('All pages tested successfully');
    console.log(`Total pages visited: ${pageLinks.length}`);
    console.log(`Total errors: ${messages.filter((msg) => msg.type === 'error').length}`);
    console.log(`Total warnings: ${messages.filter((msg) => msg.type === 'warning').length}`);
    messages.forEach((msg) => {
      console.log(`${msg.type.toUpperCase()} on ${msg.path}: ${msg.text}`);
    });
  } catch (error) {
    console.error('An error occurred during testing:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server && server.process) {
      server.process.kill();
    }
    process.exit(0);
  }
}

testDocs();
