import {color, css, style, StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {defineProperties, stops, token} from './tokens.macro' with {type: 'macro'};
import {getEventTarget} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {Group, GroupProps} from 'react-aria-components/Group';
import {isFocusable} from 'react-aria/private/utils/isFocusable';
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';

const STATE_TRANSITION = '700ms cubic-bezier(0.32, 0.72, 0, 1)';

defineProperties(`
  @property --con-hue-opacity {
    syntax: '<percentage>';
    initial-value: 0%;
    inherits: false;
  }

  @property --con-bg-stop-1 {
    syntax: '<color>';
    initial-value: #0000;
    inherits: false;
  }

  @property --con-bg-stop-2 {
    syntax: '<color>';
    initial-value: #0000;
    inherits: false;  
  }

  @property --con-bg-stop-3 {
    syntax: '<color>';
    initial-value: #0000;
    inherits: false;
  }

  @property --con-bg-stop-4 {
    syntax: '<color>';
    initial-value: #0000;
    inherits: false;
  }
`);

const containerBackground = css(`
  transition: --con-hue-opacity ${STATE_TRANSITION}, --con-bg-stop-1 ${STATE_TRANSITION}, --con-bg-stop-2 ${STATE_TRANSITION}, --con-bg-stop-3 ${STATE_TRANSITION}, --con-bg-stop-4 ${STATE_TRANSITION}, box-shadow ${STATE_TRANSITION};
  
  background:
    linear-gradient(
      to bottom,
      light-dark(rgb(255 255 255 / 40%), rgb(0 0 0 / 40%)), 37%,
      light-dark(rgb(255 255 255 / 12%), rgb(0 0 0 / 12%)) 83%
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
      var(--con-bg-stop-1) 0%,
      var(--con-bg-stop-2) 35%,
      var(--con-bg-stop-3) 82%,
      var(--con-bg-stop-4) 100%
    );

  --border-color: ${token(`container.border.default`)};
  --inset-shadow-color: ${color('transparent-white-50')};
  --drop-shadow-color: ${color('fuchsia-900/5')};
  --outer-border-color: ${token('outer-border.gradient.ob-border.stop-1')};
  
  box-shadow:
    inset 0 0 0 1px var(--border-color),
    inset 0 6px 15px 0 var(--inset-shadow-color),
    inset 0 -5px 21.6px 0 ${color('transparent-white-50')},
    inset 0 24px 32px 0 ${color('transparent-white-50')},
    0 -3px 10px 1px var(--drop-shadow-color),
    0 0 0 6px var(--outer-border-color),
    0 6px 16px -6px var(--outer-border-hue);

  &[data-variant=balanced] {
    --outer-border-hue: light-dark(
      rgb(from ${token('outer-border.gradient.ob-hue.stop-1')} r g b / ${token('outer-border.opacity.ob-hue-balanced.light')}%),
      rgb(from ${token('outer-border.gradient.ob-hue.stop-1')} r g b / ${token('outer-border.opacity.ob-hue-balanced.dark')}%)
    );
  }
  
  &[data-variant=prominent] {
    --outer-border-hue: rgb(from ${token('outer-border.gradient.ob-hue.stop-1')} r g b / ${token('outer-border.opacity.ob-hue-prominent')}%);
  }

  &[data-variant=subtle] {
    --outer-border-hue: light-dark(
      rgb(from ${token('outer-border.gradient.ob-hue.stop-1')} r g b / ${token('outer-border.opacity.ob-hue-subtle.light')}%),
      rgb(from ${token('outer-border.gradient.ob-hue.stop-1')} r g b / ${token('outer-border.opacity.ob-hue-subtle.dark')}%)
    );
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
      --con-bg-stop-1: light-dark(white, ${color('gray-75')});
      --con-bg-stop-2: light-dark(white, ${color('gray-75')});
      --con-bg-stop-3: light-dark(white, ${color('gray-75')});
      --con-bg-stop-4: light-dark(white, ${color('gray-75')});

      &[data-hovered] {
        ${stops('idle', 'hover', 'subtle')}
      }
    }

    &[data-focus-within][data-focus-within] {
      --con-hue-opacity: 0%;
      --con-bg-stop-1: light-dark(white, ${color('gray-75')});
      --con-bg-stop-2: light-dark(white, ${color('gray-75')});
      --con-bg-stop-3: light-dark(white, ${color('gray-75')});
      --con-bg-stop-4: light-dark(white, ${color('gray-75')});

      --border-color: ${token(`container.border.focus`)};
      --inset-shadow-color: transparent;
      --drop-shadow-color: transparent;
      --outer-border-color: ${token('outer-border.gradient.ob-border.focus.stop-1')};
      --outer-border-hue: transparent;
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
      0 6px 16px -6px var(--outer-border-hue),
      0 6px 83px rgb(from ${token('outer-border.gradient.ob-spread-shadow.generating.stop-3')} r g b / ${token('outer-border.opacity.spread-bg-balanced')}%),
      0 0 0 6px var(--outer-border-color);

    &[data-variant=balanced] {
      ${stops('generating', 'default', 'balanced')}

      &[data-hovered] {
        ${stops('generating', 'hover', 'balanced')}
      }
    }

    &[data-variant=prominent] {
      ${stops('generating', 'default', 'prominent')}

      &[data-hovered] {
        ${stops('generating', 'hover', 'prominent')}
      }
    }

    &[data-variant=subtle] {
      ${stops('generating', 'default', 'subtle')}

      &[data-hovered] {
        ${stops('generating', 'hover', 'subtle')}
      }
    }
  }
`);

interface PropFieldContainerProps extends GroupProps {
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
      }
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
      {props.children}
    </Group>
  );
}
