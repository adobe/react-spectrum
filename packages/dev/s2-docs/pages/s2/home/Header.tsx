'use client';

import {CSSProperties, useId, useRef, useState} from 'react';
import SearchMenuTrigger, {preloadSearchMenu} from '@react-spectrum/s2-docs/src/SearchMenuTrigger';
import {useLayoutEffect} from '@react-aria/utils';
import { HeaderLink, Link } from '@react-spectrum/s2-docs/src/Link';
import { space, style } from '@react-spectrum/s2/style' with {type: 'macro'};
import { getBaseUrl } from '@react-spectrum/s2-docs/src/pageUtils';
import GithubLogo from '@react-spectrum/s2-docs/src/icons/GithubLogo';
import { NpmLogo } from '@react-spectrum/s2-docs/src/icons/NpmLogo';

export default function HomeHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchMenuId = useId();
  let renderCallback = useRef<(() => void) | null>(null);
  let iconRef = useRef<SVGSVGElement | null>(null);
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
    <nav
      className={style({
        marginX: 'auto',
        paddingTop: {
          default: 12,
          lg: 20
        },
        paddingBottom: 16,
        paddingX: 12,
        maxWidth: 1440,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        isolation: 'isolate'
      })}>
      <Link
        href="."
        staticColor="white"
        UNSAFE_style={{lineHeight: '0'}}
        styles={style({
          zIndex: 2,
          marginStart: {
            default: 0,
            '@media (width >= 1440px)': space(38)
          }
        })}>
        <span 
          className={style({
            display: 'inline-flex',
            alignItems: 'center',
            columnGap: {
              default: 12,
              lg: space(10)
            },
            textDecoration: 'none'
          })}>
          <svg
            ref={iconRef}
            style={{display: searchOpen ? 'none' : undefined} as CSSProperties}
            aria-label="Adobe"
            className={style({size: 28})}
            viewBox="0 0 501.71 444.05">
            <path
              d="m297.58 444.05-36.45-101.4h-91.46l76.87-193.53 116.65 294.93h138.52L316.8 0H186.23L0 444.05h297.58z"
              fill="#fff" />
          </svg>
          <span ref={labelRef} className={style({font: 'heading-sm', fontWeight: 'extra-bold', color: 'white'})} style={{display: searchOpen ? 'none' : undefined} as CSSProperties}>React Spectrum</span>
        </span>
      </Link>
      <div className={style({position: 'absolute', insetStart: 0, width: 'full', display: {default: 'none', xl: 'flex'}, justifyContent: 'center'})}>
        <div ref={searchRef}>
          <SearchMenuTrigger
            onOpen={openSearchMenu}
            onClose={closeSearchMenu}
            isSearchOpen={searchOpen}
            overlayId={searchMenuId}
            staticColor="white" />
        </div>
      </div>
      <div className={style({display: 'flex', alignItems: 'center', gap: 4, justifySelf: 'end'})}>
        <HeaderLink staticColor="white" href="getting-started" styles={style({display: {default: 'none', sm: 'flex'}})}>Docs</HeaderLink>
        <HeaderLink staticColor="white" href="releases/" styles={style({display: {default: 'none', sm: 'flex'}})}>Releases</HeaderLink>
        <HeaderLink staticColor="white" href={getBaseUrl('react-aria') + '/blog/'} rel="noopener noreferrer" styles={style({display: {default: 'none', sm: 'flex'}})}>Blog</HeaderLink>
        <HeaderLink staticColor="white" aria-label="GitHub" href="https://github.com/adobe/react-spectrum" target="_blank" rel="noopener noreferrer"><GithubLogo /></HeaderLink>
        <HeaderLink staticColor="white" aria-label="npm" href="https://npmjs.com/@react-spectrum/s2" target="_blank" rel="noopener noreferrer"><NpmLogo /></HeaderLink>
      </div>
    </nav>
  );
}
