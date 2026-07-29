import { renderHTML } from "@parcel/rsc/node";
import { createWriteStream } from 'fs';
import { finished } from 'node:stream/promises';
// @ts-ignore
import routes from './pages/**/*.mdx?async=true&flat=true';

async function render() {
  for (let page in routes) {
    console.log('rendering ' + page);
    try {
      let mod = await routes[page]();
      let Page = mod.default;
      let htmlStream = await renderHTML(
        <Page
          currentPage={{
            url: '/' + page,
            name: page + '.html',
            tableOfContents: mod.tableOfContents
          }} />,
        {component: Page}
      );

      // TODO: render .rsc file

      let fileStream = createWriteStream('dist/' + page + '.html');
      htmlStream.pipe(fileStream);
      await finished(fileStream);
    } catch (err) {
      console.error(err);
    }
  }
}

render();
