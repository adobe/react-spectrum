/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {colorScheme} from './style-utils' with {type: 'macro'};
import {ColorSchemeContext} from './Provider';
import {DOMRef, GlobalDOMAttributes} from '@react-types/shared';
import {forwardRef, MutableRefObject, useCallback, useContext} from 'react';
import {ModalOverlay, ModalOverlayProps, Modal as RACModal, useLocale} from 'react-aria-components';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';

interface ModalProps extends Omit<ModalOverlayProps, 'className' | 'style' | keyof GlobalDOMAttributes> {
  /**
   * The size of the Modal.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL' | 'fullscreen' | 'fullscreenTakeover'
}

const modalOverlayStyles = style({
  ...colorScheme(),
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

const modalWrapper = style({
  position: 'sticky',
  top: 0,
  left: 0,
  width: 'full',
  height: '--visual-viewport-height',
  display: 'flex',
  alignItems: {
    default: 'center',
    size: {
      fullscreenTakeover: 'start'
    }
  },
  justifyContent: 'center'
});

/**
 * A modal is an overlay element which blocks interaction with elements outside it.
 */
export const Modal = forwardRef(function Modal(props: ModalProps, ref: DOMRef<HTMLDivElement>) {
  let domRef = useDOMRef(ref);
  let colorScheme = useContext(ColorSchemeContext);
  let {locale, direction} = useLocale();

  // TODO: should we pass through lang and dir props in RAC?
  let modalRef = useCallback((el: HTMLDivElement) => {
    (domRef as MutableRefObject<HTMLDivElement>).current = el;
    if (el) {
      el.lang = locale;
      el.dir = direction;
    }
  }, [locale, direction, domRef]);

  return (
    <ModalOverlay
      {...props}
      className={renderProps => modalOverlayStyles({...renderProps, colorScheme})}>
      <div className={modalWrapper({size: props.size})} style={{containerType: 'size'} as any}>
        <RACModal
          {...props}
          ref={modalRef}
          className={renderProps => style({
            display: 'flex',
            flexDirection: 'column',
            borderRadius: {
              default: 'xl',
              size: {
                fullscreenTakeover: 'none'
              }
            },
            width: {
              size: {
                // Copied from designs, not sure if correct.
                S: 400,
                M: 480,
                L: 640,
                XL: 960,
                fullscreen: 'calc(100% - 40px)',
                fullscreenTakeover: 'full'
              }
            },
            height: {
              size: {
                fullscreen: 'calc(100% - 40px)',
                fullscreenTakeover: 'full'
              }
            },
            maxWidth: {
              default: '90vw',
              size: {
                fullscreen: 'none',
                fullscreenTakeover: 'none'
              }
            },
            maxHeight: {
              default: '90%',
              size: {
                fullscreen: 'none',
                fullscreenTakeover: 'none'
              }
            },
            paddingBottom: {
              size: {
                // Extend background behind the iOS Safari toolbar and keyboard.
                fullscreenTakeover: '[100vh]'
              }
            },
            '--s2-container-bg': {
              type: 'backgroundColor',
              value: 'layer-2'
            },
            backgroundColor: '--s2-container-bg',
            opacity: {
              isEntering: 0,
              isExiting: 0
            },
            translateY: {
              isEntering: 20
            },
            transition: '[opacity, translate]',
            transitionDuration: {
              default: 250,
              isExiting: 130
            },
            transitionDelay: {
              default: 160,
              isExiting: 0
            },
            // Transparent outline for WHCM.
            outlineStyle: 'solid',
            outlineWidth: 1,
            outlineColor: 'transparent'
          })({...renderProps, size: props.size})} />
      </div>
    </ModalOverlay>
  );
});
