'use client';

import {Button, ButtonContext, ButtonProps, DialogTrigger, Modal, ModalOverlay} from 'react-aria-components';
import {flushSync} from 'react-dom';
import {preloadSearchMenu} from './SearchMenuTrigger';
import React, {lazy, ReactNode, useState} from 'react';
import {Modal as S2Modal} from '../../../@react-spectrum/s2/src/Modal';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };

const SearchMenu = lazy(() => import('./SearchMenu').then(({SearchMenu}) => ({default: SearchMenu})));
const MobileSearchMenu = lazy(() => import('./SearchMenu').then(({MobileSearchMenu}) => ({default: MobileSearchMenu})));

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
  position: 'sticky',
  top: 8,
  width: 'full',
  // 1280px matches body
  maxWidth: '[min(1280px, 95vw)]',
  backgroundColor: 'layer-1',
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


export default function SearchMenuWrapper({children}: {children: ReactNode}) {
  const [searchOpen, setSearchOpen] = useState(false);

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

  return (
    <>
      <div className={style({display: {default: 'none', lg: 'flex'}})}>
        <DialogTrigger isOpen={searchOpen} onOpenChange={() => {openSearchMenu();}}>
          <ButtonContext value={{onHoverStart: () => preloadSearchMenu()}}>
            {children}
          </ButtonContext>
          <ModalOverlay
            style={{
              zIndex: 21,
              // @ts-ignore
              viewTransitionName: 'search-menu-underlay'
            }}
            isDismissable
            className={underlayStyle}>
            <Modal className={modalStyle}>
              <SearchMenu
                onClose={closeSearchMenu}
                initialSearchValue=""
                initialTag="components"
                isSearchOpen={searchOpen} />
            </Modal>
          </ModalOverlay>
        </DialogTrigger>
      </div>
      <div className={style({display: {default: 'flex', lg: 'none'}})}>
        <DialogTrigger>
          {children}
          <S2Modal size="fullscreenTakeover">
            <MobileSearchMenu initialTag="components" />
          </S2Modal>
        </DialogTrigger>
      </div>
    </>
  );
}

export function SearchMenuButton(props: ButtonProps) {
  return <Button {...props} />;
}
