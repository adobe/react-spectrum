'use client';

import {baseColor, focusRing, space, style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {getBaseUrl} from './pageUtils';
import {getLibraryFromPage, getLibraryIcon, getLibraryLabel} from './library';
import GithubLogo from './icons/GithubLogo';
import {HeaderLink} from './Link';
// @ts-ignore
import {Link} from 'react-aria-components';
import {NpmLogo} from './icons/NpmLogo';
import {pressScale} from '@react-spectrum/s2';
import React, {useId, useRef, useState} from 'react';
import SearchMenuTrigger, {preloadSearchMenu} from './SearchMenuTrigger';
import {useLayoutEffect} from '@react-aria/utils';
import {useRouter} from './Router';

function getButtonText(currentPage) {
  return getLibraryLabel(getLibraryFromPage(currentPage));
}

function getButtonIcon(currentPage) {
  return getLibraryIcon(getLibraryFromPage(currentPage));
}

const libraryStyles = style({
  ...focusRing(),
  paddingX: 12, 
  display: 'flex',
  alignItems: 'center',
  columnGap: {
    default: 12,
    lg: space(10)
  },
  textDecoration: 'none',
  minHeight: 48,
  borderRadius: 'lg',
  transition: 'default',
  backgroundColor: {
    default: {
      ...baseColor('gray-100'),
      default: 'transparent'
    }
  },
  marginStart: space(26)
});

export default function Header() {
  const {currentPage} = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchMenuId = useId();
  let ref = useRef(null);
  let iconRef = useRef<HTMLDivElement | null>(null);
  let labelRef = useRef<HTMLDivElement | null>(null);
  let searchRef = useRef<HTMLDivElement | null>(null);
  let renderCallback = useRef<(() => void) | null>(null);

  let openSearchMenu = async () => {
    if (!document.startViewTransition) {
      setSearchOpen((prev) => !prev);
      return;
    }

    // Preload SearchMenu so it is ready to render immediately.
    await preloadSearchMenu();

    // Don't transition the entire page.
    document.documentElement.style.viewTransitionName = 'none';
    iconRef.current!.style.viewTransitionName = 'search-menu-icon';
    labelRef.current!.style.viewTransitionName = 'search-menu-label';
    searchRef.current!.style.viewTransitionName = 'search-menu-search-field';
    let viewTransition = document.startViewTransition(() => {
      // Wait until next render. Using flushSync causes flickering.
      return new Promise<void>(resolve => {
        iconRef.current!.style.viewTransitionName = '';
        labelRef.current!.style.viewTransitionName = '';
        searchRef.current!.style.viewTransitionName = '';
        renderCallback.current = resolve;
        setSearchOpen((prev) => !prev);
      });
    });

    viewTransition.finished.then(() => {
      document.documentElement.style.viewTransitionName = '';
    });
  };

  let closeSearchMenu = () => {
    if (!document.startViewTransition) {
      setSearchOpen(false);
      return;
    }

    document.documentElement.style.viewTransitionName = 'none';
    let viewTransition = document.startViewTransition(() => {
      return new Promise<void>(resolve => {
        renderCallback.current = resolve;
        setSearchOpen(false);
        iconRef.current!.style.viewTransitionName = 'search-menu-icon';
        labelRef.current!.style.viewTransitionName = 'search-menu-label';
        searchRef.current!.style.viewTransitionName = 'search-menu-search-field';
      });
    });

    viewTransition.finished.then(() => {
      document.documentElement.style.viewTransitionName = '';
      iconRef.current!.style.viewTransitionName = '';
      labelRef.current!.style.viewTransitionName = '';
      searchRef.current!.style.viewTransitionName = '';
    });
  };

  useLayoutEffect(() => {
    renderCallback.current?.();
    renderCallback.current = null;
  });

  let library = getLibraryFromPage(currentPage);
  let subdirectory: 's2' | 'react-aria' = 's2';
  if (library === 'react-aria') {
    // the internationalized library has no homepage so i've chosen to route it to the react aria homepage
    subdirectory = 'react-aria';
  }

  let baseUrl = getBaseUrl(subdirectory);
  let homepage = `${baseUrl}/`;
  let docs = `${baseUrl}/getting-started`;
  let release = `${baseUrl}/releases/`;
  let blog = `${getBaseUrl('react-aria')}/blog/`;
  let npm = subdirectory === 's2' ? '@react-spectrum/s2' : 'react-aria-components';

  return (
    <>
      <header className={style({width: 'full', display: {default: 'none', lg: 'flex'}, justifyContent: 'center'})}>
        <div
          className={style({
            width: 'full', 
            display: 'grid',
            // @eslint-disable-next-line
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center'
          })}>
          <div className={style({justifySelf: 'start'})}>
            <Link
              href={homepage}
              ref={ref}
              style={pressScale(ref, {visibility: searchOpen ? 'hidden' : 'visible'})}
              className={renderProps => libraryStyles({...renderProps})}>
              <div ref={iconRef}>
                {getButtonIcon(currentPage)}
              </div>
              <span className={style({font: 'heading-sm', fontWeight: 'extra-bold'})} ref={labelRef}>
                {getButtonText(currentPage)}
              </span>
            </Link>
          </div>
          <div ref={searchRef}>
            <SearchMenuTrigger
              onOpen={openSearchMenu}
              onClose={closeSearchMenu}
              isSearchOpen={searchOpen}
              overlayId={searchMenuId} />
          </div>
          <div className={style({display: 'flex', alignItems: 'center', gap: 4, justifySelf: 'end'})}>
            <HeaderLink href={docs}>Docs</HeaderLink>
            <HeaderLink href={release}>Releases</HeaderLink>
            <HeaderLink href={blog} target={subdirectory === 's2' ? '_blank' : ''} rel="noopener noreferrer">Blog</HeaderLink>
            <HeaderLink aria-label="GitHub" href="https://github.com/adobe/react-spectrum" target="_blank" rel="noopener noreferrer" ><GithubLogo /></HeaderLink>
            <HeaderLink aria-label="npm" href={`https://npmjs.com/${npm}`} target="_blank" rel="noopener noreferrer"><NpmLogo /></HeaderLink>
          </div>
        </div>
      </header>
    </>
  );
}
