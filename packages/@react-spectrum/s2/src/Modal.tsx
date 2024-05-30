import {Modal as RACModal, ModalOverlay, ModalOverlayProps, useLocale} from 'react-aria-components';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {keyframes} from '../style/style-macro' with {type: 'macro'};
import {colorScheme} from './style-utils' with {type: 'macro'};
import {DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';
import {MutableRefObject, forwardRef, useCallback, useContext} from 'react';
import {ColorSchemeContext} from './Provider';

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
            size: {
              S: '[90vw]',
              M: '[90vw]',
              L: '[90vw]'
            }
          },
          maxHeight: {
            size: {
              S: '[90vh]',
              M: '[90vh]',
              L: '[90vh]'
            }
          },
          backgroundColor: 'layer-2',
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
        })({...renderProps, size: props.size || 'M'})} />
    </ModalOverlay>
  );
}

/**
 * A modal is an overlay element which blocks interaction with elements outside it.
 */
let _Modal = forwardRef(Modal);
export {_Modal as Modal};
