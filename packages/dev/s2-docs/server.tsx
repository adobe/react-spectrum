import {createReadStream, promises} from 'fs';
import {createServer} from 'http';
import path from 'path';
import {renderRequest} from '@parcel/rsc/node';
// @ts-ignore
import routes from './pages/**/*.mdx?async=true&flat=true';

const MIME_TYPES = {
  default: 'application/octet-stream',
  html: 'text/html; charset=UTF-8',
  js: 'text/javascript',
  css: 'text/css',
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  svg: 'image/svg+xml'
};

createServer(async (req, res) => {
  let url = req.url!;
  if (url.endsWith('/')) {
    url += 'index';
  }

  let page = routes['./pages' + url + '.mdx'];
  if (page) {
    let mod = await page();
    let {default: Page, ...exports} = mod;
    renderRequest(
      req,
      res,
      <Page
        currentPage={{
          url,
          name: url.slice(1) + '.html',
          tableOfContents: mod.tableOfContents,
          exports
        }}
      />,
      {component: Page}
    );
  } else {
    let u = new URL(url, 'http://localhost');
    let p = path.join(__dirname, '../../../dist', u.pathname.slice(1));
    let exists = await promises.access(p).then(
      () => true,
      () => false
    );
    if (exists) {
      let mimeType = MIME_TYPES[path.extname(p).slice(1)] || MIME_TYPES.default;
      res.writeHead(200, {'Content-Type': mimeType});
      createReadStream(p).pipe(res);
    } else {
      res.statusCode = 404;
      res.end();
    }
  }
}).listen(1234);
console.log('Server listening on port 1234');
