
/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {ActionMenuContext} from './ActionMenu';
import {
  DialogTriggerProps as AriaDialogTriggerProps,
  ContextValue,
  DEFAULT_SLOT,
  OverlayTriggerStateContext,
  PopoverProps,
  Provider,
  useContextProps
} from 'react-aria-components';
import {ButtonContext} from './Button';
import {CheckboxContext} from './Checkbox';
import coachmarkCss from './CoachMark.module.css';
import {ContentContext, FooterContext, KeyboardContext, TextContext} from './Content';
import {
  createContext,
  ForwardedRef,
  forwardRef,
  ReactNode,
  RefObject,
  useContext,
  useRef
} from 'react';
import {DividerContext} from './Divider';
import {forwardRefType} from './types';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {ImageContext} from './Image';
import {ImageCoordinator} from './ImageCoordinator';
import {keyframes, raw} from '../style/style-macro' with {type: 'macro'};
import {SliderContext} from './Slider';
import {space, style} from '../style' with {type: 'macro'};
import {useId, useObjectRef, useOverlayPosition, useOverlayTrigger} from 'react-aria';
import {useLayoutEffect} from '@react-aria/utils';
import {useMenuTriggerState} from '@react-stately/menu';

export interface CoachMarkProps extends Omit<PopoverProps, 'children' | 'arrowBoundaryOffset' | 'isKeyboardDismissDisabled' | 'isNonModal'>, StyleProps {
  /** The children of the coach mark. */
  children: ReactNode,

  size?: 'S' | 'M' | 'L' | 'XL'
}

let popover = style({
  '--s2-container-bg': {
    type: 'backgroundColor',
    value: 'layer-2'
  },
  backgroundColor: '--s2-container-bg',
  borderRadius: 'lg',
  // Use box-shadow instead of filter when an arrow is not shown.
  // This fixes the shadow stacking problem with submenus.
  boxShadow: 'elevated',
  borderStyle: 'solid',
  borderWidth: 1,
  height: 'fit',
  padding: 0,
  margin: 0,
  borderColor: {
    default: 'gray-200',
    forcedColors: 'ButtonBorder'
  },
  width: 'fit',
  boxSizing: 'border-box',
  opacity: {
    default: 0,
    ':popover-open': 1
  },
  transform: {
    placement: {
      top: {
        default: 'translateY(4px)',
        ':popover-open': 'translateY(0)'
      },
      bottom: {
        default: 'translateY(-4px)',
        ':popover-open': 'translateY(0)'
      },
      left: {
        default: 'translateX(4px)',
        ':popover-open': 'translateX(0)'
      },
      right: {
        default: 'translateX(-4px)',
        ':popover-open': 'translateX(0)'
      }
    }
  },
  animationDuration: 200,
  animationDirection: {
    default: 'normal',
    ':popover-open': 'reverse'
  },
  animationTimingFunction: {
    default: 'in'
  },
  willChange: '[opacity, transform]',
  isolation: 'isolate'
}, getAllowedOverrides());

const image = style({
  width: 'full',
  aspectRatio: '[3/2]',
  objectFit: 'cover',
  userSelect: 'none',
  pointerEvents: 'none'
});

let title = style({
  font: 'title',
  fontSize: {
    size: {
      XS: 'title-xs',
      S: 'title-xs',
      M: 'title-sm',
      L: 'title',
      XL: 'title-lg'
    }
  },
  lineClamp: 3,
  gridArea: 'title'
});

let description = style({
  font: 'body',
  fontSize: {
    size: {
      XS: 'body-2xs',
      S: 'body-2xs',
      M: 'body-xs',
      L: 'body-sm',
      XL: 'body'
    }
  },
  lineClamp: 3,
  gridArea: 'description'
});

let keyboard = style({
  gridArea: 'keyboard',
  font: 'ui',
  fontWeight: 'light',
  color: 'gray-600',
  background: 'gray-25',
  unicodeBidi: 'plaintext'
});

let steps = style({
  font: 'detail',
  fontSize: 'detail-sm',
  alignSelf: 'center'
});

let content = style({
  display: 'grid',
  // By default, all elements are displayed in a stack.
  // If an action menu is present, place it next to the title.
  gridTemplateColumns: {
    default: ['1fr'],
    ':has([data-slot=menu])': ['minmax(0, 1fr)', 'auto']
  },
  gridTemplateAreas: {
    default: [
      'title keyboard',
      'description keyboard'
    ],
    ':has([data-slot=menu])': [
      'title menu',
      'keyboard keyboard',
      'description description'
    ]
  },
  columnGap: 4,
  flexGrow: 1,
  alignItems: 'baseline',
  alignContent: 'space-between',
  rowGap: {
    size: {
      XS: 4,
      S: 4,
      M: space(6),
      L: space(6),
      XL: 8
    }
  },
  paddingTop: {
    default: '--card-spacing',
    ':first-child': 0
  },
  paddingBottom: {
    default: '[calc(var(--card-spacing) * 1.5 / 2)]',
    ':last-child': 0
  }
});

