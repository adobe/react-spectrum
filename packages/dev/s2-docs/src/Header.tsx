'use client';

import {ActionButton, Badge, Text} from '@react-spectrum/s2';
// @ts-ignore
import BetaApp from '@react-spectrum/s2/icons/BetaApp';
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

  const ChevronDownIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} {...props}>
      <path
        fill="var(--iconPrimary, #222)"
        d="M3.755 7.243a.748.748 0 0 1 1.06-.02l5.183 4.986 5.197-4.999a.749.749 0 1 1 1.04 1.08l-5.717 5.5a.747.747 0 0 1-1.04 0L3.776 8.303a.746.746 0 0 1-.02-1.06Z" />
    </svg>
  );

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
              onPress={openSearchMenu}
              onKeyDown={handleActionButtonKeyDown}
              // @ts-ignore
              onHoverStart={() => preloadSearchMenu()}
              UNSAFE_style={{paddingInlineStart: 10}}>
              <div className={style({display: 'flex', alignItems: 'center'})}>
                <div className={style({marginTop: 4})} style={{viewTransitionName: !searchOpen ? 'search-menu-icon' : 'none'} as CSSProperties}>
                  {getButtonIcon(currentPage)}
                </div>
                <span className={style({font: 'ui-2xl', marginStart: 8})} style={{viewTransitionName: !searchOpen ? 'search-menu-label' : 'none'} as CSSProperties}>
                  {getButtonText(currentPage)}
                </span>
              </div>
              <ChevronDownIcon className={style({width: 18})} />
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
            <Badge variant="indigo" size="M" styles={style({marginEnd: 8})}>
              <BetaApp />
              <Text>Beta Preview</Text>
            </Badge>
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
