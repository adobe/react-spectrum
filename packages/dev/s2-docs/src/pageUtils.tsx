import type {Page} from '@parcel/rsc';

export function getCanonicalUrl(page: Page) {
  if (page.url.endsWith('/index.html')) {
    return page.url.slice(0, -10);
  } else if (page.url.endsWith('.html')) {
    return page.url.slice(0, -5);
  } else {
    return page.url;
  }
}
