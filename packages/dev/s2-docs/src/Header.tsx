'use client';

import {baseColor, focusRing, space, style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {getBaseUrl} from './pageUtils';
import {getLibraryFromPage, getLibraryIcon, getLibraryLabel} from './library';
import GithubLogo from './icons/GithubLogo';
import {Link} from 'react-aria-components';
// @ts-ignore
import {pressScale} from '@react-spectrum/s2';
import React, {CSSProperties, useId, useRef, useState} from 'react';
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

export default function Header() {
  const {currentPage} = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchMenuId = useId();
  let ref = useRef(null);
  let docsRef = useRef(null);
  let releasesRef = useRef(null);
  let blogRef = useRef(null);
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
    let viewTransition = document.startViewTransition(() => {
      // Wait until next render. Using flushSync causes flickering.
      return new Promise<void>(resolve => {
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
      });
    });

    viewTransition.finished.then(() => {
      document.documentElement.style.viewTransitionName = '';
    });
  };

  useLayoutEffect(() => {
    renderCallback.current?.();
    renderCallback.current = null;
  });

  let library = getLibraryFromPage(currentPage);
  let subdirectory: 's2' | 'react-aria' = 's2';
  if (library === 'internationalized' || library === 'react-aria') {
    // the internationalized library has no homepage so i've chosen to route it to the react aria homepage
    subdirectory = 'react-aria';
  }

  let baseUrl = getBaseUrl(subdirectory);
  let homepage = `${baseUrl}/`;
  let docs = `${baseUrl}/getting-started`;
  let release = `${baseUrl}/releases/`;
  let blog = `${getBaseUrl('react-aria')}/blog/`;

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
              <div className={style({display: 'flex', alignItems: 'center'})}>
                <div style={{viewTransitionName: !searchOpen ? 'search-menu-icon' : 'none'} as CSSProperties}>
                  {getButtonIcon(currentPage)}
                </div>
                <span className={style({font: 'ui-2xl', marginStart: 8})} style={{viewTransitionName: !searchOpen ? 'search-menu-label' : 'none'} as CSSProperties}>
                  {getButtonText(currentPage)}
                </span>
              </div>
            </Link>
          </div>
          <SearchMenuTrigger
            onOpen={openSearchMenu}
            onClose={closeSearchMenu}
            isSearchOpen={searchOpen}
            overlayId={searchMenuId} />
          <div className={style({display: 'flex', alignItems: 'center', gap: 4, justifySelf: 'end'})}>
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
