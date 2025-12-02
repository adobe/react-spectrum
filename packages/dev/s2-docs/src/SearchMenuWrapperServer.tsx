import {getCurrentPage, getPages} from './getPages';
import type {Page} from '@parcel/rsc';
import {Router} from './Router';
import SearchMenuWrapper from './SearchMenuWrapper';

export default async function SearchMenuWrapperServer(props: {currentPage: Page}) {
  let pages = await getPages();
  let currentPage = getCurrentPage(props.currentPage);
  return (
    <Router pages={pages} currentPage={currentPage}>
      <SearchMenuWrapper />
    </Router>
  );
}
