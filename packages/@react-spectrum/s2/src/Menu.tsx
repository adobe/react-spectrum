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

import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuItemProps as AriaMenuItemProps,
  MenuProps as AriaMenuProps,
  MenuTrigger as AriaMenuTrigger,
  MenuTriggerProps as AriaMenuTriggerProps,
  Section as AriaSection,
  SubmenuTrigger as AriaSubmenuTrigger,
  SubmenuTriggerProps as AriaSubmenuTriggerProps,
  ContextValue,
  Provider,
  SectionProps,
  Separator,
  SeparatorProps
} from 'react-aria-components';
import {baseColor, edgeToText, focusRing, fontRelative, size, space, style} from '../style' with {type: 'macro'};
import {box, iconStyles} from './Checkbox';
import {centerBaseline} from './CenterBaseline';
import {centerPadding, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import CheckmarkIcon from '../ui-icons/Checkmark';
import ChevronRightIcon from '../ui-icons/Chevron';
import {createContext, forwardRef, JSX, ReactNode, useContext, useRef} from 'react';
import {divider} from './Divider';
import {DOMRef, DOMRefValue} from '@react-types/shared';
import {forwardRefType} from './types';
import {HeaderContext, HeadingContext, KeyboardContext, Text, TextContext} from './Content';
import {IconContext} from './Icon'; // chevron right removed??
import {ImageContext} from './Image';
import LinkOutIcon from '../ui-icons/LinkOut';
import {mergeStyles} from '../style/runtime';
import {Placement, useLocale} from 'react-aria';
import {Popover} from './Popover';
import {PressResponder} from '@react-aria/interactions';
import {pressScale} from './pressScale';
import {useSpectrumContextProps} from './useSpectrumContextProps';
// viewbox on LinkOut is super weird just because i copied the icon from designs...
// need to strip id's from icons

export interface MenuTriggerProps extends AriaMenuTriggerProps {
  /**
   * Alignment of the menu relative to the trigger.
   *
   * @default 'start'
   */
  align?: 'start' | 'end',
  /**
   * Where the Menu opens relative to its trigger.
   *
   * @default 'bottom'
   */
  direction?: 'bottom' | 'top' | 'left' | 'right' | 'start' | 'end',
  /**
   * Whether the menu should automatically flip direction when space is limited.
   *
   * @default true
   */
  shouldFlip?: boolean
}

export interface MenuProps<T> extends Omit<AriaMenuProps<T>, 'children' | 'style' | 'className' | 'dependencies'>, StyleProps {
  /**
   * The size of the Menu.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The contents of the collection.
   */
  children?: ReactNode | ((item: T) => ReactNode)
}

export const MenuContext = createContext<ContextValue<MenuProps<any>, DOMRefValue<HTMLDivElement>>>(null);

export let menu = style({
  outlineStyle: 'none',
  display: 'grid',
  gridTemplateColumns: {
    size: {
      S: [edgeToText(24), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(24)],
      M: [edgeToText(32), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(32)],
      L: [edgeToText(40), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(40)],
      XL: [edgeToText(48), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(48)]
    }
  },
  boxSizing: 'border-box',
  maxHeight: '[inherit]',
  maxWidth: 320,
  overflow: 'auto',
  padding: 8,
  fontFamily: 'sans',
  fontSize: 'control'
});

export let section = style({
  gridColumnStart: 1,
  gridColumnEnd: -1,
  alignItems: 'center',
  display: 'grid',
  gridTemplateAreas: [
    '. checkmark icon label       value keyboard descriptor .',
    '. .         .    description .     .        .          .'
  ],
  gridTemplateColumns: 'subgrid'
});

export let sectionHeader = style<{size?: 'S' | 'M' | 'L' | 'XL'}>({
  color: 'neutral',
  gridColumnStart: 2,
  gridColumnEnd: -2,
  boxSizing: 'border-box',
  minHeight: 'control',
  paddingY: centerPadding()
});

export let sectionHeading = style({
  font: 'ui',
  fontWeight: 'bold',
  margin: 0
});

export let menuitem = style({
  ...focusRing(),
  boxSizing: 'border-box',
  borderRadius: 'control',
  font: 'control',
  '--labelPadding': {
    type: 'paddingTop',
    value: centerPadding()
  },
  paddingBottom: '--labelPadding',
  backgroundColor: { // TODO: revisit color when I have access to dev mode again
    default: {
      default: 'transparent',
      isFocused: baseColor('gray-100').isFocusVisible
    }
  },
  color: {
    default: 'neutral',
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  position: 'relative',
  // each menu item should take up the entire width, the subgrid will handle within the item
  gridColumnStart: 1,
  gridColumnEnd: -1,
  display: 'grid',
  gridTemplateAreas: [
    '. checkmark icon label       value keyboard descriptor .',
    '. .         .    description .     .        .          .'
  ],
  gridTemplateColumns: 'subgrid',
  gridTemplateRows: {
    // min-content prevents second row from 'auto'ing to a size larger then 0 when empty
    default: 'auto minmax(0, min-content)',
    ':has([slot=description])': 'auto auto'
  },
  rowGap: {
    ':has([slot=description])': space(1)
  },
  alignItems: 'baseline',
  minHeight: 'control',
  textDecoration: 'none',
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  transition: 'default'
}, getAllowedOverrides());

export let checkmark = style({
  visibility: {
    default: 'hidden',
    isSelected: 'visible'
  },
  gridArea: 'checkmark',
  color: 'accent',
  '--iconPrimary': {
    type: 'fill',
    value: {
      default: 'currentColor',
      forcedColors: 'Highlight'
    }
  },
  marginEnd: 'text-to-control',
  aspectRatio: 'square'
});

let checkbox = style({
  gridArea: 'checkmark',
  marginEnd: 'text-to-control'
});

export let icon = style({
  display: 'block',
  size: fontRelative(20),
  // too small default icon size is wrong, it's like the icons are 1 tshirt size bigger than the rest of the component? check again after typography changes
  // reminder, size of WF is applied via font size
  marginEnd: 'text-to-visual',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

export let iconCenterWrapper = style({
  display: 'flex',
  gridArea: 'icon'
});

let image = style({
  gridArea: 'icon',
  gridRowEnd: 'span 2',
  marginEnd: 'text-to-visual',
  marginTop: fontRelative(6), // made up, need feedback
  alignSelf: 'center',
  borderRadius: 'sm',
  size: {
    default: 40,
    size: {
      S: 32,
      M: 40,
      L: 44,
      XL: 48 // TODO: feedback, Why is it 50x50, that's on 12.25 so doesn't fit the grid at all
    }
  },
  aspectRatio: 'square',
  objectFit: 'contain'
});

export let label = style<{size: string}>({
  gridArea: 'label',
  font: 'control',
  color: '[inherit]',
  fontWeight: 'medium',
  // TODO: token values for padding not defined yet, revisit
  marginTop: '--labelPadding'
});

export let description = style({
  gridArea: 'description',
  font: {
    default: 'ui-sm',
    size: {
      S: 'ui-xs',
      M: 'ui-sm',
      L: 'ui',
      XL: 'ui-lg'
    }
  },
  color: {
    default: 'neutral-subdued',
    // Ideally this would use the same token as hover, but we don't have access to that here.
    // TODO: should we always consider isHovered and isFocused to be the same thing?
    isFocused: 'gray-800',
    isDisabled: 'disabled'
  },
  transition: 'default'
});

let value = style({
  gridArea: 'value',
  marginStart: 8
});

let keyboard = style({
  gridArea: 'keyboard',
  marginStart: 8,
  font: 'ui',
  fontWeight: 'light',
  color: {
    default: 'gray-600',
    isDisabled: 'disabled',
    forcedColors: {
      isDisabled: 'GrayText'
    }
  },
  background: 'gray-25',
  unicodeBidi: 'plaintext'
});

let descriptor = style({
  gridArea: 'descriptor',
  marginStart: 8,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

let InternalMenuContext = createContext<{size: 'S' | 'M' | 'L' | 'XL', isSubmenu: boolean}>({size: 'M', isSubmenu: false});
let InternalMenuTriggerContext = createContext<Omit<MenuTriggerProps, 'children'>>({});

function Menu<T extends object>(props: MenuProps<T>, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, MenuContext);
  let {isSubmenu, size: ctxSize} = useContext(InternalMenuContext);
  let {
    children,
    size = ctxSize,
    UNSAFE_style,
    UNSAFE_className,
    styles
  } = props;
  let {align = 'start', direction = 'bottom', shouldFlip} = useContext(InternalMenuTriggerContext);

  // TODO: change offset/crossoffset based on size? scale?
  // actual values?
  let initialPlacement: Placement;
  switch (direction) {
    case 'left':
    case 'right':
    case 'start':
    case 'end':
      initialPlacement = `${direction} ${align === 'end' ? 'bottom' : 'top'}` as Placement;
      break;
    case 'bottom':
    case 'top':
    default:
      initialPlacement = `${direction} ${align}` as Placement;
  }
  if (isSubmenu) {
    initialPlacement = 'end top' as Placement;
  }

  return (
    <Popover
      ref={ref}
      hideArrow
      placement={initialPlacement}
      shouldFlip={shouldFlip}
      // For submenus, the offset from the edge of the popover should be 10px.
      // Subtract 8px for the padding around the parent menu.
      offset={isSubmenu ? -2 : 8}
      // Offset by padding + border so that the first item in a submenu lines up with the parent menu item.
      crossOffset={isSubmenu ? -9 : 0}
      UNSAFE_style={UNSAFE_style}
      UNSAFE_className={UNSAFE_className}
      styles={styles}>
      <InternalMenuContext.Provider value={{size, isSubmenu: true}}>
        <Provider
          values={[
            [HeaderContext, {styles: sectionHeader({size})}],
            [HeadingContext, {styles: sectionHeading}],
            [TextContext, {
              slots: {
                'description': {styles: description({size})}
              }
            }]
          ]}>
          <AriaMenu
            {...props}
            className={menu({size})}>
            {children}
          </AriaMenu>
        </Provider>
      </InternalMenuContext.Provider>
    </Popover>
  );
}

/**
 * Menus display a list of actions or options that a user can choose.
 */
let _Menu = /*#__PURE__*/ (forwardRef as forwardRefType)(Menu);
export {_Menu as Menu};

export function Divider(props: SeparatorProps) {
  return (
    <Separator
      {...props}
      className={mergeStyles(
        divider({
          size: 'M',
          orientation: 'horizontal',
          staticColor: undefined
        }), style({
          display: {
            default: 'grid',
            ':last-child': 'none'
          },
          gridColumnStart: 2,
          gridColumnEnd: -2,
          marginY: size(5) // height of the menu separator is 12px, and the divider is 2px
        })
      )} />
  );
}

export interface MenuSectionProps<T extends object> extends SectionProps<T> {}
export function MenuSection<T extends object>(props: MenuSectionProps<T>) {
  // remember, context doesn't work if it's around Section nor inside
  return (
    <>
      <AriaSection
        {...props}
        className={section}>
        {props.children}
      </AriaSection>
      <Divider />
    </>
  );
}

export interface MenuItemProps extends Omit<AriaMenuItemProps, 'children' | 'style' | 'className'>, StyleProps {
  /**
   * The contents of the item.
   */
  children: ReactNode
}

const checkmarkIconSize = {
  S: 'XS',
  M: 'M',
  L: 'L',
  XL: 'XL'
} as const;

const linkIconSize = {
  S: 'M',
  M: 'L',
  L: 'XL',
  XL: 'XL'
} as const;

export function MenuItem(props: MenuItemProps) {
  let ref = useRef(null);
  let isLink = props.href != null;
  let isLinkOut = isLink && props.target === '_blank';
  let {size} = useContext(InternalMenuContext);
  let textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  let {direction} = useLocale();
  return (
    <AriaMenuItem
      {...props}
      textValue={textValue}
      ref={ref}
      style={pressScale(ref, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + menuitem({...renderProps, isFocused: (renderProps.hasSubmenu && renderProps.isOpen) || renderProps.isFocused, size, isLink}, props.styles)}>
      {(renderProps) => {
        let {children} = props;
        let checkboxRenderProps = {...renderProps, size, isFocused: false, isFocusVisible: false, isIndeterminate: false, isReadOnly: false, isInvalid: false, isRequired: false};
        return (
          <>
            <Provider
              values={[
                [IconContext, {
                  slots: {
                    icon: {render: centerBaseline({slot: 'icon', styles: iconCenterWrapper}), styles: icon},
                    descriptor: {render: centerBaseline({slot: 'descriptor', styles: descriptor})} // TODO: remove once we have default?
                  }
                }],
                [TextContext, {
                  slots: {
                    label: {styles: label({size})},
                    description: {styles: description({...renderProps, size})},
                    value: {styles: value}
                  }
                }],
                [KeyboardContext, {styles: keyboard({size, isDisabled: renderProps.isDisabled})}],
                [ImageContext, {styles: image({size})}]
              ]}>
              {renderProps.selectionMode === 'single' && !isLink && !renderProps.hasSubmenu && <CheckmarkIcon size={checkmarkIconSize[size]} className={checkmark({...renderProps, size})} />}
              {renderProps.selectionMode === 'multiple' && !isLink && !renderProps.hasSubmenu && (
                <div className={mergeStyles(checkbox, box(checkboxRenderProps))}>
                  <CheckmarkIcon size={size} className={iconStyles} />
                </div>
              )}
              {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
              {isLinkOut && <LinkOutIcon size={linkIconSize[size]} className={descriptor} />}
              {renderProps.hasSubmenu && (
                <div slot="descriptor" className={descriptor}>
                  <ChevronRightIcon
                    size={size}
                    className={style({
                      scale: {
                        direction: {
                          rtl: -1
                        }
                      }
                    })({direction})} />
                </div>
              )}
            </Provider>
          </>
        );
      }}
    </AriaMenuItem>
  );
}

/**
 * The MenuTrigger serves as a wrapper around a Menu and its associated trigger,
 * linking the Menu's open state with the trigger's press state.
 */
function MenuTrigger(props: MenuTriggerProps) {
  return (
    <InternalMenuTriggerContext.Provider
      value={{
        align: props.align,
        direction: props.direction,
        shouldFlip: props.shouldFlip
      }}>
      <AriaMenuTrigger {...props}>
        {/* RAC sets isPressed via PressResponder when the menu is open.
            We don't want press scaling to appear to get "stuck", so override this. */}
        <PressResponder isPressed={false}>
          {props.children}
        </PressResponder>
      </AriaMenuTrigger>
    </InternalMenuTriggerContext.Provider>
  );
}

export interface SubmenuTriggerProps extends Omit<AriaSubmenuTriggerProps, 'delay'> {}

const SubmenuTrigger = AriaSubmenuTrigger as (props: SubmenuTriggerProps) => JSX.Element | null;

export {MenuTrigger, SubmenuTrigger};

// This is purely so that storybook generates the types for both Menu and MenuTrigger
interface ICombined<T extends object> extends MenuProps<T>, Omit<MenuTriggerProps, 'children'> {}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CombinedMenu<T extends object>(props: ICombined<T>) {
  return <div />;
}
