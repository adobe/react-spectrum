import {useRef} from 'react';
import {ButtonProps, Button as RACButton} from 'react-aria-components';
import {baseColor, style} from '../style-macro/spectrum-theme.ts' with { type: 'macro' };
import {pressScale} from './pressScale.ts';
import {focusRing} from './style-utils.ts' with { type: 'macro' };

export function ActionButton(props: ButtonProps & {size: 'XS' | 'S' | 'M' | 'L' | 'XL'}) {
  let ref = useRef(null);
  return (
    <RACButton
      {...props}
      ref={ref}
      style={pressScale(ref)}
      className={renderProps => style({
        ...focusRing(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: 'text-to-visual',
        fontFamily: 'sans',
        fontWeight: 'medium',
        fontSize: 'control',
        height: 'control',
        transition: 'default',
        backgroundColor: baseColor('gray-100'),
        color: 'neutral',
        borderStyle: 'none',
        paddingX: 'edge-to-text',
        paddingY: 0,
        borderRadius: 'control',
        '--iconMargin': {
          type: 'marginTop',
          value: {
            default: '[calc(-2 / 14 * 1em)]',
            isIconOnly: 0
          }
        }
      })({...renderProps, size: props.size})} />
  );
}
