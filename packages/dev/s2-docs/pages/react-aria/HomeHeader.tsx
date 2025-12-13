'use client';

import {CSSProperties, useId, useRef, useState} from 'react';
import SearchMenuTrigger, {preloadSearchMenu} from '@react-spectrum/s2-docs/src/SearchMenuTrigger';
import {useLayoutEffect} from '@react-aria/utils';
import {HeaderLink} from '@react-spectrum/s2-docs/src/Link';
import { ReactAriaLogo } from '@react-spectrum/s2-docs/src/icons/ReactAriaLogo';
import { style } from '@react-spectrum/s2/style' with {type: 'macro'};
import GithubLogo from '@react-spectrum/s2-docs/src/icons/GithubLogo';
import { NpmLogo } from '@react-spectrum/s2-docs/src/icons/NpmLogo';

export default function HomeHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchMenuId = useId();
  let renderCallback = useRef<(() => void) | null>(null);
  let iconRef = useRef<HTMLDivElement | null>(null);
  let labelRef = useRef<HTMLDivElement | null>(null);
  let searchRef = useRef<HTMLDivElement | null>(null);

  let openSearchMenu = async () => {
    if (!document.startViewTransition) {
      setSearchOpen((prev) => !prev);
      return;
    }

    // Preload SearchMenu so it is ready to render immediately.
    await preloadSearchMenu();

    // Don't transition the entire page.
    document.documentElement.style.viewTransitionName = 'none';
    if (window.scrollY === 0) {
      iconRef.current!.style.viewTransitionName = 'search-menu-icon';
      labelRef.current!.style.viewTransitionName = 'search-menu-label';
      searchRef.current!.style.viewTransitionName = 'search-menu-search-field';
    }

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

        if (window.scrollY === 0) {
          iconRef.current!.style.viewTransitionName = 'search-menu-icon';
          labelRef.current!.style.viewTransitionName = 'search-menu-label';
          searchRef.current!.style.viewTransitionName = 'search-menu-search-field';
        }
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

  return (
    <nav className="absolute top-4 left-4 right-4 flex items-center justify-between gap-4">
      <a href="." className="no-underline inline-flex items-center gap-2 font-bold px-4 z-2 rounded dark:text-white/80 focus-ring dark:outline-white">
        <div ref={iconRef} style={{display: searchOpen ? 'none' : undefined} as CSSProperties}>
          <ReactAriaLogo />
        </div>
        <h2 className="text-lg m-0 text-black [font-weight:800] dark:text-white/80" ref={labelRef} style={{display: searchOpen ? 'none' : undefined} as CSSProperties}>React Aria</h2>
      </a>

      <div className={style({position: 'absolute', insetStart: 0, width: 'full', display: {default: 'none', xl: 'flex'}, justifyContent: 'center'})}>
        <div ref={searchRef}>
          <SearchMenuTrigger
            onOpen={openSearchMenu}
            onClose={closeSearchMenu}
            isSearchOpen={searchOpen}
            overlayId={searchMenuId}
            staticColor="auto" />
        </div>
      </div>

      <div className={style({display: 'flex', alignItems: 'center', gap: 4, justifySelf: 'end'})}>
        <HeaderLink staticColor="auto" href="getting-started" styles={style({display: {default: 'none', sm: 'flex'}})}>Docs</HeaderLink>
        <HeaderLink staticColor="auto" href="releases/" styles={style({display: {default: 'none', sm: 'flex'}})}>Releases</HeaderLink>
        <HeaderLink staticColor="auto" href="blog/" rel="noopener noreferrer" styles={style({display: {default: 'none', sm: 'flex'}})}>Blog</HeaderLink>
        <HeaderLink staticColor="auto" aria-label="GitHub" href="https://github.com/adobe/react-spectrum" target="_blank" rel="noopener noreferrer"><GithubLogo /></HeaderLink>
        <HeaderLink staticColor="auto" aria-label="npm" href="https://npmjs.com/react-aria-components" target="_blank" rel="noopener noreferrer"><NpmLogo /></HeaderLink>
      </div>
    </nav>
  );
}