let actionMenu = style({
  gridArea: 'menu',
  // Don't cause the row to expand, preserve gap between title and description text.
  // Would use -100% here but it doesn't work in Firefox.
  marginY: '[calc(-1 * self(height))]'
});

let footer = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'end',
  justifyContent: 'space-between',
  gap: 8,
  paddingTop: '[calc(var(--card-spacing) * 1.5 / 2)]'
});

const actionButtonSize = {
  XS: 'XS',
  S: 'XS',
  M: 'S',
  L: 'M',
  XL: 'L'
} as const;

export const CoachMarkContext = createContext<ContextValue<CoachMarkProps, HTMLDivElement>>({});

export const CoachMark = forwardRef((props: CoachMarkProps, ref: ForwardedRef<HTMLDivElement>) => {
  [props, ref] = useContextProps(props, ref, CoachMarkContext);
  let {UNSAFE_style} = props;
  let {size = 'M'} = props;
  let popoverRef = useObjectRef(ref);
  let state = useContext(OverlayTriggerStateContext);
  let {triggerRef} = useContext(InternalCoachMarkContext);
  let fallbackTriggerRef = useObjectRef(useRef<HTMLElement>(null));
  triggerRef = triggerRef ?? fallbackTriggerRef;

  let children = (
    <Provider
      values={[
        [ImageContext, {alt: '', styles: image}],
        [TextContext, {
          slots: {
            [DEFAULT_SLOT]: {},
            title: {styles: title({size})},
            description: {styles: description({size})},
            steps: {styles: steps}
          }
        }],
        [KeyboardContext, {styles: keyboard}],
        [ContentContext, {styles: content({size})}],
        [DividerContext, {size: 'S'}],
        [FooterContext, {styles: footer}],
        [ActionMenuContext, {
          isQuiet: true,
          size: actionButtonSize[size],
          // @ts-ignore
          'data-slot': 'menu',
          styles: actionMenu
        }]
      ]}>
      <ImageCoordinator>
        {props.children}
      </ImageCoordinator>
    </Provider>
  );

  let {overlayProps, placement} = useOverlayPosition({
    targetRef: triggerRef,
    overlayRef: popoverRef,
    placement: props.placement,
    offset: 16,
    crossOffset: -18 // made up
  });

  let prevOpen = useRef(false);
  useLayoutEffect(() => {
    if (state?.isOpen && !prevOpen.current) {
      popoverRef.current?.showPopover();
    } else if (!state?.isOpen && prevOpen.current) {
      popoverRef.current?.hidePopover();
    }
    prevOpen.current = state?.isOpen ?? false;
  }, [state?.isOpen]);

  return (
    <div
      popover="manual"
      ref={popoverRef}
      data-placement={placement}
      style={{
        ...UNSAFE_style,
        ...overlayProps.style,
        // Override default z-index from useOverlayPosition. We use isolation: isolate instead.
        zIndex: undefined
      }}
      className={coachmarkCss['coach-mark'] + popover({size, placement})}>
      {/* }// Reset OverlayTriggerStateContext so the buttons inside the dialog don't retain their hover state. */}
      <OverlayTriggerStateContext.Provider value={null}>
        {children}
      </OverlayTriggerStateContext.Provider>
    </div>
  );
});


const InternalCoachMarkContext = createContext<{triggerRef?: RefObject<HTMLElement | null>}>({});

export interface CoachMarkTriggerProps extends AriaDialogTriggerProps {
}

/**
 * DialogTrigger serves as a wrapper around a Dialog and its associated trigger, linking the Dialog's
 * open state with the trigger's press state. Additionally, it allows you to customize the type and
 * positioning of the Dialog.
 */
