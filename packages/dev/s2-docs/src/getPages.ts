import {cache} from 'react';
import {getBaseUrl} from './pageUtils';
import {glob, readFile} from 'fs/promises';
import type {Page} from '@parcel/rsc';
// eslint-disable-next-line
import {transformAsync} from '@parcel/rust/lib/index.js';

export const getPages = cache(async () => {
  let pages: string[] = [];
  for await (let page of glob('pages/*/**/*.mdx')) {
    pages.push(page);
  }

  return Promise.all(pages.map(async page => {
    let code = await readFile(page);
    let res: any = await transformAsync({
      filename: page,
      code,
      module_id: '123',
      project_root: process.cwd(),
      inline_fs: false,
      env: {},
      type: 'mdx',
      context: 'react-server',
      automatic_jsx_runtime: true,
      decorators: false,
      use_define_for_class_fields: false,
      is_development: false,
      react_refresh: false,
      source_maps: false,
      scope_hoist: false,
      source_type: 'Module',
      supports_module_workers: true,
      is_library: false,
      is_esm_output: false,
      trace_bailouts: false,
      is_swc_helpers: false,
      standalone: false,
      inline_constants: false
    });

    let name = page.slice(6, -4);    
    return {
      name,
      url: getUrl(name),
      exports: res.mdx_exports,
      tableOfContents: res.mdx_toc
    } satisfies Page;
  }));
});

function getUrl(name: string) {
  if (name.endsWith('/index')) {
    name = name.slice(0, -5);
  }

  let library = name.slice(0, name.indexOf('/'));
  let baseUrl = getBaseUrl(library as any);
  if (library === 'react-aria') {
    return `${baseUrl}/${name.slice(11)}`;
  } else if (library === 's2') {
    return `${baseUrl}/${name.slice(3)}`;
  } else if (!process.env.LIBRARY) {
    return `http://localhost:1234/${name}`;
  } else {
    throw new Error('Unknown page: ' + name);
  }
}

export function getCurrentPage(page: Page): Page {
  // Remove .html
  let name = page.name.slice(0, -5);

  // Prepend current build's library
  let library = process.env.LIBRARY;
  if (library) {
    name = `${library}/${name}`;
  }

  return {
    name,
    url: getUrl(name),
    exports: page.exports,
    tableOfContents: page.tableOfContents
  };
}

// console.log(await getPages());
