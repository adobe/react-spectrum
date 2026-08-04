import {
  brand,
  defaultBrand,
  defineProperties,
  keyframes,
  outerBorderStops,
  stops,
  token
} from './tokens.macro' with {type: 'macro'};
import {color, css, style, StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {getEventTarget} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {Group, GroupProps} from 'react-aria-components/Group';
import {isFocusable} from 'react-aria/private/utils/isFocusable';
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';
import {useState} from 'react';

const STATE_TRANSITION = '700ms cubic-bezier(0.32, 0.72, 0, 1)';

/* The brand color drives the hue of the entire component. Override --brand on
   the PromptField (or any ancestor) to retheme it — all gradients, shadows, and
   borders are derived from this hue via OKLCH relative colors in tokens.macro.
   The default is the fuchsia primary, rgb(236, 105, 255). */
defineProperties(`
  @property --brand {
    syntax: '<color>';
    initial-value: ${defaultBrand()};
    inherits: true;
  }

  @property --con-hue-opacity {
    syntax: '<percentage>';
    initial-value: 0%;
    inherits: true;
  }

  @property --bg-stop-1 {
    syntax: '<color>';
    initial-value: #0000;
    inherits: true;
  }

  @property --bg-stop-2 {
    syntax: '<color>';
    initial-value: #0000;
    inherits: true;  
  }

  @property --bg-stop-3 {
    syntax: '<color>';
    initial-value: #0000;
    inherits: true;
  }

  @property --bg-stop-4 {
    syntax: '<color>';
    initial-value: #0000;
    inherits: true;
  }
`);

const containerBackground = css(`
  transition: --con-hue-opacity ${STATE_TRANSITION}, --bg-stop-1 ${STATE_TRANSITION}, --bg-stop-2 ${STATE_TRANSITION}, --bg-stop-3 ${STATE_TRANSITION}, --bg-stop-4 ${STATE_TRANSITION}, box-shadow ${STATE_TRANSITION};

  background:
    radial-gradient(
      circle at right bottom in oklch,
      var(--bg-stop-1) 0%,
      var(--bg-stop-2) 35%,
      var(--bg-stop-3) 82%,
      var(--bg-stop-4) 100%
    );

  --border-color: ${token(`container.border.default`)};
  --inset-shadow-color: ${color('transparent-white-50')};
  --drop-shadow-color: light-dark(${brand(0.5826, 0.2265, -0.4, 0.05)}, ${brand(0.6617, 0.2508, -0.5, 0.05)});
  --prominent-outer-glow: ;
  --prominent-inset-glow: ;

  /* Only the non-inset (outward) shadows live here: the inset shadows are painted
     on top of the background layers by a separate element (insetShadow below), since
     this element's overflow:clip must stay on this box to clip the outward shadows. */
  box-shadow:
    var(--prominent-outer-glow)
    0 -3px 10px 1px var(--drop-shadow-color);

  &[data-variant=prominent] {
    /* trailing comma is intentional so it can be interpolated above */
    --prominent-outer-glow: 0 20px 20px -24px ${token('outline-glow.gradient.generating.stop-3')},;
    --prominent-inset-glow: inset 0 -20px 20px -24px ${token('outline-glow.gradient.generating.stop-3')},;
    &[data-focused] {
      --prominent-outer-glow: 0 20px 20px -24px transparent,;
      --prominent-inset-glow: inset 0 -20px 20px -24px transparent,;
    }
  }

  &[data-state=idle] {
    &[data-variant=balanced] {
      ${stops('idle', 'default', 'balanced')}

      &[data-hovered] {
        ${stops('idle', 'hover', 'balanced')}
      }
    }

    &[data-variant=prominent] {
      ${stops('idle', 'default', 'prominent')}

      &[data-hovered] {
        ${stops('idle', 'hover', 'prominent')}
      }
    }

    &[data-variant=subtle] {
      --con-hue-opacity: 0%;
      --bg-stop-1: light-dark(white, ${color('gray-75')});
      --bg-stop-2: light-dark(white, ${color('gray-75')});
      --bg-stop-3: light-dark(white, ${color('gray-75')});
      --bg-stop-4: light-dark(white, ${color('gray-75')});
      --border-color: ${token(`container.border.focus`)};
      --drop-shadow-color: transparent;

      &[data-hovered] {
        ${stops('idle', 'hover', 'subtle')}
        --border-color: ${token(`container.border.default`)};
        --drop-shadow-color: light-dark(${brand(0.5826, 0.2265, -0.4, 0.05)}, ${brand(0.6617, 0.2508, -0.5, 0.05)});
      }
    }

    &[data-focused][data-focused] {
      --con-hue-opacity: 0%;
      --bg-stop-1: light-dark(white, ${color('gray-75')});
      --bg-stop-2: light-dark(white, ${color('gray-75')});
      --bg-stop-3: light-dark(white, ${color('gray-75')});
      --bg-stop-4: light-dark(white, ${color('gray-75')});
      --border-color: ${token(`container.border.focus`)};
      --inset-shadow-color: transparent;
      --drop-shadow-color: transparent;
    }
  }

  &[data-state=generating] {
    box-shadow:
      var(--prominent-outer-glow)
      0 -3px 10px 1px var(--drop-shadow-color),
      0 6px 83px rgb(from ${token('outer-border.gradient.ob-spread-shadow.generating.stop-3')} r g b / var(--spread-shadow-opacity));

    &[data-variant=balanced] {
      --spread-shadow-opacity: ${token('outer-border.opacity.spread-bg-balanced')}%;
      ${stops('generating', 'default', 'balanced')}

      &[data-hovered] {
        ${stops('generating', 'hover', 'balanced')}
      }
    }

    &[data-variant=prominent] {
      --spread-shadow-opacity: ${token('outer-border.opacity.spread-bg-prominent')}%;
      ${stops('generating', 'default', 'prominent')}

      &[data-hovered] {
        ${stops('generating', 'hover', 'prominent')}
      }
    }

    &[data-variant=subtle] {
      --spread-shadow-opacity: ${token('outer-border.opacity.spread-bg-subtle')}%;
      ${stops('generating', 'default', 'subtle')}

      &[data-hovered] {
        ${stops('generating', 'hover', 'subtle')}
      }
    }
  }
`);

const insetShadow = css(`
  pointer-events: none;
  position: absolute;
  inset: 0;
  border-radius: inherit;
  transition: box-shadow ${STATE_TRANSITION};

  box-shadow:
    var(--prominent-inset-glow)
    inset 0 0 0 1px var(--border-color),
    inset 0 6px 15px 0 var(--inset-shadow-color),
    inset 0 0 0 0 transparent, /* placeholder for generating state so transition is smooth */
    inset 0 -5px 21.6px 0 ${color('transparent-white-50')},
    inset 0 24px 32px 0 ${color('transparent-white-50')};

  &[data-state=generating] {
    box-shadow:
      var(--prominent-inset-glow)
      inset 0 0 0 1px var(--border-color),
      inset 0 6px 15px 0 var(--inset-shadow-color),
      inset 0 -32px 100px -50px ${token('container.color.inner-shadow.generating')},
      inset 0 -5px 21.6px 0 ${color('transparent-white-50')},
      inset 0 24px 32px 0 ${color('transparent-white-50')};
  }
`);

const containerHue = css(`
  background:
    radial-gradient(
      50% 50% at -20% 100% in oklch,
      oklch(from ${token('container.gradient.con-hue.generating.stop-3')} l c h / var(--con-hue-opacity)),
      transparent
    ),
    radial-gradient(
      70% 60% at 5% 80% in oklch,
      oklch(from ${token('container.gradient.con-hue.generating.stop-2')} l c h / var(--con-hue-opacity)),
      transparent
    ),
    radial-gradient(
      70% 50% at 40% 80% in oklch,
      oklch(from ${token('container.gradient.con-hue.generating.stop-1')} l c h / var(--con-hue-opacity)),
      transparent
    );

  --rotation: 7deg;
  --translation: 44px;
  @supports (rotate: atan(1px / 1cqw)) {
    --rotation: atan(30px / 50cqw);
    --translation: clamp(44px, 44px * (800px / 100cqw), 72px);
  }
`);

const overlay = css(`
  background: 
    linear-gradient(
      to bottom in oklch,
      light-dark(oklch(from white l c h / 75%), oklch(from black l c h / 40%)) 0% 37%,
      light-dark(oklch(from white l c h / 15%), oklch(from black l c h / 12%)) 83% 100%
    );
`);

/* The rotation and translation animations use the computed variables above, which adjust depending
   on the container width (when division with units is supported - everywhere except Firefox).
   The rotation is calculated based on the desired "lift" amount, which is (width / 2) * sin(angle).
   The translation is based on a ratio with the full size reference width (800px). Both translation
   and rotation increase at smaller widths to make the motion more visible in that space. */
const rotation = keyframes(`
  0% { rotate: 0rad }
  25% { rotate: var(--rotation) }
  50% { rotate: 0rad }
  75% { rotate: calc(-1 * var(--rotation)) }
  100% { rotate: 0rad }
`);

const translation = keyframes(`
  0% {
    animation-timing-function: ease-in-out;
    translate: 0px 0px;
  }

  50% {
    translate: 0px var(--translation);
  }

  100% {
    translate: 0px 0px;
  }
`);

const scale = keyframes(`
  0% {
    scale: 1 1;
  }

  50% {
    scale: 3 1;
  }

  100% {
    scale: 1 1;
  }
`);

const outerBorder = css(`
  --outer-drop-shadow-color: ${token('outer-border.color.drop-shadow.ob-border.default')};

  padding: 6px;
  border-radius: calc(24px + 6px);
  transition: --bg-stop-1 ${STATE_TRANSITION}, --bg-stop-2 ${STATE_TRANSITION}, --bg-stop-3 ${STATE_TRANSITION}, box-shadow ${STATE_TRANSITION};
  background: linear-gradient(
    to right in oklch,
    var(--bg-stop-1) 0%,
    var(--bg-stop-2) 37%,
    var(--bg-stop-3) 77%
  );

  box-shadow:
    0 2px 4px var(--outer-drop-shadow-color),
    0 6px 16px -10px var(--outer-border-hue);

  &[data-variant=balanced] {
    ${outerBorderStops('balanced')}
  }
  
  &[data-variant=prominent] {
    ${outerBorderStops('prominent')}

    &[data-state=idle][data-focused] {
      --bg-stop-1: ${token('outer-border.gradient.ob-border.stop-1')};
      --bg-stop-2: ${token('outer-border.gradient.ob-border.stop-1')};
      --bg-stop-3: ${token('outer-border.gradient.ob-border.stop-1')};
    }
  }

  &[data-variant=subtle] {
    --outer-drop-shadow-color: ${token('outer-border.color.drop-shadow.ob-border.subtle')};
    --outer-border-hue: transparent;
    --bg-stop-1: ${token('outer-border.gradient.ob-border.stop-1')};
    --bg-stop-2: ${token('outer-border.gradient.ob-border.stop-1')};
    --bg-stop-3: ${token('outer-border.gradient.ob-border.stop-1')};

    &[data-hovered] {
      --outer-drop-shadow-color: ${token('outer-border.color.drop-shadow.ob-border.default')};
      ${outerBorderStops('subtle')}
    }
  }

  &[data-state=idle][data-focused] {
    --bg-stop-1: ${token('outer-border.gradient.ob-border.stop-1')};
    --bg-stop-2: ${token('outer-border.gradient.ob-border.stop-1')};
    --bg-stop-3: ${token('outer-border.gradient.ob-border.stop-1')};
    --outer-border-hue: transparent;
    --outer-drop-shadow-color: ${token('outer-border.color.drop-shadow.ob-border.focus')};
  }
`);

interface PropFieldContainerProps extends Omit<GroupProps, 'children'> {
  children: React.ReactNode;
  variant: 'balanced' | 'prominent' | 'subtle';
  isGenerating: boolean;
  isDropTarget: boolean;
  brandColor?: string;
  styles?: StyleString;
  inputRef: React.RefObject<HTMLDivElement | null>;
}

export function PromptFieldContainer(props: PropFieldContainerProps) {
  let {variant, isGenerating, isDropTarget, styles, inputRef, brandColor, ...otherProps} = props;
  let [isFocused, setFocused] = useState(false);

  return (
    <Group
      {...otherProps}
      role="group"
      data-variant={variant}
      data-state={isGenerating ? 'generating' : 'idle'}
      data-focused={isFocused || undefined}
      className={
        outerBorder +
        // outline for WHCM
        style({
          outlineStyle: 'solid',
          outlineColor: 'transparent',
          outlineWidth: 1,
          containerType: 'inline-size'
        })
      }
      style={{
        ...props.style,
        // @ts-ignore
        '--brand': brandColor
      }}
      onFocus={e => {
        if (e.isTrusted) {
          setFocused(true);
        }
      }}
      onBlur={e => {
        if (e.isTrusted) {
          setFocused(false);
        }
      }}
      onPointerDown={e => {
        // If not clicking on something focusable within the prompt field, focus the input.
        let target = getEventTarget(e) as Element | null;
        while (target && target !== e.currentTarget && !isFocusable(target)) {
          target = target.parentElement;
        }

        if (target === e.currentTarget) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }}>
      {({isHovered}) => (
        <div
          data-hovered={isHovered || undefined}
          data-focused={isFocused || undefined}
          data-variant={variant}
          data-state={isGenerating ? 'generating' : 'idle'}
          className={
            ' ' +
            containerBackground +
            mergeStyles(
              style({
                borderRadius: '[24px]',
                position: 'relative',
                overflow: 'clip'
              }),
              styles
            )
          }>
          <div
            className={
              containerHue +
              style({
                pointerEvents: 'none',
                position: 'absolute',
                inset: '[-44px]',
                animation: {
                  default: 'none',
                  isGenerating: `${translation}, ${rotation}, ${scale}`,
                  '@media (prefers-reduced-motion: reduce)': 'none'
                },
                animationDuration: '2s, 3s, 4s',
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite'
              })({isGenerating})
            }
          />
          <div
            className={
              overlay +
              style({
                pointerEvents: 'none',
                position: 'absolute',
                inset: 0
              })
            }
          />
          <div data-state={isGenerating ? 'generating' : 'idle'} className={insetShadow} />
          {isDropTarget && (
            <div
              className={style({
                pointerEvents: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                borderRadius: 'inherit',
                backgroundColor: 'blue-800/10',
                borderStyle: 'solid',
                borderWidth: 2,
                borderColor: 'blue-800'
              })}
            />
          )}
          <div
            className={
              style({
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                padding: 16,
                cursor: 'text'
              }) + (props.className || '')
            }>
            {props.children}
          </div>
        </div>
      )}
    </Group>
  );
}
