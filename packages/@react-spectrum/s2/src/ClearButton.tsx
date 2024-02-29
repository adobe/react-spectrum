import {
  Button,
  ButtonProps,
  ButtonRenderProps
} from 'react-aria-components';
import CrossIcon from '../ui-icons/S2_CrossSize100.svg';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {FocusableRef} from '@react-types/shared';
import {useFocusableRef} from '@react-spectrum/utils';
import {forwardRef} from 'react';

interface ClearButtonStyleProps {
  size?: 'S' | 'M' | 'L' | 'XL'
}

interface ClearButtonRenderProps extends ButtonRenderProps, ClearButtonStyleProps {}
interface ClearButtonProps extends ButtonProps, ClearButtonStyleProps {}

function ClearButton(props: ClearButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  let domRef = useFocusableRef(ref);

  return (
    <Button
      {...props}
      ref={domRef}
      className={renderProps => style<ClearButtonRenderProps>({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'full',
        width: 'control',
        borderStyle: 'none',
        outlineStyle: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        color: '[inherit]',
        '--iconPrimary': {
          type: 'fill',
          value: 'currentColor'
        }
      })({...renderProps, size: props.size || 'M'})}>
      <CrossIcon
        className={style({
          size: {
            size: {
              S: 2,
              M: 2,
              L: 2.5,
              XL: 2.5 // ???
            }
          }
        })({size: props.size})} />
    </Button>
  );
}

let _ClearButton = forwardRef(ClearButton);
export {_ClearButton as ClearButton};
