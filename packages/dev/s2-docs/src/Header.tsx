'use client';

import {Badge, pressScale, Text} from '@react-spectrum/s2';
import {baseColor, focusRing, space, style} from '@react-spectrum/s2/style' with { type: 'macro' };
// @ts-ignore
import BetaApp from '@react-spectrum/s2/icons/BetaApp';
import {flushSync} from 'react-dom';
import {getLibraryFromPage, getLibraryIcon, getLibraryLabel} from './library';
import GithubLogo from './icons/GithubLogo';
import {Link} from 'react-aria-components';
// @ts-ignore
import {PageProps} from '@parcel/rsc';
import React, {CSSProperties, useId, useRef, useState} from 'react';
import SearchMenuTrigger, {preloadSearchMenu} from './SearchMenuTrigger';

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
  marginStart: space(14)
});

const linkStyle = {
  ...focusRing(),
  font: 'ui',
  textDecoration: 'none',
  transition: 'default',
  backgroundColor: {
    default: {
      ...baseColor('gray-100'),
      default: 'transparent'
    }
  },
  height: 32,
  paddingX: 'edge-to-text',
  display: 'flex',
  alignItems: 'center',
  borderRadius: 'lg'
} as const;

const linkStyles = style({
  ...linkStyle
});

const iconStyles = style({
  ...linkStyle,
  paddingX: space(6)
});

export default function Header(props: PageProps) {
  const {pages, currentPage} = props;
  const [searchOpen, setSearchOpen] = useState(false);
  const searchMenuId = useId();
  let ref = useRef(null);
  let docsRef = useRef(null);
  let releasesRef = useRef(null);
  let blogRef = useRef(null);

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

  let library = getLibraryFromPage(currentPage);
  let subdirectory = 's2';
  if (library === 'internationalized' || library === 'react-aria') {
    // the internationalized library has no homepage so i've chosen to route it to the react aria homepage
    subdirectory = 'react-aria';
  }

  let homepage = '';
  let docs = '';
  let release = '';
  let blog = '';
  for (let page of pages) {
    if (page.name.includes(subdirectory) && page.name.includes('index.html') && !page.name.includes('releases') && !page.name.includes('blog') && !page.name.includes('examples')) {
      homepage = page.url;
    }
    if (page.name.includes(subdirectory) && page.name.includes('getting-started.html')) {
      docs = page.url;
    }
    if (page.name.includes(subdirectory) && page.name.includes('index.html') && page.name.includes('releases')) {
      release = page.url;
    }
    if (page.name.includes('react-aria') && page.name.includes('index.html') && page.name.includes('blog')) {
      blog = page.url;
    }
  }

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
              aria-label="Open menu and search"
              aria-expanded={searchOpen}
              aria-controls={searchOpen ? searchMenuId : undefined}
              href={homepage}
              onKeyDown={handleActionButtonKeyDown}
              ref={ref}
              style={pressScale(ref, {visibility: searchOpen ? 'hidden' : 'visible'})}
              className={renderProps => libraryStyles({...renderProps})}>
              <div className={style({display: 'flex', alignItems: 'center'})}>
                <div className={style({marginTop: 4})} style={{viewTransitionName: !searchOpen ? 'search-menu-icon' : 'none'} as CSSProperties}>
                  {getButtonIcon(currentPage)}
                </div>
                <span className={style({font: 'ui-2xl', marginStart: 8})} style={{viewTransitionName: !searchOpen ? 'search-menu-label' : 'none'} as CSSProperties}>
                  {getButtonText(currentPage)}
                </span>
              </div>
            </Link>
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
            <Link className={renderProps => linkStyles({...renderProps})} href={docs} ref={docsRef} style={pressScale(docsRef)} >Docs</Link>
            <Link className={renderProps => linkStyles({...renderProps})} href={release} ref={releasesRef} style={pressScale(releasesRef)} >Releases</Link>
            <Link className={renderProps => linkStyles({...renderProps})} href={blog} target={subdirectory === 's2' ? '_blank' : ''} rel="noopener noreferrer" ref={blogRef} style={pressScale(blogRef)} >Blog</Link>
            <Link aria-label="React Spectrum GitHub repo" className={renderProps => iconStyles({...renderProps})} href="https://github.com/adobe/react-spectrum" target="_blank" rel="noopener noreferrer" ><GithubLogo /></Link>
          </div>
        </div>
      </header>
    </>
  );
}
