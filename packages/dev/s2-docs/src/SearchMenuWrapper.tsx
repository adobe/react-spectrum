'use client';

import {Button, ButtonContext, ButtonProps, DialogTrigger} from 'react-aria-components';
import {preloadSearchMenu} from './SearchMenuTrigger';
import React, {lazy, ReactNode} from 'react';
import {Modal as S2Modal} from '../../../@react-spectrum/s2/src/Modal';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };

const MobileSearchMenu = lazy(() => import('./SearchMenu').then(({MobileSearchMenu}) => ({default: MobileSearchMenu})));

export default function SearchMenuWrapper({children}: {children: ReactNode}) {
  return (
    <>
      <div className={style({display: {default: 'none', lg: 'flex'}})}>
        <ButtonContext value={{onHoverStart: () => preloadSearchMenu(), onPress: () => window.dispatchEvent(new CustomEvent('show-search-menu'))}}>
          {children}
        </ButtonContext>
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
