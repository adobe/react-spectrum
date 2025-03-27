
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
  Popover as AriaPopover,
  ContextValue,
  DEFAULT_SLOT,
  DialogContext,
  OverlayTriggerStateContext,
  PopoverContext,
  PopoverProps,
  Provider,
  RenderProps,
  RootMenuTriggerStateContext,
  SlotProps,
  useContextProps,
  useRenderProps
} from 'react-aria-components';
import {ButtonContext} from './Button';
import {Card} from './Card';
import {CheckboxContext} from './Checkbox';
import {colorScheme, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {ColorSchemeContext} from './Provider';
import {ContentContext, FooterContext, KeyboardContext, TextContext} from './Content';
import {createContext, ForwardedRef, forwardRef, ReactNode, RefObject, useContext, useEffect, useRef, useState} from 'react';
import {DividerContext} from './Divider';
import {forwardRefType} from './types';
import {ImageContext} from './Image';
import {ImageCoordinator} from './ImageCoordinator';
import {keyframes, raw} from '../style/style-macro' with {type: 'macro'};
import {mergeStyles} from '../style/runtime';
import {focusSafely, PressResponder} from '@react-aria/interactions';
import {SliderContext} from './Slider';
import {space, style} from '../style' with {type: 'macro'};
import {useId, useLocale, useOverlay, useOverlayPosition, useOverlayTrigger, usePreventScroll} from 'react-aria';
import {useMenuTriggerState} from '@react-stately/menu';
import {filterDOMProps, getEventTarget, getOwnerDocument, mergeProps, useEnterAnimation, useExitAnimation, useGlobalListeners, useLayoutEffect, useObjectRef} from '@react-aria/utils';
import { createFocusManager } from '@react-aria/focus';
import { ariaHideOutside, AriaPopoverProps, DismissButton, Overlay, PlacementAxis, PopoverAria } from '@react-aria/overlays';
import { useIsHidden } from '@react-aria/collections';
import { OverlayTriggerState, useOverlayTriggerState } from 'react-stately';
import { OverlayArrowContext } from 'react-aria-components/src/OverlayArrow';

export interface CoachMarkTriggerProps extends AriaDialogTriggerProps {
}

/**
 * DialogTrigger serves as a wrapper around a Dialog and its associated trigger, linking the Dialog's
 * open state with the trigger's press state. Additionally, it allows you to customize the type and
 * positioning of the Dialog.
 */
export function CoachMarkTrigger(props: CoachMarkTriggerProps): ReactNode {
  let triggerRef = useRef<HTMLDivElement>(null);
  let popoverRef = useRef(null);
  // Use useMenuTriggerState instead of useOverlayTriggerState in case a menu is embedded in the dialog.
  // This is needed to handle submenus. TODO: Do we need this??? (RS)
  let state = useMenuTriggerState(props);

  let {triggerProps, overlayProps} = useOverlayTrigger({type: 'dialog'}, state, triggerRef);

  // Label dialog by the trigger as a fallback if there is no title slot.
  // This is done in RAC instead of hooks because otherwise we cannot distinguish
  // between context and props. Normally aria-labelledby overrides the title
  // but when sent by context we want the title to win.
  triggerProps.id = useId();
  overlayProps['aria-labelledby'] = triggerProps.id;

  // Focus is not guaranteed to be inside a Coachmark, so handle global keydown Escape for it.
  // Defer to the coachmark though to handle Esc if the event is inside it.
  // TODO: What to do if the event came from a Menu dropdown (for example) inside the Coachmark? (RS)
  // let {addGlobalListener, removeAllGlobalListeners} = useGlobalListeners();
  // let {close} = state;
  // useEffect(() => {
  //   let onKeyDown = (e) => {
  //     if (e.key === 'Escape' && popoverRef.current && !popoverRef.current?.contains(getEventTarget(e))) {
  //       close();
  //     }
  //   };
  //   addGlobalListener(getOwnerDocument(triggerRef.current), 'keydown', onKeyDown, true);
  //   return () => {
  //     removeAllGlobalListeners();
  //   };
  // }, [close, addGlobalListener, removeAllGlobalListeners]);

  // When focus moves to the trigger, send the focus into the coachmark
  // TODO: when focus moves to the trigger from the coachmark, let it be... not sure how to handle that
  useEffect(() => {
    if (triggerRef.current) {
      let trigger = triggerRef.current;
      let onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab' && !e.shiftKey && popoverRef.current) {
          e.preventDefault();
          e.stopPropagation();
          let manager = createFocusManager(popoverRef, {tabbable: true});
          manager.focusFirst();
        }
      };
      let onFocusWithin = (e) => {
        // if the relatedTarget is from an element after the trigger and from outside the coachmark, then focus the last element in the coachmark
        if (triggerRef.current.compareDocumentPosition(e.relatedTarget) === Node.DOCUMENT_POSITION_FOLLOWING && !popoverRef.current?.contains(e.relatedTarget)) {
          let manager = createFocusManager(popoverRef, {tabbable: true});
          manager.focusLast();
        }
      };
      trigger.addEventListener('keydown', onKeyDown);
      trigger.addEventListener('focusin', onFocusWithin);
      return () => {
        trigger.removeEventListener('keydown', onKeyDown);
        trigger.removeEventListener('focusin', onFocusWithin);
      };
    }
  }, []);


  return (
    <Provider
      values={[
          [OverlayTriggerStateContext, state],
          [RootMenuTriggerStateContext, state],
          [DialogContext, overlayProps],
          [PopoverContext, {trigger: 'DialogTrigger', triggerRef, ref: popoverRef, isNonModal: true}] // valid to pass triggerRef?
      ]}>
      <PressResponder {...triggerProps} isPressed={state.isOpen}>
        <CoachIndicator ref={triggerRef} isActive={state.isOpen}>
          {props.children}
        </CoachIndicator>
      </PressResponder>
    </Provider>
  );
}