export function CoachMarkTrigger(props: CoachMarkTriggerProps): ReactNode {
  let triggerRef = useRef<HTMLDivElement>(null);
  // Use useMenuTriggerState instead of useOverlayTriggerState in case a menu is embedded in the dialog.
  // This is needed to handle submenus.
  let state = useMenuTriggerState(props);

  let {triggerProps, overlayProps} = useOverlayTrigger({type: 'dialog'}, state, triggerRef);

  // Label dialog by the trigger as a fallback if there is no title slot.
  // This is done in RAC instead of hooks because otherwise we cannot distinguish
  // between context and props. Normally aria-labelledby overrides the title
  // but when sent by context we want the title to win.
  triggerProps.id = useId();
  overlayProps['aria-labelledby'] = triggerProps.id;
  delete triggerProps.onPress;

  return (
    <Provider
      values={[
        [OverlayTriggerStateContext, state],
        [InternalCoachMarkContext, {triggerRef}] // valid to pass triggerRef?
      ]}>
      <CoachMarkIndicator ref={triggerRef} isActive={state.isOpen}>
        {props.children}
      </CoachMarkIndicator>
    </Provider>
  );
}


// TODO better way to calculate 4px transform? (not 4%?)
const pulseAnimation = keyframes(`
  0% {
    box-shadow: 0 0 0 4px rgba(20, 115, 230, 0.40);
    transform: scale(calc(100%));
  }
  50% {
     box-shadow: 0 0 0 10px rgba(20, 115, 230, 0.20);
     transform: scale(104%);
  }
  100% {
     box-shadow: 0 0 0 4px rgba(20, 115, 230, 0.40);
     transform: scale(calc(100%));
  }
`);


const indicator = style({
  animationDuration: 1000,
  animationIterationCount: 'infinite',
  animationFillMode: 'forwards',
  animationTimingFunction: 'in-out',
  position: 'relative',
  '--activeElement': {
    type: 'outlineColor',
    value: {
      default: 'focus-ring',
      forcedColors: 'Highlight'
    }
  },
  '--borderOffset': {
    type: 'top',
    value: {
      default: '[-2px]',
      ':has([data-trigger=checkbox])': '[-6px]',
      ':has([data-trigger=slider])': '[-8px]',
      offset: {
        M: '[-6px]',
        L: '[-8px]'
      }
    }
  },
  '--ringRadius': {
    type: 'top', // is there a generic for pixel values?
    value: {
      default: '[10px]',
      ':has([data-trigger=button])': '[18px]',
      ':has([data-trigger=checkbox])': '[6px]'
    }
  }
});

const pulse = raw(`&:before { content: ""; display: inline-block; position: absolute; top: var(--borderOffset); bottom:  var(--borderOffset); left: var(--borderOffset); right: var(--borderOffset); border-radius: var(--ringRadius); outline-style: solid; outline-color: var(--activeElement); outline-width: 4px; animation-duration: 2s; animation-iteration-count: infinite; animation-timing-function: ease-in-out; animation-fill-mode: forwards; animation-name: ${pulseAnimation}}`);

interface CoachMarkIndicatorProps {
  children: ReactNode,
  isActive?: boolean
}
export const CoachMarkIndicator = /*#__PURE__*/ (forwardRef as forwardRefType)(function CoachMarkIndicator(props: CoachMarkIndicatorProps, ref: ForwardedRef<HTMLDivElement>) {
  const {children, isActive} = props;
  let objRef = useObjectRef(ref);

  //   // This is very silly... better ways? can't use display: contents because it breaks positioning
  // // this will break if there is a resize or different styles
  useLayoutEffect(() => {
    if (objRef.current) {
      let styles = getComputedStyle(objRef.current.children[0]);
      let childDisplay = styles.getPropertyValue('display');
      let childMaxWidth = styles.getPropertyValue('max-width');
      let childMaxHeight = styles.getPropertyValue('max-height');
      let childWidth = styles.getPropertyValue('width');
      let childHeight = styles.getPropertyValue('height');
      let childMinWidth = styles.getPropertyValue('min-width');
      let childMinHeight = styles.getPropertyValue('min-height');
      objRef.current.style.display = childDisplay;
      objRef.current.style.maxWidth = childMaxWidth;
      objRef.current.style.maxHeight = childMaxHeight;
      objRef.current.style.width = childWidth;
      objRef.current.style.height = childHeight;
      objRef.current.style.minWidth = childMinWidth;
      objRef.current.style.minHeight = childMinHeight;
    }
  }, [children]);

  return (
    <div ref={objRef} className={indicator({isActive}) + ' ' + (isActive ? pulse : '')}>
      <Provider
        values={[
          [ButtonContext, {
            // @ts-ignore
            'data-trigger': 'button'
          }],
          [CheckboxContext, {
            // @ts-ignore
            'data-trigger': 'checkbox'
          }],
          [SliderContext, {
            // @ts-ignore
            'data-trigger': 'slider'
          }]
        ]}>
        {children}
      </Provider>
    </div>
  );
});
