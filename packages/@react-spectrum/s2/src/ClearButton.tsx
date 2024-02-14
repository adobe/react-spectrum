import {
  Button,
  ButtonProps,
  ButtonRenderProps
} from 'react-aria-components';
import CrossIcon from '../ui-icons/S2_CrossSize100.svg';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};


interface ClearButtonStyleProps {
  size?: 'S' | 'M' | 'L' | 'XL'
}

interface ClearButtonRenderProps extends ButtonRenderProps, ClearButtonStyleProps {}
interface ClearButtonProps extends ButtonProps, ClearButtonStyleProps {}

export function ClearButton(props: ClearButtonProps) {
  return (
    <Button
      {...props}
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
