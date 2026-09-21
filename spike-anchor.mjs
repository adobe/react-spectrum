// Spike v5: scroll tracking + clip disambiguation for fixed+anchor hidden input
import {chromium} from 'playwright';

const browser = await chromium.launch({
  executablePath:
    '/Users/gonzoblasco/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
});
const page = await browser.newPage({viewport: {width: 800, height: 600}});

const html = `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; }
  #spacer { height: 300px; }
  #outer { anchor-name: --a; display: inline-block; margin-top: 10px; }
  #label { display: inline-block; position: relative; padding: 4px 8px; background: #eee; }
  #vh { position: absolute; width: 1px; height: 1px; clip: rect(0 0 0 0); clip-path: inset(50%); }
  #inputClipped { position: fixed; margin: 0; border: 0; }
  #inputNoClip { position: fixed; margin: 0; border: 0; }
  #vhNoClip { position: absolute; width: 1px; height: 1px; /* no clip */ }
</style>
</head>
<body>
  <div id="spacer"></div>
  <div id="outer">
    <label id="label">
      <span id="vh"><input id="inputClipped" type="checkbox" /></span>
      <span id="visible">Accept terms</span>
    </label>
    <label id="label2">
      <span id="vhNoClip"><input id="inputNoClip" type="checkbox" /></span>
      <span>Second</span>
    </label>
  </div>
</body>
</html>`;

await page.setContent(html);

// Apply component logic to both inputs
await page.evaluate(() => {
  const outer = document.getElementById('outer');
  const apply = input => {
    input.style.positionAnchor = '--a';
    input.style.top = 'anchor(top)';
    input.style.left = 'anchor(left)';
    input.style.width = 'anchor-size(width)';
    input.style.height = 'anchor-size(height)';
  };
  apply(document.getElementById('inputClipped'));
  apply(document.getElementById('inputNoClip'));
  document.getElementById('inputClipped').getBoundingClientRect();
});

const before = await page.evaluate(() => {
  const r1 = document.getElementById('inputClipped').getBoundingClientRect();
  const l1 = document.getElementById('label').getBoundingClientRect();
  return {inputY: r1.y, labelY: l1.y};
});

// Scroll down 100px
await page.evaluate(() => window.scrollTo(0, 100));
await page.waitForTimeout(100); // allow anchor re-layout on scroll

const after = await page.evaluate(() => {
  const input = document.getElementById('inputClipped');
  const r = input.getBoundingClientRect();
  const lr = document.getElementById('label').getBoundingClientRect();
  // does the input still cover the label after scroll?
  return {
    inputY: r.y,
    labelY: lr.y,
    tracksScroll: Math.abs(r.y - lr.y) < 2,
    // clip disambiguation: hit test at centers
    hitClipped: (() => {
      const r = input.getBoundingClientRect();
      const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return el?.id || el?.tagName;
    })(),
    hitNoClip: (() => {
      const r2 = document.getElementById('inputNoClip').getBoundingClientRect();
      const el = document.elementFromPoint(r2.x + r2.width / 2, r2.y + r2.height / 2);
      return el?.id || el?.tagName;
    })()
  };
});

console.log('BEFORE scroll:', JSON.stringify(before));
console.log('AFTER scroll:', JSON.stringify(after, null, 2));
await browser.close();
