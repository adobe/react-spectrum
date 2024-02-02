import {Dialog as RACDialog, DialogProps as RACDialogProps, HeadingContext, Provider, composeRenderProps, HeaderContext} from 'react-aria-components';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {ButtonGroupContext, ContentContext, FooterContext, ImageContext} from './Content';
import {CloseButton} from './CloseButton';
import {useMediaQuery} from '@react-spectrum/utils';

interface DialogProps extends RACDialogProps {
  isDismissable?: boolean,
  size?: 'S' | 'M' | 'L' | 'fullscreen' | 'fullscreenTakeover'
}

const image = style({
  width: 'full',
  height: '[140px]',
  objectFit: 'cover'
});

const heading = style({
  flex: 1,
  marginY: 0,
  fontSize: '3xl',
  color: 'heading'
});

const header = style({
  fontSize: 'xl',
  color: 'body'
});

const content =  style({
  flex: 1,
  overflowY: {
    default: 'auto',
    // Make the whole dialog scroll rather than only the content when the height it small.
    '@media (height < 400)': 'visible'
  },
  fontSize: 'lg',
  lineHeight: 100,
  color: 'body',
  // TODO: adjust margin on mobile?
  marginX: 8
});

const footer = style({
  flex: 1,
  fontSize: 'lg',
  color: 'body'
});

const buttonGroup = style({
  marginStart: 'auto'
});

export function Dialog(props: DialogProps) {
  // The button group in fullscreen dialogs usually goes at the top, but
  // when the window is small, it moves to the bottom. We could do this in
  // pure CSS with display: none, but then the ref would go to two places.
  // With JS we can actually unmount on of them to ensure there is only one at a time.
  // Hopefully apps don't SSR render a dialog that's already open, because this means
  // we don't evaluate the media query until JS loads.
  let isSmall = useMediaQuery('(max-width: 640px)');
  let buttonGroupPlacement = 'bottom';
  if (props.size === 'fullscreen' || props.size === 'fullscreenTakeover') {
    buttonGroupPlacement = isSmall ? 'bottom' : 'top';
  }

  if (props.isDismissable) {
    buttonGroupPlacement = 'none';
  }

  // TODO: manage focus when the button group placement changes and focus was on one of the buttons?

  return (
    <RACDialog 
      {...props}
      className={style({
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '[inherit]',
        boxSizing: 'border-box',
        outlineStyle: 'none',
        overflow: 'auto',
        fontFamily: 'sans'
      })()}>
      {composeRenderProps(props.children, (children, {close}) => 
        // Render the children multiple times inside the wrappers we need to implement the layout.
        // Each instance hides certain children so that they are all rendered in the correct locations.
        (<>
          {/* Hero image */}
          <Provider
            values={[
              [ImageContext, {className: image()}],
              [HeadingContext, {hidden: true}],
              [HeaderContext, {hidden: true}],
              [ContentContext, {hidden: true}],
              [FooterContext, {hidden: true}],
              [ButtonGroupContext, {hidden: true}]
            ]}>
            {children}
          </Provider>
          {/* Top header: heading, header, dismiss button, and button group (in fullscreen dialogs). */}
          <div 
            className={style({
              // Wrapper that creates the margin for the dismiss button.
              display: 'flex',
              alignItems: 'start',
              columnGap: 3,
              marginStart: 8,
              marginEnd: {
                default: 8,
                isDismissable: 3
              },
              marginTop: 3
            })({isDismissable: props.isDismissable})}>
            <div 
              className={style({
                // Wrapper for heading, header, and button group.
                // This swaps orientation from horizontal to vertical at small screen sizes.
                display: 'flex',
                flex: 1,
                marginTop: 5, // 8 - 3 (handled above)
                marginBottom: {
                  default: 4,
                  ':empty': 0
                },
                columnGap: 6,
                rowGap: 2,
                flexDirection: {
                  default: 'column',
                  sm: 'row'
                },
                alignItems: {
                  default: 'start',
                  sm: 'center'
                }
              })()}>
              <Provider
                values={[
                  [ImageContext, {hidden: true}],
                  [HeadingContext, {className: heading()}],
                  [HeaderContext, {className: header()}],
                  [ContentContext, {hidden: true}],
                  [FooterContext, {hidden: true}],
                  [ButtonGroupContext, {hidden: buttonGroupPlacement !== 'top'}]
                ]}>
                {children}
              </Provider>
            </div>
            {props.isDismissable && 
              <CloseButton onPress={close} className={style({marginBottom: 3})()} />
            }
          </div>
          {/* Main content */}
          <Provider
            values={[
              [ImageContext, {hidden: true}],
              [HeadingContext, {hidden: true}],
              [HeaderContext, {hidden: true}],
              [ContentContext, {className: content()}],
              [FooterContext, {hidden: true}],
              [ButtonGroupContext, {hidden: true}]
            ]}>
            {children}
          </Provider>
          {/* Footer and button group */}
          <div 
            className={style({
              display: 'flex',
              marginX: 8,
              marginBottom: 8,
              marginTop: {
                default: 8,
                ':empty': 0
              },
              gap: 6,
              alignItems: 'center',
              flexWrap: 'wrap'
            })()}>
            <Provider
              values={[
                [ImageContext, {hidden: true}],
                [HeadingContext, {hidden: true}],
                [HeaderContext, {hidden: true}],
                [ContentContext, {hidden: true}],
                [FooterContext, {className: footer()}],
                [ButtonGroupContext, {hidden: buttonGroupPlacement !== 'bottom', className: buttonGroup()}]
              ]}>
              {children}
            </Provider>
          </div>
        </>)
      )}
    </RACDialog>
  );
}
