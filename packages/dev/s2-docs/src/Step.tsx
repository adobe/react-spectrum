import {raw} from '../../../@react-spectrum/s2/style/style-macro' with {type: 'macro'};
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export function StepList({children}) {
  return (
    <ol
      style={{counterReset: 'step'}}
      className={style({font: 'body', paddingStart: {default: 0, md: 'calc(1lh + 8px)'}})}>
      {children}
    </ol>
  );
}

export function Step({children}) {
  return (
    <li
      style={{counterIncrement: 'step'}}
      className={style({
        font: {
          default: 'body',
          lg: 'body-lg'
        },
        marginY: 0,
        listStyleType: 'none',
        position: 'relative'
      })}>
      {children}
    </li>
  );
}

export function Counter() {
  return (
    <span
      className={raw('&::before { content: counter(step) }') + style({
        fontWeight: 'normal',
        borderRadius: 'full',
        aspectRatio: 'square',
        backgroundColor: 'neutral',
        display: 'inline-block',
        height: '[1lh]',
        textAlign: 'center',
        color: 'gray-25',
        marginStart: {
          default: 0,
          md: 'calc(-1lh - 8px)'
        },
        marginEnd: 8
      })} />
  );
}
