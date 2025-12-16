'use client';

import {Button, ButtonProps, Modal, ModalOverlay} from 'react-aria-components';
import {fontRelative, lightDark, style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {getLibraryFromPage, getLibraryLabel} from './library';
import React, {lazy, useCallback, useEffect, useRef, useState} from 'react';
import {Button as S2Button, ButtonProps as S2ButtonProps} from '@react-spectrum/s2';
import Search from '@react-spectrum/s2/icons/Search';
import {useRouter} from './Router';

let SearchMenu = lazy(() => import('./SearchMenu').then(({SearchMenu}) => ({default: SearchMenu})));
export async function preloadSearchMenu() {
  try {
    SearchMenu = (await import('./SearchMenu')).SearchMenu as any;
  } catch {
    // ignore.
  }
}

export interface SearchMenuTriggerProps extends Omit<ButtonProps, 'children' | 'className'> {
  onOpen: () => void,
  onClose: () => void,
  isSearchOpen: boolean,
  overlayId: string,
  staticColor?: 'auto' | 'white'
}

let underlayStyle = style({
  position: 'fixed',
  inset: 0,
  isolation: 'isolate',
  backgroundColor: 'transparent-black-500'
});

let modalStyle = style({
  position: 'fixed',
  top: 8,
  width: 'full',
  // 1280px matches body
  maxWidth: '[min(1280px, 95vw)]',
  backgroundColor: 'layer-1',
  paddingX: 16,
  paddingY: 8,
  zIndex: 10,
  outlineWidth: 1,
  outlineColor: lightDark('transparent-white-25', 'transparent-white-100'),
  outlineStyle: 'solid',
  borderRadius: 'xl',
  boxShadow: 'elevated',
  left: 0,
  right: 0,
  margin: 'auto',
  height: '[90vh]'
});

export default function SearchMenuTrigger({onOpen, onClose, isSearchOpen, overlayId, staticColor, ...props}: SearchMenuTriggerProps) {
  let {currentPage} = useRouter();
  let [initialSearchValue, setInitialSearchValue] = useState('');
  let open = useCallback((value: string) => {
    setInitialSearchValue(value);
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    preloadSearchMenu();
  }, []);

  // Type to search handler
  let onKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Ignore modifier keys, navigation keys, Enter, Escape, etc.
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && e.key !== ' ') {
      e.preventDefault();
      open(e.key);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      open('');
    }
  }, [open]);

  useEffect(() => {
    let isMac = /Mac/.test(navigator.platform);
    const isTextInputLike = (el: Element | null): boolean => {
      if (!el) {
        return false;
      }
      let h = el as HTMLElement;
      return h.isContentEditable || !!el.closest('input, textarea, [contenteditable], [role="textbox"]');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing) {
        // avoid intercepting IME input
        return;
      }

      if (e.key === 'Escape' && isSearchOpen) {
        e.preventDefault();
        onClose();
      } else if (((e.key === 'k' && (isMac ? e.metaKey : e.ctrlKey)))) {
        e.preventDefault();
        open('');
      } else if (e.key === '/' && !(isTextInputLike(e.target as Element | null) || isTextInputLike(document.activeElement))) {
        e.preventDefault();
        open('');
      }
    };

    let handleCustomEvent = () => {
      open('');
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('show-search-menu', handleCustomEvent);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('show-search-menu', handleCustomEvent);
    };
  }, [isSearchOpen, onClose, open]);

  let [wasOpen, setWasOpen] = useState(isSearchOpen);
  if (isSearchOpen && !wasOpen) {
    setWasOpen(true);
  }

  // Manually restore focus to the trigger when search menu closes, since we don't actually unmount.
  let buttonRef = useRef<HTMLButtonElement | null>(null);
  let isOpenRef = useRef(isSearchOpen);
  useEffect(() => {
    if (!isSearchOpen && isOpenRef.current && buttonRef.current) {
      buttonRef.current.focus({preventScroll: true});
    }

    isOpenRef.current = isSearchOpen;
  }, [isSearchOpen]);
    
  return (
    <>
      <Button
        {...props}
        ref={buttonRef}
        aria-label="Open search and menu"
        aria-expanded={isSearchOpen}
        aria-controls={isSearchOpen ? overlayId : undefined}
        onPress={() => open('')}
        onHoverStart={() => preloadSearchMenu()}
        onKeyDown={onKeyDown}
        className={({isHovered, isFocusVisible}) => style({
          height: 40,
          boxSizing: 'border-box',
          paddingStart: 'pill',
          paddingEnd: 8,
          fontSize: 'ui-lg',
          borderRadius: 'full',
          borderWidth: 2,
          borderStyle: 'solid',
          transition: 'default',
          borderColor: {
            default: 'gray-300',
            isHovered: 'gray-400',
            isFocusVisible: 'gray-900',
            staticColor: {
              auto: {
                default: lightDark('transparent-black-200', 'transparent-white-300'),
                isHovered: lightDark('transparent-black-300', 'transparent-white-400'),
                isFocusVisible: lightDark('transparent-black-900', 'transparent-white-900')
              },
              white: {
                default: 'transparent-white-300',
                isHovered: 'transparent-white-400',
                isFocusVisible: 'transparent-white-900'
              }
            }
          },
          backgroundColor: {
            default: 'gray-25',
            staticColor: {
              auto: 'transparent-white-50',
              white: 'transparent-white-50'
            }
          },
          color: {
            default: 'neutral-subdued',
            staticColor: {
              auto: lightDark('transparent-black-600', 'transparent-white-800'),
              white: 'transparent-white-800'
            }
          },
          cursor: 'text',
          width: '[500px]',
          display: 'flex',
          alignItems: 'center',
          gap: 'text-to-visual',
          outlineStyle: {
            default: 'none',
            isFocusVisible: 'solid'
          },
          outlineOffset: 2,
          outlineColor: {
            default: 'transparent',
            isFocusVisible: 'focus-ring'
          },
          outlineWidth: {
            default: 0,
            isFocusVisible: 2
          }
        })({isHovered, isFocusVisible, staticColor})}
        style={{visibility: isSearchOpen ? 'hidden' : 'visible', backdropFilter: 'blur(8px)'}}>
        <Search
          UNSAFE_className={String(style({
            size: fontRelative(20),
            '--iconPrimary': {type: 'fill', value: 'currentColor'},
            flexShrink: 0
          }))} />
        <span className={style({font: 'ui-lg', color: {default: 'gray-600', staticColor: {auto: lightDark('transparent-black-600', 'transparent-white-800'), white: 'transparent-white-800'}}})({staticColor})}>Search {getLibraryLabel(getLibraryFromPage(currentPage))}</span>
        <kbd
          className={style({
            marginStart: 'auto',
            font: 'detail',
            color: {
              default: 'detail',
              staticColor: {
                auto: lightDark('transparent-black-600', 'transparent-white-800'),
                white: 'transparent-white-800'
              }
            },
            backgroundColor: {
              default: 'layer-1',
              staticColor: {
                auto: lightDark('transparent-black-50', 'transparent-white-50'),
                white: 'transparent-white-50'
              }
            },
            paddingY: 2,
            paddingX: 8,
            borderRadius: 'xl',
            borderWidth: 1,
            borderColor: {
              default: 'gray-300',
              staticColor: {
                auto: lightDark('transparent-black-200', 'transparent-white-300'),
                white: 'transparent-white-300'
              }
            },
            borderStyle: 'solid',
            pointerEvents: 'none',
            alignSelf: 'center'
          })({staticColor})}>⌘K</kbd>
      </Button>
      <ModalOverlay
        isDismissable
        isOpen={isSearchOpen}
        onOpenChange={(isOpen) => { if (!isOpen) { onClose(); } }}
        className={underlayStyle}
        // Keep in the DOM after it has opened once to preserve scroll position.
        isExiting={!isSearchOpen && wasOpen}
        style={{
          display: !isSearchOpen ? 'none' : undefined,
          // @ts-ignore
          viewTransitionName: 'search-menu-underlay'
        }}>
        <Modal
          className={modalStyle}
          style={{
            // @ts-ignore
            viewTransitionName: 'search-menu'
          }}>
          <SearchMenu
            onClose={onClose}
            overlayId={overlayId}
            initialSearchValue={initialSearchValue}
            isSearchOpen={isSearchOpen} />
        </Modal>
      </ModalOverlay>
    </>
  );
}

export function SearchMenuButton(props: S2ButtonProps) {
  let onPress = () => {
    window.dispatchEvent(new CustomEvent('show-search-menu'));
  };

  return (
    <S2Button
      size="XL"
      staticColor="white"
      variant="secondary"
      {...props}
      onPress={onPress}
      // @ts-ignore
      onHoverStart={() => preloadSearchMenu()}>
      Explore components
    </S2Button>
  );
}
