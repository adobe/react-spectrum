import {getCurrentPage, getPages} from './getPages';
import type {Page} from '@parcel/rsc';
import SearchMenuWrapper from './SearchMenuWrapper';

export default async function SearchMenuWrapperServer(props: {currentPage: Page}) {
  let pages = await getPages();
  let currentPage = getCurrentPage(props.currentPage);
  return <SearchMenuWrapper pages={pages} currentPage={currentPage} />;
}
