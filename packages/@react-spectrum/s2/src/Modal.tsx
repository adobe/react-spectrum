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
import {DOMRef} from '@react-types/shared';
import {forwardRef, MutableRefObject, useCallback, useContext} from 'react';
import {keyframes} from '../style/style-macro' with {type: 'macro'};
import {ModalOverlay, ModalOverlayProps, Modal as RACModal, useLocale} from 'react-aria-components';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';

interface ModalProps extends ModalOverlayProps {
  /**
   * The size of the Modal.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'fullscreen' | 'fullscreenTakeover'
}

const fade = keyframes(`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`);

const fadeAndSlide = keyframes(`
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`);

const modalOverlayStyles = style({
  ...colorScheme(),
  position: 'fixed',
  inset: 0,
  isolation: 'isolate',
  backgroundColor: 'transparent-black-500',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: {
    isEntering: fade,
    isExiting: fade
  },
  animationDuration: {
    isEntering: 250,
    isExiting: 130
  },
  animationDirection: {
    isEntering: 'normal',
    isExiting: 'reverse'
  }
});

function Modal(props: ModalProps, ref: DOMRef<HTMLDivElement>) {
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
              S: '[21rem]',
              M: '[26rem]',
              L: '[36rem]',
              fullscreen: '[calc(100% - 40px)]',
              fullscreenTakeover: 'full'
            }
          },
          height: {
            size: {
              fullscreen: '[calc(100% - 40px)]',
              fullscreenTakeover: 'full'
            }
          },
          maxWidth: {
            default: '[90vw]',
            size: {
              fullscreen: 'none',
              fullscreenTakeover: 'none'
            }
          },
          maxHeight: {
            default: '[90vh]',
            size: {
              fullscreen: 'none',
              fullscreenTakeover: 'none'
            }
          },
          '--s2-container-bg': {
            type: 'backgroundColor',
            value: 'layer-2'
          },
          backgroundColor: '--s2-container-bg',
          animation: {
            isEntering: fadeAndSlide,
            isExiting: fade
          },
          animationDuration: {
            isEntering: 250,
            isExiting: 130
          },
          animationDelay: {
            isEntering: 160,
            isExiting: 0
          },
          animationDirection: {
            isEntering: 'normal',
            isExiting: 'reverse'
          },
          animationFillMode: 'both',
          // Transparent outline for WHCM.
          outlineStyle: 'solid',
          outlineWidth: 1,
          outlineColor: 'transparent'
        })({...renderProps, size: props.size})} />
    </ModalOverlay>
  );
}

/**
 * A modal is an overlay element which blocks interaction with elements outside it.
 */
let _Modal = forwardRef(Modal);
export {_Modal as Modal};
