import {Button as RACButton, ButtonProps} from 'react-aria-components';
import {style, baseColor} from '../style-macro/spectrum-theme.ts' with {type: 'macro'};
import {focusRing} from './style-utils.ts' with {type: 'macro'};

export function ActionButton(props: ButtonProps & {size: 'XS' | 'S' | 'M' | 'L' | 'XL'}) {
  return (
    <RACButton
      {...props}
      className={renderProps => style({
        ...focusRing(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: 'text-to-visual',
        fontFamily: 'sans',
        fontSize: 'control',
        height: 'control',
        willChange: 'transform',
        transform: {
          isPressed: 'perspective(max(self(height), 24px)) translateZ(-2px)'
        },
        transition: 'default',
        backgroundColor: baseColor('gray-100'),
        color: 'neutral',
        borderStyle: 'none',
        paddingX: 'edge-to-text',
        paddingY: 0,
        borderRadius: 'control'
      })({...renderProps, size: props.size})} />
  );
}
