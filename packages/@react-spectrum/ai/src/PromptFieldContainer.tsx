import {
  brand,
  defaultBrand,
  defineProperties,
  outerBorderStops,
  stops,
  token
} from './tokens.macro' with {type: 'macro'};
import {color, css, style, StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {getEventTarget} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {Group, GroupProps} from 'react-aria-components/Group';
import {isFocusable} from 'react-aria/private/utils/isFocusable';
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';

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
    inherits: false;
  }

  @property --bg-stop-1 {
    syntax: '<color>';
    initial-value: #0000;
    inherits: false;
  }

  @property --bg-stop-2 {
    syntax: '<color>';
    initial-value: #0000;
    inherits: false;  
  }

  @property --bg-stop-3 {
    syntax: '<color>';
    initial-value: #0000;
    inherits: false;
  }

  @property --bg-stop-4 {
    syntax: '<color>';
    initial-value: #0000;
    inherits: false;
  }
`);

const containerBackground = css(`
  transition: --con-hue-opacity ${STATE_TRANSITION}, --bg-stop-1 ${STATE_TRANSITION}, --bg-stop-2 ${STATE_TRANSITION}, --bg-stop-3 ${STATE_TRANSITION}, --bg-stop-4 ${STATE_TRANSITION}, box-shadow ${STATE_TRANSITION};
  
  background:
    linear-gradient(
      to bottom,
      light-dark(rgb(255 255 255 / 75%), rgb(0 0 0 / 40%)) 0% 37%,
      light-dark(rgb(255 255 255 / 15%), rgb(0 0 0 / 12%)) 83% 100%
    ),
    radial-gradient(
      50% 50% at -20% 100%,
      rgb(from ${token('container.gradient.con-hue.generating.stop-3')} r g b / var(--con-hue-opacity)),
      transparent
    ),
    radial-gradient(
      70% 60% at 5% 80%,
      rgb(from ${token('container.gradient.con-hue.generating.stop-2')} r g b / var(--con-hue-opacity)),
      transparent
    ),
    radial-gradient(
      70% 50% at 40% 80%,
      rgb(from ${token('container.gradient.con-hue.generating.stop-1')} r g b / var(--con-hue-opacity)),
      transparent
    ),
    radial-gradient(
      circle at right bottom,
      var(--bg-stop-1) 0%,
      var(--bg-stop-2) 35%,
      var(--bg-stop-3) 82%,
      var(--bg-stop-4) 100%
    );

  --border-color: ${token(`container.border.default`)};
  --inset-shadow-color: ${color('transparent-white-50')};
  --drop-shadow-color: light-dark(${brand(0.5826, 0.2265, -0.4, 0.05)}, ${brand(0.6617, 0.2508, -0.5, 0.05)});

  box-shadow:
    inset 0 0 0 1px var(--border-color),
    inset 0 6px 15px 0 var(--inset-shadow-color),
    inset 0 0 0 0 transparent, /* placeholder for generating state so transition is smooth */
    inset 0 -5px 21.6px 0 ${color('transparent-white-50')},
    inset 0 24px 32px 0 ${color('transparent-white-50')},
    0 -3px 10px 1px var(--drop-shadow-color);

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

      &[data-hovered] {
        ${stops('idle', 'hover', 'subtle')}
        --border-color: ${token(`container.border.default`)};
      }
    }

    &[data-focus-within][data-focus-within] {
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
      inset 0 0 0 1px var(--border-color),
      inset 0 6px 15px 0 var(--inset-shadow-color),
      inset 0 -32px 100px -50px ${token('container.color.inner-shadow.generating')},
      inset 0 -5px 21.6px 0 ${color('transparent-white-50')},
      inset 0 24px 32px 0 ${color('transparent-white-50')},
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

const outerBorder = css(`
  --outer-drop-shadow-color: ${token('outer-border.color.drop-shadow.ob-border.default')};

  padding: 6px;
  border-radius: calc(24px + 6px);
  transition: --bg-stop-1 ${STATE_TRANSITION}, --bg-stop-2 ${STATE_TRANSITION}, --bg-stop-3 ${STATE_TRANSITION}, box-shadow ${STATE_TRANSITION};
  background: linear-gradient(
    to right,
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

    &[data-state=idle][data-focus-within] {
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

  &[data-state=idle][data-focus-within] {
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
  styles?: StyleString;
  inputRef: React.RefObject<HTMLDivElement | null>;
}

export function PromptFieldContainer(props: PropFieldContainerProps) {
  let {variant, isGenerating, styles, inputRef, ...otherProps} = props;
  return (
    <Group
      {...otherProps}
      role="group"
      data-variant={variant}
      data-state={isGenerating ? 'generating' : 'idle'}
      className={outerBorder}
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
      {({isHovered, isFocusWithin}) => (
        <div
          data-hovered={isHovered || undefined}
          data-focus-within={isFocusWithin || undefined}
          data-variant={variant}
          data-state={isGenerating ? 'generating' : 'idle'}
          className={
            (props.className || '') +
            ' ' +
            containerBackground +
            mergeStyles(
              style({
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                padding: 16,
                cursor: 'text',
                borderRadius: '[24px]'
              }),
              styles
            )
          }>
          {props.children}
        </div>
      )}
    </Group>
  );
}
