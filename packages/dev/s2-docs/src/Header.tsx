'use client';

import {ActionButton} from '@react-spectrum/s2';
// @ts-ignore
import {flushSync} from 'react-dom';
import {getLibraryFromPage, getLibraryIcon, getLibraryLabel} from './library';
import GithubLogo from './icons/GithubLogo';
import {MarkdownMenu} from './MarkdownMenu';
// @ts-ignore
import {PageProps} from '@parcel/rsc';
import React, {CSSProperties, useId, useState} from 'react';
import SearchMenuTrigger, {preloadSearchMenu} from './SearchMenuTrigger';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };

function getButtonText(currentPage) {
  return getLibraryLabel(getLibraryFromPage(currentPage));
}

function getButtonIcon(currentPage) {
  return getLibraryIcon(getLibraryFromPage(currentPage));
}

export default function Header(props: PageProps) {
  const {pages, currentPage} = props;
  const [searchOpen, setSearchOpen] = useState(false);
  const searchMenuId = useId();

  let openSearchMenu = async () => {
    if (!document.startViewTransition) {
      setSearchOpen((prev) => !prev);
      return;
    }

    // Preload SearchMenu so it is ready to render immediately.
    await preloadSearchMenu();
    document.startViewTransition(() => {
      flushSync(() => {
        setSearchOpen((prev) => !prev);
      });
    });
  };

  let closeSearchMenu = () => {
    if (!document.startViewTransition) {
      setSearchOpen(false);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        setSearchOpen(false);
      });
    });
  };

  let handleActionButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' && !searchOpen) {
      e.preventDefault();
      openSearchMenu();
    }
  };

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
            <ActionButton
              aria-label="Open menu and search"
              aria-expanded={searchOpen}
              aria-controls={searchOpen ? searchMenuId : undefined}
              size="XL"
              isQuiet
              onPress={() => {
                let library = getLibraryFromPage(currentPage);
                let subdirectory = 's2';
                if (library === 'internationalized' || library === 'react-aria') {
                  // the internationalized library has no homepage so i've chosen to route it to the react aria homepage
                  subdirectory = 'react-aria';

                }
                const url = new URL(`/${subdirectory}/index.html`, window.location.origin);
                window.location.assign(url.href);
              }}
              onKeyDown={handleActionButtonKeyDown}
              // @ts-ignore
              // onHoverStart={() => preloadSearchMenu()}
              UNSAFE_style={{paddingInlineStart: 10}}>
              <div className={style({display: 'flex', alignItems: 'center'})}>
                <div className={style({marginTop: 4})} style={{viewTransitionName: !searchOpen ? 'search-menu-icon' : 'none'} as CSSProperties}>
                  {getButtonIcon(currentPage)}
                </div>
                <span className={style({font: 'ui-2xl', marginStart: 8})} style={{viewTransitionName: !searchOpen ? 'search-menu-label' : 'none'} as CSSProperties}>
                  {getButtonText(currentPage)}
                </span>
              </div>
            </ActionButton>
          </div>
          <SearchMenuTrigger
            pages={pages}
            currentPage={currentPage}
            onOpen={openSearchMenu}
            onClose={closeSearchMenu}
            isSearchOpen={searchOpen}
            overlayId={searchMenuId} />
          <div className={style({display: 'flex', alignItems: 'center', gap: 4, justifySelf: 'end'})}>
            <ActionButton 
              isQuiet 
              onPress={() => {
                let library = getLibraryFromPage(currentPage);
                let subdirectory = 's2';
                if (library !== 'react-spectrum') {
                  subdirectory = library;
                }
                let url = new URL(`/${subdirectory}/getting-started.html`, window.location.origin);
                // TODO: once react spectrum and react-aria are on separate domains, we should be able to use this relative path instead
                // const url = new URL('/getting-started.html', window.location.origin);
                window.location.assign(url.pathname);
              }}>Docs</ActionButton>
            <ActionButton 
              isQuiet 
              onPress={() => {
                let library = getLibraryFromPage(currentPage);
                let subdirectory = 's2';
                if (library !== 'react-spectrum') {
                  subdirectory = library;
                }
                let url = new URL(`/${subdirectory}/releases/index.html`, window.location.origin);
                // TODO: once react spectrum and react-aria are on separate domains, we should be able to use this relative path instead
                // const releasesUrl = new URL('/releases/index.html', window.location.origin);
                window.location.assign(url.pathname);
              }}>Releases</ActionButton>
            <ActionButton 
              isQuiet 
              onPress={() => {
                let url = new URL('/react-aria/blog/index.html', window.location.origin);
                // TODO: once react spectrum and react-aria are on separate domains, we should be able to use this relative path instead
                window.location.assign(url.pathname);
              }}>Blog</ActionButton>
            <MarkdownMenu url={currentPage.url} />
            <ActionButton aria-label="React Spectrum GitHub repo" size="L" isQuiet onPress={() => window.open('https://github.com/adobe/react-spectrum', '_blank', 'noopener,noreferrer')}>
              <GithubLogo />
            </ActionButton>
          </div>
        </div>
      </header>
    </>
  );
}
