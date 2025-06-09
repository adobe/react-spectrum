'use client';

import {ActionButton} from '@react-spectrum/s2';
import ChevronDown from '@react-spectrum/s2/icons/ChevronDown';
import React, {useState} from 'react';
import SearchMenu from './SearchMenu';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {PageProps} from '@parcel/rsc';
import { AdobeLogo } from './icons/AdobeLogo';
import { GithubLogo } from './icons/GithubLogo';
import { InternationalizedLogo } from './icons/InternationalizedLogo';
import { ReactAriaLogo } from './icons/ReactAriaLogo';

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
  return <AdobeLogo size={24} className={style({marginStart: 8})} />;
}

export default function Header(props: PageProps) {
  const {pages, currentPage} = props;
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  let handleMenuButtonPress = () => {
    setSearchOpen((prev) => !prev);
    setIsSubmenuOpen(false);
  }

  return (
    <>
      <header className={style({width: 'full', display: 'flex', justifyContent: 'center'})}>
        <div className={style({
          width: 'full', 
          maxWidth: 1240, 
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center'
        })}>
          <div className={style({justifySelf: 'start'})}>
            <ActionButton aria-label="Open menu and search" size="XL" isQuiet onPress={handleMenuButtonPress}>
              {getButtonIcon(currentPage)}
              <span className={style({fontSize: 'heading-xs', marginStart: 4})}>{getButtonText(currentPage)}</span>
              <ChevronDown UNSAFE_className={'react-spectrum-select-chevron' + style({paddingEnd: 8})} UNSAFE_style={{width: 18}} />
            </ActionButton>
          </div>
          <SearchMenu pages={pages} currentPage={currentPage} setSearchOpen={setSearchOpen} setIsSubmenuOpen={setIsSubmenuOpen} isSearchOpen={searchOpen} isSubmenuOpen={isSubmenuOpen} />
          <div className={style({display: 'flex', alignItems: 'center', gap: 4, marginEnd: 32, justifySelf: 'end'})}>
            <ActionButton aria-label="React Spectrum GitHub repo" size="XL" isQuiet>
              <GithubLogo />
            </ActionButton>
          </div>
        </div>
      </header>
    </>
  );
}
