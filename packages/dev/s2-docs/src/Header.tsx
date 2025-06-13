'use client';

import {ActionButton} from '@react-spectrum/s2';
import {AdobeLogo} from './icons/AdobeLogo';
import ChevronDown from '@react-spectrum/s2/icons/ChevronDown';
import {flushSync} from 'react-dom';
import {GithubLogo} from './icons/GithubLogo';
import {InternationalizedLogo} from './icons/InternationalizedLogo';
import {PageProps} from '@parcel/rsc';
import React, {CSSProperties, useState} from 'react';
import {ReactAriaLogo} from './icons/ReactAriaLogo';
import SearchMenu from './SearchMenu';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };

function getButtonText(currentPage) {
  if (currentPage.url.includes('react-aria')) {
    return 'React Aria';
  } else if (currentPage.url.includes('react-internationalized')) {
    return 'React Internationalized';
  }
  return 'React Spectrum';
}

function getButtonIcon(currentPage) {
  if (currentPage.url.includes('react-aria')) {
    return <ReactAriaLogo  />;
  } else if (currentPage.url.includes('react-internationalized')) {
    return <InternationalizedLogo />;
  }
  return <AdobeLogo />;
}

export default function Header(props: PageProps) {
  const {pages, currentPage} = props;
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  let toggleShowSearchMenu = () => {
    if (!document.startViewTransition) {
      setSearchOpen((prev) => !prev);
      setIsSubmenuOpen(false);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        setSearchOpen((prev) => !prev);
        setIsSubmenuOpen(false);
      });
    });
  };

  let closeSearchMenu = () => {
    if (!document.startViewTransition) {
      setSearchOpen(false);
      setIsSubmenuOpen(false);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        setSearchOpen(false);
        setIsSubmenuOpen(false);
      });
    });
  };

  return (
    <>
      <header className={style({width: 'full', display: 'flex', justifyContent: 'center'})}>
        <div
          className={style({
            width: 'full', 
            // Matches search menu
            maxWidth: 1240, 
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            paddingX: 16
          })}>
          <div className={style({justifySelf: 'start'})}>
            <ActionButton aria-label="Open menu and search" size="XL" isQuiet onPress={toggleShowSearchMenu} UNSAFE_style={{paddingInlineStart: 10}}>
              <div className={style({display: 'flex', alignItems: 'center'})}>
                <div className={style({marginTop: 4})} style={{viewTransitionName: !searchOpen ? 'search-menu-icon' : 'none'} as CSSProperties}>
                  {getButtonIcon(currentPage)}
                </div>
                <span className={style({fontSize: 'heading-xs', marginStart: 8})} style={{viewTransitionName: !searchOpen ? 'search-menu-label' : 'none'} as CSSProperties}>
                  {getButtonText(currentPage)}
                </span>
              </div>
              <ChevronDown UNSAFE_className={'react-spectrum-select-chevron' + style({paddingEnd: 8})} UNSAFE_style={{width: 18}} />
            </ActionButton>
          </div>
          <SearchMenu pages={pages} currentPage={currentPage} toggleShowSearchMenu={toggleShowSearchMenu} closeSearchMenu={closeSearchMenu} setIsSubmenuOpen={setIsSubmenuOpen} isSearchOpen={searchOpen} isSubmenuOpen={isSubmenuOpen} />
          <div className={style({display: 'flex', alignItems: 'center', gap: 4, justifySelf: 'end'})}>
            <ActionButton aria-label="React Spectrum GitHub repo" size="XL" isQuiet>
              <GithubLogo />
            </ActionButton>
          </div>
        </div>
      </header>
    </>
  );
}
