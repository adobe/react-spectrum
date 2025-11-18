'use client';

import '../tailwind/home.global.css';
import {Button, DialogTrigger, Modal, ModalOverlay} from 'react-aria-components';
import {flushSync} from 'react-dom';
import {preloadSearchMenu} from './SearchMenuTrigger';
import React, {lazy, useState} from 'react';
import {Modal as S2Modal} from '../../../@react-spectrum/s2/src/Modal';
import {SearchMenu} from './SearchMenu';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };

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


export default function SearchMenuWrapper({pages, currentPage}) {
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
        <DialogTrigger isOpen={searchOpen} onOpenChange={() => {openSearchMenu();}} >
          <Button className="font-spectrum no-underline bg-white/60 border border-black/10 bg-clip-padding text-base md:text-lg font-bold text-slate-800 px-8 py-3 rounded-full backdrop-saturate-150 backdrop-brightness-125 transition hover:bg-white/60 focus-ring  dark:outline-white outline-offset-2 active:scale-95 cursor-pointer">Explore Components</Button>
          <ModalOverlay
            style={{zIndex: 21}}
            isDismissable
            className={underlayStyle}>
            <Modal className={modalStyle}>
              <SearchMenu
                pages={pages}
                currentPage={currentPage}
                onClose={closeSearchMenu}
                initialSearchValue=""
                isSearchOpen={searchOpen} />
            </Modal>
          </ModalOverlay>
        </DialogTrigger>
      </div>
      <div className={style({display: {default: 'flex', lg: 'none'}})}>
        <DialogTrigger>
          <Button className="font-spectrum no-underline bg-white/60 border border-black/10 bg-clip-padding text-base md:text-lg font-bold text-slate-800 px-8 py-3 rounded-full backdrop-saturate-150 backdrop-brightness-125 transition hover:bg-white/60 focus-ring  dark:outline-white outline-offset-2 active:scale-95 cursor-pointer">Explore Components</Button>
          <S2Modal size="fullscreenTakeover">
            <MobileSearchMenu pages={pages} currentPage={currentPage} />
          </S2Modal>
        </DialogTrigger>
      </div>
    </>
  );
}


