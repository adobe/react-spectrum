'use client';

import {Button, ButtonProps, Modal, ModalOverlay} from 'react-aria-components';
import {fontRelative, style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {getLibraryFromPage, getLibraryLabel} from './library';
import {Page} from '@parcel/rsc';
import React, {CSSProperties, lazy, useCallback, useEffect, useState} from 'react';
import Search from '@react-spectrum/s2/icons/Search';

let SearchMenu = lazy(() => import('./SearchMenu').then(({SearchMenu}) => ({default: SearchMenu})));
export async function preloadSearchMenu() {
  try {
    SearchMenu = (await import('./SearchMenu')).SearchMenu as any;
  } catch {
    // ignore.
  }
}

export interface SearchMenuTriggerProps extends Omit<ButtonProps, 'children' | 'className'> {
  pages: Page[],
  currentPage: Page,
  onOpen: () => void,
  onClose: () => void,
  isSearchOpen: boolean,
  overlayId: string
}

let underlayStyle = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: 'full',
  height: '--page-height',
  isolation: 'isolate',
  backgroundColor: 'transparent-black-500',
  opacity: {
    isEntering: 0,
    isExiting: 0
  },
  transition: 'opacity',
  transitionDuration: {
    default: 250,
    isExiting: 130
  }
});

let modalStyle = style({
  position: 'absolute',
  top: 8,
  width: 'full',
  // 1280px matches body
  maxWidth: '[min(1280px, 95vw)]',
  backgroundColor: 'elevated',
  paddingX: 16,
  paddingY: 8,
  zIndex: 10,
  borderWidth: 1,
  borderColor: 'gray-300',
  borderStyle: 'solid',
  borderRadius: 'xl',
  boxShadow: 'elevated',
  left: 0,
  right: 0,
  margin: 'auto',
  height: '[90vh]'
});

export default function SearchMenuTrigger({onOpen, onClose, isSearchOpen, overlayId, ...props}: SearchMenuTriggerProps) {
  let [initialSearchValue, setInitialSearchValue] = useState('');
  let open = useCallback((value: string) => {
    setInitialSearchValue(value);
    onOpen();
  }, [onOpen]);


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

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, onClose, open]);
  
  
  return (
    <div
      className={style({
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        alignItems: 'center',
        gap: 16
      })}>
      <Button
        {...props}
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
            isFocusVisible: 'gray-900'
          },
          backgroundColor: 'gray-25',
          color: 'neutral-subdued',
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
        })({isHovered, isFocusVisible})}
        style={{viewTransitionName: !isSearchOpen ? 'search-menu-search-field' : 'none', visibility: isSearchOpen ? 'hidden' : 'visible'} as CSSProperties}>
        <Search
          UNSAFE_className={String(style({
            size: fontRelative(20),
            '--iconPrimary': {type: 'fill', value: 'currentColor'},
            flexShrink: 0
          }))} />
        <span className={style({font: 'ui-lg', color: 'gray-600'})}>Search {getLibraryLabel(getLibraryFromPage(props.currentPage))}</span>
        <kbd
          className={style({
            marginStart: 'auto',
            font: 'detail',
            backgroundColor: 'layer-1',
            paddingY: 2,
            paddingX: 8,
            borderRadius: 'xl',
            borderWidth: 1,
            borderColor: 'gray-300',
            borderStyle: 'solid',
            pointerEvents: 'none',
            alignSelf: 'center'
          })}>⌘K</kbd>
      </Button>
      <ModalOverlay
        isDismissable
        isOpen={isSearchOpen}
        onOpenChange={(isOpen) => { if (!isOpen) { onClose(); } }}
        className={underlayStyle}>
        <Modal className={modalStyle}>
          <SearchMenu
            pages={props.pages}
            currentPage={props.currentPage}
            onClose={onClose}
            overlayId={overlayId}
            initialSearchValue={initialSearchValue}
            isSearchOpen={isSearchOpen} />
        </Modal>
      </ModalOverlay>
    </div>
  );
}
