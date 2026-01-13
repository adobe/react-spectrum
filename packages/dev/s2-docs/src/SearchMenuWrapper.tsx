'use client';

import {Button, ButtonContext, ButtonProps, DialogTrigger} from 'react-aria-components';
import {preloadSearchMenu} from './SearchMenuTrigger';
import {Provider} from '@react-spectrum/s2';
import React, {lazy, ReactNode} from 'react';
import {Modal as S2Modal} from '../../../@react-spectrum/s2/src/Modal';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {useSettings} from './SettingsContext';

const MobileSearchMenu = lazy(() => import('./SearchMenu').then(({MobileSearchMenu}) => ({default: MobileSearchMenu})));

export default function SearchMenuWrapper({children}: {children: ReactNode}) {
  let {colorScheme} = useSettings();
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
            <Provider colorScheme={colorScheme} styles={style({height: 'full'})}>
              <MobileSearchMenu initialTag="components" />
            </Provider>
          </S2Modal>
        </DialogTrigger>
      </div>
    </>
  );
}

export function SearchMenuButton(props: ButtonProps) {
  return <Button {...props} />;
}
