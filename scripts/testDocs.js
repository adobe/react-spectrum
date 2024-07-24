const {chromium} = require('playwright');
const {exec} = require('child_process');
const http = require('http');

function startServer() {
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

function removeHashFromUrl(url) {
  const urlObj = new URL(url);
  urlObj.hash = '';
  return urlObj.toString();
}

function getRelativePath(baseUrl, fullUrl) {
  return fullUrl.replace(baseUrl, '').replace(/^\//, '') || '/';
}

async function testDocs() {
  let server;
  let browser;
  let messages = [];

  try {
    server = await startServer();
    await waitForServer(server.baseUrl);

    browser = await chromium.launch();
    const context = await browser.newContext();

    context.on('console', (msg) => {
      const msgUrl = msg.location().url;
      if (msgUrl.startsWith(server.baseUrl)) {
        const relativePath = getRelativePath(server.baseUrl, msgUrl);
        if (msg.type() === 'error') {
          console.error(`Console error on ${relativePath}: ${msg.text()}`);
          messages.push({type: 'error', path: relativePath, text: msg.text()});
        } else if (msg.type() === 'warning') {
          console.warn(`Console warning on ${relativePath}: ${msg.text()}`);
          messages.push({type: 'warning', path: relativePath, text: msg.text()});
        }
      }
    });

    const visitedUrls = new Set();
    const urlsToVisit = [server.baseUrl];

    while (urlsToVisit.length > 0) {
      const currentUrl = urlsToVisit.pop();
      const currentUrlWithoutHash = removeHashFromUrl(currentUrl);
      
      if (visitedUrls.has(currentUrlWithoutHash)) {
        continue;
      }

      const relativePath = getRelativePath(server.baseUrl, currentUrl);
      console.log(`Testing page: ${relativePath}`);
      
      const page = await context.newPage();

      try {
        const response = await page.goto(currentUrl, {
          waitUntil: 'networkidle',
          timeout: 10000
        });

        if (!response.ok()) {
          console.error(
            `Failed to load ${relativePath}: ${response.status()} ${response.statusText()}`
          );
        } else {
          visitedUrls.add(currentUrlWithoutHash);

          const links = await page.evaluate(() => 
            Array.from(document.links).map((link) => link.href)
          );

          links.forEach((link) => {
            if (link.startsWith(server.baseUrl)) {
              const linkWithoutHash = removeHashFromUrl(link);
              if (!visitedUrls.has(linkWithoutHash)) {
                urlsToVisit.push(linkWithoutHash);
              }
            }
          });
        }
      } catch (error) {
        console.error(`Error on ${relativePath}:`, error.message);
      } finally {
        await page.close();
      }
    }

    console.log('All pages tested successfully');
    console.log(`Total pages visited: ${visitedUrls.size}`);
    console.log(`Total errors: ${messages.length}`);
    messages.forEach((msg) => {
      console.log(`${msg.type} on ${msg.path}: ${msg.text}`);
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
  }
}

testDocs();
