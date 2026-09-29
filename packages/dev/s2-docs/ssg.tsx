import {availableParallelism} from 'node:os';
import {ComponentType, ReactNode} from 'react' with {env: 'react-client'};
import {createFromReadableStream} from 'react-server-dom-parcel/client.edge' with {
  env: 'react-client'
};
import {createWriteStream, mkdirSync} from 'fs';
import {dirname} from 'path';
import {finished} from 'node:stream/promises';
import {injectRSCPayload} from 'rsc-html-stream/server';
import {isMainThread, Worker, workerData} from 'node:worker_threads';
import {prerender} from 'react-dom/static.edge' with {env: 'react-client'};
import {Readable} from 'stream';
import {renderToReadableStream} from 'react-server-dom-parcel/server.edge';

let base = './pages/';
let baseDir = base;
if (process.env.LIBRARY) {
  base += process.env.LIBRARY + '/';
}

export async function render(routes) {
  let pages = Object.keys(routes);
  if (isMainThread) {
    let workerCount = Math.min(availableParallelism(), pages.length);
    if (workerCount > 1) {
      let routesPerWorker = Math.floor(pages.length / workerCount);
      let remainder = pages.length % workerCount;
      let offset = 0;
      let workers: Promise<void>[] = [];

      for (let i = 0; i < workerCount; i++) {
        let routeCount = routesPerWorker + (i < remainder ? 1 : 0);
        let workerRoutes = pages.slice(offset, offset + routeCount);
        offset += routeCount;

        workers.push(
          new Promise((resolve, reject) => {
            let worker = new Worker(process.argv[1], {workerData: workerRoutes});
            worker.once('error', reject);
            worker.once('exit', code => {
              if (code === 0) {
                resolve();
              } else {
                reject(new Error(`Rendering worker exited with code ${code}`));
              }
            });
          })
        );
      }

      await Promise.all(workers);
      return;
    }
  } else {
    pages = workerData;
  }

  for (let page of pages) {
    console.log('rendering ' + page);
    try {
      let mod = await routes[page]();
      let Page = mod.default;
      let url = page.slice(base.length, -4);
      let {html, rsc} = await prerenderHTML(
        <Page
          currentPage={{
            url: '/' + url,
            name: url + '.html',
            tableOfContents: mod.tableOfContents
          }}
        />,
        {component: Page}
      );

      let distPath = page.slice(baseDir.length, -4);
      mkdirSync('dist/' + dirname(distPath), {recursive: true});

      let htmlStream = createWriteStream('dist/' + distPath + '.html');
      html.pipe(htmlStream);

      let rscStream = createWriteStream('dist/' + distPath + '.rsc');
      rsc.pipe(rscStream);

      await Promise.all([finished(htmlStream), finished(rscStream)]);
    } catch (err) {
      console.error(err);
    }
  }
}

interface RSCToHTMLOptions {
  component?: ComponentType;
  identifierPrefix?: string;
  namespaceURI?: string;
  nonce?: string;
  progressiveChunkSize?: number;
  signal?: AbortSignal;
  temporaryReferences?: any;
  onError?: (error: unknown, errorInfo?: any) => string | void;
}

async function prerenderHTML(
  root: any,
  options?: RSCToHTMLOptions
): Promise<{html: Readable; rsc: Readable}> {
  let stream = renderToReadableStream(root, options);

  // Use client react to render the RSC payload to HTML.
  let [s1, renderStream] = stream.tee();
  let [injectStream, rscStream] = s1.tee();
  let data: Promise<ReactNode>;
  function Content() {
    data ??= createFromReadableStream<ReactNode>(renderStream);
    return data;
  }

  let {prelude} = await prerender(<Content />, {
    ...options,
    bootstrapScriptContent: (options?.component as any)?.bootstrapScript
  });

  return {
    html: Readable.fromWeb(prelude.pipeThrough(injectRSCPayload(injectStream)) as any),
    rsc: Readable.fromWeb(rscStream)
  };
}
