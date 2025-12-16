import {getCurrentPage, getPages} from './getPages';
import type {Page} from '@parcel/rsc';
import {ReactNode} from 'react';
import {Router} from './Router';
import SearchMenuWrapper from './SearchMenuWrapper';

export default async function SearchMenuWrapperServer(props: {currentPage: Page, children: ReactNode}) {
  return (
    <RouterWrapperServer currentPage={props.currentPage}>
      <SearchMenuWrapper>{props.children}</SearchMenuWrapper>
    </RouterWrapperServer>
  );
}

export async function RouterWrapperServer(props) {
  let pages = await getPages();
  let currentPage = getCurrentPage(props.currentPage);
  return (
    <Router pages={pages} currentPage={currentPage}>
      {props.children}
    </Router>
  );
}
