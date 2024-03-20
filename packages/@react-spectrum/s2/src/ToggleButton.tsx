import {Provider, ToggleButton as RACToggleButton, ToggleButtonProps as RACToggleButtonProps} from 'react-aria-components';
import {pressScale} from './pressScale';
import {ReactNode, forwardRef} from 'react';
import {ActionButtonStyleProps, styles} from './ActionButton';
import {FocusableRef} from '@react-types/shared';
import {useFocusableRef} from '@react-spectrum/utils';
import {StyleProps} from './style-utils';
import {TextContext, Text} from './Content';
import {IconContext} from './Icon';
import {fontRelative, style} from '../style/spectrum-theme' with {type: 'macro'};
import {centerBaseline} from './CenterBaseline';

export interface ToggleButtonProps extends Omit<RACToggleButtonProps, 'className' | 'style' | 'children'>, StyleProps, ActionButtonStyleProps {
  /** The content to display in the button. */
  children?: ReactNode,
  /** Whether the button should be displayed with an [emphasized style](https://spectrum.adobe.com/page/action-button/#Emphasis). */
  isEmphasized?: boolean
}

function ToggleButton(props: ToggleButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  let domRef = useFocusableRef(ref);
  return (
    <RACToggleButton
      {...props}
      ref={domRef}
      style={pressScale(domRef, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + styles({
        ...renderProps,
        staticColor: props.staticColor,
        size: props.size,
        isQuiet: props.isQuiet,
        isEmphasized: props.isEmphasized
      }, props.css)}>
      <Provider
        values={[
          [TextContext, {className: style({paddingY: '--labelPadding', order: 1})}],
          [IconContext, {
            render: centerBaseline({slot: 'icon', className: style({order: 0})}),
            css: style({size: fontRelative(20), marginStart: '--iconMargin', flexShrink: 0})
          }]
        ]}>
        {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
      </Provider>
    </RACToggleButton>
  );
}

/**
 * ToggleButtons allow users to toggle a selection on or off, for example
 * switching between two states or modes.
 */
let _ToggleButton = forwardRef(ToggleButton);
export {_ToggleButton as ToggleButton};

