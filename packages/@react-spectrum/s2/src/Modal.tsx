import {Modal as RACModal, ModalOverlay, ModalOverlayProps} from 'react-aria-components';
import { style } from '../style-macro/spectrum-theme' with {type: 'macro'};
import { keyframes } from '../style-macro/style-macro' with {type: 'macro'};

interface ModalProps extends ModalOverlayProps {
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

export function Modal(props: ModalProps) {
  return (
    <ModalOverlay
      {...props}
      className={style({
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
      })}>
      <RACModal
        {...props}
        className={renderProps => style({
          display: 'flex',
          borderRadius: {
            default: 'xl',
            size: {
              fullscreenTakeover: 'none'
            }
          },
          width: {
            size: {
              // Copied from Figma, not sure if correct.
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
          overflow: 'hidden',
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
          animationFillMode: 'both'
        })({...renderProps, size: props.size || 'M'})} />
    </ModalOverlay>
  );
}
