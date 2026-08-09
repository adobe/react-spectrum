import {Button, ButtonProps} from 'react-aria-components/Button';
import {
  convertColor,
  defaultBrand,
  defineProperties,
  token
} from './tokens.macro' with {type: 'macro'};
import {createIcon, IconContext} from '@react-spectrum/s2/Icon';
import {
  css,
  focusRing,
  fontRelative,
  space,
  style
} from '@react-spectrum/s2/style' with {type: 'macro'};
import {CSSProperties, useRef} from 'react';
import {GlobalDOMAttributes} from '@react-types/shared';
import {pressScale} from '@react-spectrum/s2/pressScale';

export interface AIButtonProps extends Omit<
  ButtonProps,
  | 'className'
  | 'style'
  | 'render'
  | 'children'
  | 'onHover'
  | 'onHoverStart'
  | 'onHoverEnd'
  | 'onHoverChange'
  | 'onClick'
  | 'isPending'
  | keyof GlobalDOMAttributes
> {
  size?: 'S' | 'M' | 'L' | 'XL';
  brandColor?: string;
  children?: string;
}

const controlSize = {
  default: 32,
  size: {
    XS: 20,
    S: 24,
    L: 40,
    XL: 48
  }
} as const;

const button = style({
  ...focusRing(),
  // ...control({shape: 'pill', wrap: true, icon: true}),
  font: {
    default: 'ui',
    size: {
      S: 'ui-sm',
      L: 'ui-lg',
      XL: 'ui-xl'
    }
  },
  display: 'flex',
  alignItems: 'center',
  columnGap: 'text-to-visual',
  boxSizing: 'border-box',
  paddingX: {
    default: 'edge-to-text',
    ':has(svg:only-child)': 0
  },
  minWidth: controlSize,
  height: controlSize,
  borderRadius: 'pill',
  borderWidth: 0,
  position: 'relative',
  justifyContent: 'center',
  textAlign: 'start',
  fontWeight: 'bold',
  userSelect: 'none',
  width: 'fit',
  transition: 'default',
  color: {
    default: `[color-mix(in srgb, light-dark(black, white), ${token('container.gradient.con-bg.idle.stop-4')} 20%)]`,
    isDisabled: 'transparent-overlay-400'
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  forcedColorAdjust: 'none',
  disableTapHighlight: true,
  overflow: 'clip',
  '--fill-y': {
    type: 'top',
    value: {
      size: {
        S: 4,
        M: 4,
        L: space(6),
        XL: space(10)
      }
    }
  },
  '--fill-x': {
    type: 'top',
    value: {
      size: {
        S: 2,
        M: 2,
        L: 4,
        XL: 4
      }
    }
  }
});

defineProperties(`
  @property --brand {
    syntax: '<color>';
    initial-value: ${defaultBrand()};
    inherits: true;
  }
`);

const bg = css(`
  &::before, &::after {
    content: '';
    pointer-events: none;
    position: absolute;
    bottom: 0px;
    border-radius: 9999px;
    z-index: -1;
    transition: inherit;
  }
  
  @container style(--s2-color-scheme: dark) {
    background-image: linear-gradient(to bottom, light-dark(white, #292929), light-dark(white, #383838));
    --border-opacity: 10%;
    box-shadow:
      inset 0 0.5px 0 0px rgb(255 255 255 / var(--border-opacity)),
      inset 0 0 0 0.5px rgb(255 255 255 / var(--border-opacity)),
      inset 0px 2px 8px rgb(95 95 95 / 50%);

    /* bottom sheen */
    &::before {
      height: 24px;
      inset-inline: 4px;
      background-image: linear-gradient(to bottom, transparent, white);
      mix-blend-mode: plus-lighter;
      filter: blur(2px);
      opacity: 50%;
    }

    /* color gradient (top layer) */
    &::after {
      top: var(--fill-y);
      inset-inline: var(--fill-x);
      background-image: linear-gradient(
        to right,
        ${token('container.gradient.con-bg.generating.stop-3')} 0%,
        ${token('container.gradient.con-bg.idle.stop-3')} 28%,
        ${token('container.gradient.con-bg.idle.stop-2')} 98%
      );
      opacity: 75%;
      mix-blend-mode: hard-light;
      filter: blur(8px);
    }

    &:has(svg:only-child) {
      &::after {
        filter: blur(4px);
      }
    }

    &[data-hovered] {
      --border-opacity: 20%;
      &::before {
        opacity: 75%;
      }
    }

    &[data-disabled] {
      &::before {
        opacity: 25%;
      }

      &::after {
        opacity: 0;
      }
    }
  }

  @container style(--s2-color-scheme: light) {
    background-color: white;

    /* color gradient */
    &::before {
      top: var(--fill-y);
      inset-inline: var(--fill-x);
      background-image: linear-gradient(
        to right,
        ${token('container.gradient.con-bg.idle.stop-3')} 0%,
        ${token('container.gradient.con-bg.idle.stop-2')} 12%,
        ${token('container.gradient.con-bg.generating.stop-3')} 77%
      );
      opacity: 75%;
      filter: blur(4px);
    }

    /* inset shadows */
    &::after {
      inset: 0px;
      box-shadow:
        inset 0 -0.5px 1px ${token('container.gradient.con-bg.generating.stop-3')},
        inset 0.5px -1.5px 6px ${convertColor('rgb(252, 228, 233)')},
        inset -7px -23px 9px -12px rgb(255 255 255 / 75%);
    }

    &[data-hovered] {
      &::before {
        opacity: 95%;
      }
    }

    &[data-disabled] {
      background-color: #F8F8F8;

      &::before {
        opacity: 0;
      }

      &::after {
        box-shadow:
          inset 0 -0.5px 1px rgb(0 0 0 / 10%),
          inset 0.5px -1.5px 6px rgb(0 0 0 / 5%),
          inset -7px -23px 9px -12px rgb(255 255 255 / 75%);
      }
    }
  }
`);

export function AIButton({size = 'M', brandColor, children, ...otherProps}: AIButtonProps) {
  let ref = useRef<HTMLButtonElement | null>(null);
  return (
    <Button
      {...otherProps}
      ref={ref}
      className={renderProps => bg + button({size, ...renderProps})}
      // eslint-disable-next-line react/react-compiler
      style={pressScale(ref, {'--brand': brandColor} as CSSProperties)}>
      <IconContext.Provider value={{styles: style({size: fontRelative(16), flexShrink: 0})}}>
        <AIIcon />
      </IconContext.Provider>
      {children && <span>{children}</span>}
    </Button>
  );
}

const AIIcon = createIcon(props => {
  return (
    <svg {...props} viewBox="0 0 22 22" fill="none">
      <path
        d="M10.9999 3.69117C12.6241 3.69117 12.8456 3.46969 12.8456 1.84553C12.8456 0.22137 12.6241 -0.000106812 10.9999 -0.000106812C9.37578 -0.000106812 9.15431 0.22137 9.15431 1.84553C9.15431 3.46969 9.37578 3.69117 10.9999 3.69117ZM1.84558 12.8455C3.46974 12.8455 3.69122 12.6241 3.69122 10.9999C3.69122 9.37573 3.46974 9.15425 1.84558 9.15425C0.22142 9.15425 -5.62668e-05 9.37573 -5.62668e-05 10.9999C-5.62668e-05 12.6241 0.22142 12.8455 1.84558 12.8455ZM20.1543 12.8455C21.7785 12.8455 21.9999 12.6241 21.9999 10.9999C21.9999 9.37573 21.7785 9.15425 20.1543 9.15425C18.5301 9.15425 18.3087 9.37573 18.3087 10.9999C18.3087 12.6241 18.5301 12.8455 20.1543 12.8455ZM10.9999 21.9999C12.6241 21.9999 12.8456 21.7784 12.8456 20.1543C12.8456 18.5301 12.6241 18.3086 10.9999 18.3086C9.37578 18.3086 9.15431 18.5301 9.15431 20.1543C9.15431 21.7784 9.37578 21.9999 10.9999 21.9999ZM6.12746 17.6934V16.8321C6.12746 16.1923 6.42276 15.9216 6.89032 15.9216H7.75162C9.25274 15.9216 9.44961 15.7247 9.44961 14.2236C9.44961 12.7225 9.25274 12.5256 7.75162 12.5256C6.2505 12.5256 6.05363 12.7225 6.05363 14.2236V15.0849C6.05363 15.7739 5.78294 15.8478 5.14312 15.8478H4.28182C2.65766 15.8478 2.43619 16.0692 2.43619 17.6934C2.43619 19.3176 2.65766 19.539 4.28182 19.539C5.90598 19.539 6.12746 19.3176 6.12746 17.6934ZM15.8478 4.33099V5.19229C15.8478 5.83211 15.5525 6.1028 15.085 6.1028H14.2237C12.7225 6.1028 12.5257 6.29967 12.5257 7.80079C12.5257 9.30191 12.7225 9.49877 14.2237 9.49877C15.7248 9.49877 15.9216 9.30191 15.9216 7.80079V6.93949C15.9216 6.25045 16.1923 6.17663 16.8322 6.17663H17.6935C19.3176 6.17663 19.5391 5.95515 19.5391 4.33099C19.5391 2.70683 19.3176 2.48535 17.6935 2.48535C16.0693 2.48535 15.8478 2.70683 15.8478 4.33099ZM6.12746 4.33099C6.12746 2.70683 5.90598 2.48535 4.28182 2.48535C2.65766 2.48535 2.43619 2.70683 2.43619 4.33099C2.43619 5.95515 2.65766 6.17663 4.28182 6.17663H5.14312C5.78294 6.17663 6.05363 6.25045 6.05363 6.93949V7.80079C6.05363 9.30191 6.2505 9.49877 7.75162 9.49877C9.25274 9.49877 9.44961 9.30191 9.44961 7.80079C9.44961 6.29967 9.25274 6.1028 7.75162 6.1028H6.89032C6.42276 6.1028 6.12746 5.83211 6.12746 5.19229V4.33099ZM15.8478 17.6934C15.8478 19.3176 16.0693 19.539 17.6935 19.539C19.3176 19.539 19.5391 19.3176 19.5391 17.6934C19.5391 16.0692 19.3176 15.8478 17.6935 15.8478H16.8322C16.1923 15.8478 15.9216 15.7739 15.9216 15.0849V14.2236C15.9216 12.7225 15.7248 12.5256 14.2237 12.5256C12.7225 12.5256 12.5257 12.7225 12.5257 14.2236C12.5257 15.7247 12.7225 15.9216 14.2237 15.9216H15.085C15.5525 15.9216 15.8478 16.1923 15.8478 16.8321V17.6934Z"
        fill="var(--iconPrimary)"
      />
    </svg>
  );
});