export interface CoachMarkProps extends Omit<PopoverProps, 'children'>, StyleProps {
  /** The children of the coach mark. */
  children: ReactNode,

  size?: 'S' | 'M' | 'L' | 'XL'
}

const fadeKeyframes = keyframes(`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`);
const slideUpKeyframes = keyframes(`
  from {
    transform: translateY(-4px);
  }

  to {
    transform: translateY(0);
  }
`);
const slideDownKeyframes = keyframes(`
  from {
    transform: translateY(4px);
  }

  to {
    transform: translateY(0);
  }
`);
const slideRightKeyframes = keyframes(`
  from {
    transform: translateX(4px);
  }

  to {
    transform: translateX(0);
  }
`);
const slideLeftKeyframes = keyframes(`
  from {
    transform: translateX(-4px);
  }

  to {
    transform: translateX(0);
  }
`);

let popover = style({
  ...colorScheme(),
  '--s2-container-bg': {
    type: 'backgroundColor',
    value: 'layer-2'
  },
  backgroundColor: '--s2-container-bg',
  borderRadius: 'lg',
  filter: {
    isArrowShown: 'elevated'
  },
  // Use box-shadow instead of filter when an arrow is not shown.
  // This fixes the shadow stacking problem with submenus.
  boxShadow: {
    default: 'elevated',
    isArrowShown: 'none'
  },
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: {
    default: 'gray-200',
    forcedColors: 'ButtonBorder'
  },
  width: {
    size: {
      // Copied from designs, not sure if correct.
      S: 336,
      M: 416,
      L: 576
    }
  },
  // Don't be larger than full screen minus 2 * containerPadding
  maxWidth: '[calc(100vw - 24px)]',
  boxSizing: 'border-box',
  translateY: {
    placement: {
      bottom: {
        isArrowShown: 8 // TODO: not defined yet should this change with font size? need boolean support for 'hideArrow' prop
      },
      top: {
        isArrowShown: -8
      }
    }
  },
  translateX: {
    placement: {
      left: {
        isArrowShown: -8
      },
      right: {
        isArrowShown: 8
      }
    }
  },
  animation: {
    placement: {
      top: {
        isEntering: `${slideDownKeyframes}, ${fadeKeyframes}`,
        isExiting: `${slideDownKeyframes}, ${fadeKeyframes}`
      },
      bottom: {
        isEntering: `${slideUpKeyframes}, ${fadeKeyframes}`,
        isExiting: `${slideUpKeyframes}, ${fadeKeyframes}`
      },
      left: {
        isEntering: `${slideRightKeyframes}, ${fadeKeyframes}`,
        isExiting: `${slideRightKeyframes}, ${fadeKeyframes}`
      },
      right: {
        isEntering: `${slideLeftKeyframes}, ${fadeKeyframes}`,
        isExiting: `${slideLeftKeyframes}, ${fadeKeyframes}`
      }
    },
    isSubmenu: {
      isEntering: fadeKeyframes,
      isExiting: fadeKeyframes
    }
  },
  animationDuration: {
    isEntering: 200,
    isExiting: 200
  },
  animationDirection: {
    isEntering: 'normal',
    isExiting: 'reverse'
  },
  animationTimingFunction: {
    isExiting: 'in'
  },
  transition: '[opacity, transform]',
  willChange: '[opacity, transform]',
  isolation: 'isolate',
  pointerEvents: {
    isExiting: 'none'
  }
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

export const CoachMarkContext = createContext<ContextValue<CoachMarkProps, HTMLElement>>({});

// there is a focus trap outside of the Coachmark, can only forward tab to things in coachmark or after the trigger
export const CoachMark = forwardRef((props: CoachMarkProps, ref: ForwardedRef<HTMLElement>) => {
  let colorScheme = useContext(ColorSchemeContext);
  [props, ref] = useContextProps(props, ref, CoachMarkContext);
  let {isOpen} = useContext(OverlayTriggerStateContext)!;
  let {UNSAFE_style} = props;
  let {triggerRef} = useContext(PopoverContext);
  let {size = 'M'} = props;
  let popoverRef = useObjectRef(ref);

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

  useEffect(() => {
    let coachmark = popoverRef.current;
    if (coachmark && isOpen) {
      let ownerDocument = getOwnerDocument(coachmark);
      let onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab' && !e.shiftKey && triggerRef.current) {
          let manager = createFocusManager(ref, {tabbable: true});
          if (manager.focusLast({preview: true}) === ownerDocument.activeElement) {
            let triggerManager = createFocusManager(triggerRef, {tabbable: true});
            triggerManager.focusLast();
            // allow tab event to continue so that the focus moves normally after this
          }
        }
        if (e.key === 'Tab' && e.shiftKey && triggerRef.current) {
          let manager = createFocusManager(ref, {tabbable: true});
          if (manager.focusFirst({preview: true}) === ownerDocument.activeElement) {
            e.preventDefault();
            e.stopPropagation();
            let triggerManager = createFocusManager(triggerRef, {tabbable: true});
            triggerManager.focusFirst();
          }
        }
      };
      coachmark.addEventListener('keydown', onKeyDown);
      return () => {
        coachmark.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [isOpen]);

  // useLayoutEffect(() => { // do we want to hide everything so that it's easier for a AT user to get to the trigger for required actions?
  //   if (isOpen) {
  //     let cleanup = ariaHideOutside([triggerRef.current, popoverRef.current]);
  //     return () => {
  //       cleanup();
  //     };
  //   }
  // }, [isOpen]);

  return (
    <CoachMarkPopover
      {...props}
      ref={popoverRef}
      style={{
        ...UNSAFE_style,
        // Override default z-index from useOverlayPosition. We use isolation: isolate instead.
        zIndex: undefined
      }}
      className={(renderProps) =>  mergeStyles(popover({...renderProps, colorScheme}))}>
      <Card>
        {/* }// Reset OverlayTriggerStateContext so the buttons inside the dialog don't retain their hover state. */}
        <OverlayTriggerStateContext.Provider value={null}>
          {children}
        </OverlayTriggerStateContext.Provider>
      </Card>
    </CoachMarkPopover>
  );
});

function useCoachMarkPopover(props: AriaPopoverProps, state: OverlayTriggerState): PopoverAria {
  let {
    triggerRef,
    popoverRef,
    groupRef,
    isNonModal,
    isKeyboardDismissDisabled,
    shouldCloseOnInteractOutside,
    ...otherProps
  } = props;

  let isSubmenu = otherProps['trigger'] === 'SubmenuTrigger';

  let {overlayProps, underlayProps} = useOverlay(
    {
      isOpen: state.isOpen,
      onClose: state.close,
      shouldCloseOnBlur: false, // TODO: usePopover currently forces this to be true, so i have my own hook for the momment (RS)
      isDismissable: true,
      isKeyboardDismissDisabled,
      shouldCloseOnInteractOutside
    },
    groupRef ?? popoverRef
  );

  let {overlayProps: positionProps, arrowProps, placement} = useOverlayPosition({
    ...otherProps,
    targetRef: triggerRef,
    overlayRef: popoverRef,
    isOpen: state.isOpen,
    onClose: isNonModal && !isSubmenu ? state.close : null
  });

  usePreventScroll({
    isDisabled: isNonModal || !state.isOpen
  });

  return {
    popoverProps: mergeProps(overlayProps, positionProps),
    arrowProps,
    underlayProps,
    placement
  };
}

export interface PopoverRenderProps {
  /**
   * The name of the component that triggered the popover, e.g. "DialogTrigger" or "ComboBox".
   * @selector [data-trigger="..."]
   */
  trigger: string | null,
  /**
   * The placement of the popover relative to the trigger.
   * @selector [data-placement="left | right | top | bottom"]
   */
  placement: PlacementAxis | null,
  /**
   * Whether the popover is currently entering. Use this to apply animations.
   * @selector [data-entering]
   */
  isEntering: boolean,
  /**
   * Whether the popover is currently exiting. Use this to apply animations.
   * @selector [data-exiting]
   */
  isExiting: boolean
}

const CoachMarkPopover = /*#__PURE__*/ (forwardRef as forwardRefType)(function CoachMarkPopover(props: PopoverProps, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, PopoverContext);
  let contextState = useContext(OverlayTriggerStateContext);
  let localState = useOverlayTriggerState(props);
  let state = props.isOpen != null || props.defaultOpen != null || !contextState ? localState : contextState;
  let isExiting = useExitAnimation(ref, state.isOpen) || props.isExiting || false;
  let isHidden = useIsHidden();
  let {direction} = useLocale();

  // If we are in a hidden tree, we still need to preserve our children.
  if (isHidden) {
    let children = props.children;
    if (typeof children === 'function') {
      children = children({
        trigger: props.trigger || null,
        placement: 'bottom',
        isEntering: false,
        isExiting: false,
        defaultChildren: null
      });
    }

    return <>{children}</>;
  }

  if (state && !state.isOpen && !isExiting) {
    return null;
  }

  return (
    <PopoverInner
      {...props}
      triggerRef={props.triggerRef!}
      state={state}
      popoverRef={ref}
      isExiting={isExiting}
      dir={direction} />
  );
});

interface PopoverInnerProps extends AriaPopoverProps, RenderProps<PopoverRenderProps>, SlotProps {
  state: OverlayTriggerState,
  isEntering?: boolean,
  isExiting: boolean,
  UNSTABLE_portalContainer?: Element,
  trigger?: string,
  dir?: 'ltr' | 'rtl'
}

function PopoverInner({state, isExiting, UNSTABLE_portalContainer, ...props}: PopoverInnerProps) {
  // Calculate the arrow size internally (and remove props.arrowSize from PopoverProps)
  // Referenced from: packages/@react-spectrum/tooltip/src/TooltipTrigger.tsx
  let arrowRef = useRef<HTMLDivElement>(null);
  let [arrowWidth, setArrowWidth] = useState(0);
  let containerRef = useRef<HTMLDivElement | null>(null);
  let groupCtx = null;
  let isSubPopover = groupCtx && props.trigger === 'SubmenuTrigger';
  useLayoutEffect(() => {
    if (arrowRef.current && state.isOpen) {
      setArrowWidth(arrowRef.current.getBoundingClientRect().width);
    }
  }, [state.isOpen, arrowRef]);

  let {popoverProps, underlayProps, arrowProps, placement} = useCoachMarkPopover({
    ...props,
    offset: props.offset ?? 16,
    arrowSize: arrowWidth,
    // If this is a submenu/subdialog, use the root popover's container
    // to detect outside interaction and add aria-hidden.
    groupRef: isSubPopover ? groupCtx! : containerRef
  }, state);

  let ref = props.popoverRef as RefObject<HTMLDivElement | null>;
  let isEntering = useEnterAnimation(ref, !!placement) || props.isEntering || false;
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Popover',
    values: {
      trigger: props.trigger || null,
      placement,
      isEntering,
      isExiting
    }
  });

  // Automatically render Popover with role=dialog except when isNonModal is true,
  // or a dialog is already nested inside the popover.
  let shouldBeDialog = !props.isNonModal || props.trigger === 'SubmenuTrigger';
  let [isDialog, setDialog] = useState(false);
  useLayoutEffect(() => {
    if (ref.current) {
      setDialog(shouldBeDialog && !ref.current.querySelector('[role=dialog]'));
    }
  }, [ref, shouldBeDialog]);

  // Focus the popover itself on mount, unless a child element is already focused.
  useEffect(() => {
    if (isDialog && ref.current && !ref.current.contains(document.activeElement)) {
      focusSafely(ref.current);
    }
  }, [isDialog, ref]);

  let style = {...popoverProps.style, ...renderProps.style};
  let overlay = (
    <div
      {...mergeProps(filterDOMProps(props as any), popoverProps)}
      {...renderProps}
      role={isDialog ? 'dialog' : undefined}
      tabIndex={isDialog ? -1 : undefined}
      aria-label={props['aria-label']}
      aria-labelledby={props['aria-labelledby']}
      ref={ref}
      slot={props.slot || undefined}
      style={style}
      dir={props.dir}
      data-trigger={props.trigger}
      data-placement={placement}
      data-entering={isEntering || undefined}
      data-exiting={isExiting || undefined}>
      {!props.isNonModal && <DismissButton onDismiss={state.close} />}
      <OverlayArrowContext.Provider value={{...arrowProps, placement, ref: arrowRef}}>
        {renderProps.children}
      </OverlayArrowContext.Provider>
      <DismissButton onDismiss={state.close} />
    </div>
  );

  // Submenus/subdialogs are mounted into the root popover's container.
  // TODO: shouldRestoreFocus={false} is a hack to prevent focusscope's restore focus from directing the focus to the element after nodeToRestore which
  // nodeToRestore is the element that had focus when the focus scope mounted, in the case of the CoachMark Restartable, it's the Open button, and the element
  // after it is the CoachMarkTrigger. This causes an infinite tab loop. So stop FocusScope from handling this and handle it ourselves in CoachMark.
  return (
    <Overlay {...props} shouldContainFocus={isDialog} shouldRestoreFocus={false} isExiting={isExiting} portalContainer={UNSTABLE_portalContainer ?? groupCtx?.current ?? undefined}>
      {overlay}
    </Overlay>
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

interface CoachIndicatorProps {
  children: ReactNode,
  isActive?: boolean
}
export const CoachIndicator = /*#__PURE__*/ (forwardRef as forwardRefType)(function CoachIndicator(props: CoachIndicatorProps, ref: ForwardedRef<HTMLDivElement>) {
  const {children, isActive} = props;
  let defaultRef = useRef<HTMLDivElement>(null);
  ref = ref ?? defaultRef;

  // This is very silly... better ways? can't use display: contents because it breaks positioning
  // this will break if there is a resize or different styles
  useLayoutEffect(() => {
    if (ref.current) {
      let styles = getComputedStyle(ref.current.children[0]);
      let childDisplay = styles.getPropertyValue('display');
      let childMaxWidth = styles.getPropertyValue('max-width');
      let childMaxHeight = styles.getPropertyValue('max-height');
      let childWidth = styles.getPropertyValue('width');
      let childHeight = styles.getPropertyValue('height');
      let childMinWidth = styles.getPropertyValue('min-width');
      let childMinHeight = styles.getPropertyValue('min-height');
      ref.current.style.display = childDisplay;
      ref.current.style.maxWidth = childMaxWidth;
      ref.current.style.maxHeight = childMaxHeight;
      ref.current.style.width = childWidth;
      ref.current.style.height = childHeight;
      ref.current.style.minWidth = childMinWidth;
      ref.current.style.minHeight = childMinHeight;
    }
  }, [children]);

  return (
    <div ref={ref} className={indicator({isActive}) + ' ' + (isActive ? pulse : '')}>
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

// export interface TourProps {
//   defaultStep?: number,
//   defaultComplete?: boolean,
//   /**
//    * Used to pre-set the total number of steps when more coachmarks may arrive async.
//    */
//   totalSteps?: number
// }

// export interface TourReturnVal {
//   createCoachMarkTriggerProps: (step: number) => Omit<CoachMarkTriggerProps, 'children'>,
//   currentStep: number,
//   totalSteps: number,
//   advanceStep: () => void,
//   previousStep: () => void,
//   skipTour: () => void,
//   restartTour: () => void
// }

// // FUTURE: support multiple tours on a page?
// export function useTour(props: TourProps): TourReturnVal  {
//   let {defaultStep = 1, defaultComplete = false, totalSteps: controlledTotalSteps} = props;
//   const [isComplete, setIsComplete] = useState(defaultComplete);
//   const [currentStep, setCurrentStep] = useState(defaultStep);
//   const [totalSteps, setTotalSteps] = useState(controlledTotalSteps ?? 0);
//   const advanceStep = () => {
//     if (currentStep + 1 > totalSteps) {
//       setIsComplete(true);
//     }
//     setCurrentStep(currentStep < totalSteps ? currentStep + 1 : totalSteps);
//   };
//   const previousStep = () => setCurrentStep(currentStep > 0 ? currentStep - 1 : 0);
//   const skipTour = () => setIsComplete(true);
//   const restartTour = () => {
//     setIsComplete(false);
//     setCurrentStep(1);
//   };

//   const createCoachMarkTriggerProps = (step: number): Omit<CoachMarkTriggerProps, 'children'> => {
//     // TODO find a better way for this so it's not run on every rerender
//     if (step > totalSteps && controlledTotalSteps === undefined) {
//       setTotalSteps(step);
//     }
//     return {
//       isOpen: !isComplete && step === currentStep
//     };
//   };

//   return {
//     createCoachMarkTriggerProps,
//     currentStep,
//     totalSteps,
//     advanceStep,
//     previousStep,
//     skipTour,
//     restartTour
//   };
// }
