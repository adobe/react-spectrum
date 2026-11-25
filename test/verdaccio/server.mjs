import fs from 'fs';
import http from 'http';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const distDir = path.resolve(repoRoot, process.env.VERDACCIO_DIST_DIR || 'verdaccio_dist');
const port = Number(process.env.VERDACCIO_SERVER_PORT || 4173);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function findSha(root) {
  if (
    process.env.CIRCLE_SHA1 &&
    fs.existsSync(path.join(root, process.env.CIRCLE_SHA1, 'verdaccio'))
  ) {
    return process.env.CIRCLE_SHA1;
  }
  if (!fs.existsSync(root)) {
    return null;
  }
  for (let entry of fs.readdirSync(root, {withFileTypes: true})) {
    if (entry.isDirectory() && fs.existsSync(path.join(root, entry.name, 'verdaccio'))) {
      return entry.name;
    }
  }
  return null;
}

const sha = findSha(distDir);
if (!sha) {
  console.error(`Could not find a "<sha>/verdaccio" directory under ${distDir}`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let reqUrl = new URL(req.url || '/', `http://127.0.0.1:${port}`);

  if (reqUrl.pathname === '/__health') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ok: true, sha}));
    return;
  }

  let pathname = decodeURIComponent(reqUrl.pathname);
  // Mount distDir under /reactspectrum so Next.js apps built with
  // basePath=/reactspectrum/<sha>/verdaccio/<app> resolve assets cleanly.
  if (pathname.startsWith('/reactspectrum/')) {
    pathname = pathname.slice('/reactspectrum'.length);
  }

  let filePath = path.resolve(distDir, '.' + pathname);
  if (filePath !== distDir && !filePath.startsWith(distDir + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  let ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {'Content-Type': MIME_TYPES[ext] || 'application/octet-stream'});
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(
    `Serving ${distDir} (sha=${sha}) at http://127.0.0.1:${port}/reactspectrum/${sha}/verdaccio/`
  );
});
