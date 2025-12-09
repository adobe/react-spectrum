import {getCurrentPage, getPages} from './getPages';
import type {Page} from '@parcel/rsc';
import {ReactNode} from 'react';
import {Router} from './Router';
import SearchMenuWrapper from './SearchMenuWrapper';

export default async function SearchMenuWrapperServer(props: {currentPage: Page, children: ReactNode}) {
  let pages = await getPages();
  let currentPage = getCurrentPage(props.currentPage);
  return (
    <Router pages={pages} currentPage={currentPage}>
      <SearchMenuWrapper>{props.children}</SearchMenuWrapper>
    </Router>
  );
}
