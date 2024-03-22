import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuItemProps as AriaMenuItemProps,
  MenuProps as AriaMenuProps,
  MenuTrigger as AriaMenuTrigger,
  MenuTriggerProps as AriaMenuTriggerProps,
  Separator,
  Provider,
  composeRenderProps,
  Section as AriaSection,
  SectionProps,
  SubmenuTrigger,
  SeparatorProps
} from 'react-aria-components';
import {box, iconStyles} from './Checkbox';
import {TextContext, HeadingContext, HeaderContext, Text, ImageContext, KeyboardContext} from './Content';
import {StyleProps, centerPadding, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {style, baseColor, edgeToText, fontRelative, size, space} from '../style/spectrum-theme' with {type: 'macro'};
import {mergeStyles} from '../style/runtime';
import {Popover} from './Popover';
import {pressScale} from './pressScale';
import {createContext, forwardRef, ReactNode, useContext, useRef} from 'react';
import {IconContext} from './Icon';
import CheckmarkIcon from '../ui-icons/Checkmark';
import ChevronRightIcon from '../ui-icons/Chevron'; // chevron right removed??
import LinkOutIcon from '../ui-icons/LinkOut';
import {Placement} from 'react-aria';
import {DOMRef} from '@react-types/shared';
import {centerBaseline} from './CenterBaseline';
import {divider} from './Divider';
import {forwardRefType} from './types';
// viewbox on LinkOut is super weird just because i copied the icon from figma...
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
   * @default "M"
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The contents of the collection.
   */
  children?: ReactNode | ((item: T) => ReactNode)
}

let menu = style({
  outlineStyle: 'none',
  display: 'grid',
  gridTemplateColumns: {
    size: {
      S: [edgeToText(24), 'auto', 'auto', '1fr', 'auto', 'auto', 'auto', edgeToText(24)],
      M: [edgeToText(32), 'auto', 'auto', '1fr', 'auto', 'auto', 'auto', edgeToText(32)],
      L: [edgeToText(40), 'auto', 'auto', '1fr', 'auto', 'auto', 'auto', edgeToText(40)],
      XL: [edgeToText(48), 'auto', 'auto', '1fr', 'auto', 'auto', 'auto', edgeToText(48)]
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

let section = style({
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

let sectionHeader = style<{size?: 'S' | 'M' | 'L' | 'XL'}>({
  color: 'gray-800',
  gridColumnStart: 2,
  gridColumnEnd: -2,
  boxSizing: 'border-box',
  minHeight: 'control',
  paddingY: centerPadding()
});

let sectionHeading = style({
  fontWeight: 'bold',
  margin: 0
});

let menuitem = style({
  ...focusRing(),
  boxSizing: 'border-box',
  borderRadius: 'control',
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
  zIndex: {
    isFocused: 1
  },
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

let checkmark = style({
  visibility: {
    default: 'hidden',
    isSelected: 'visible'
  },
  gridArea: 'checkmark',
  color: 'accent',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  marginEnd: 'text-to-control',
  aspectRatio: 'square'
});

let checkbox = style({
  gridArea: 'checkmark',
  marginEnd: 'text-to-control'
});

let icon = style({
  size: fontRelative(20),
  // too small default icon size is wrong, it's like the icons are 1 tshirt size bigger than the rest of the component? check again after typography changes
  // reminder, size of WF is applied via font size
  marginEnd: 'text-to-visual',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

let iconCenterWrapper = style({
  gridArea: 'icon'
});

let image = style({
  gridArea: 'icon',
  gridRowEnd: 'span 2',
  marginEnd: 'text-to-visual',
  marginTop: fontRelative(6), // made up, need feedback
  alignSelf: 'center',
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

let label = style({
  gridArea: 'label',
  fontWeight: 'medium',
  // TODO: token values for padding not defined yet, revisit
  marginTop: '--labelPadding'
});

let description = style({
  gridArea: 'description',
  fontFamily: 'sans',
  fontSize: {
    default: 'ui-sm',
    size: {
      S: 'ui-xs',
      M: 'ui-sm',
      L: 'ui',
      XL: 'ui-lg'
    }
  }
});

let value = style({
  gridArea: 'value',
  marginStart: 8
});

let keyboard = style({
  gridArea: 'keyboard',
  marginStart: 8,
  color: {
    default: 'gray-600',
    isDisabled: 'disabled',
    forcedColors: {
      isDisabled: 'GrayText'
    }
  },
  fontFamily: 'sans',
  background: 'gray-25',
  fontWeight: 'light',
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
let InternalMenuTriggerContext = createContext<MenuTriggerProps>({});

function Menu<T extends object>(props: MenuProps<T>, ref: DOMRef<HTMLDivElement>) {
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
      // Offset by padding so that the first item in a submenu lines up with the parent menu item.
      crossOffset={isSubmenu ? -8 : 0}
      UNSAFE_style={UNSAFE_style}
      UNSAFE_className={UNSAFE_className}
      styles={styles}>
      <InternalMenuContext.Provider value={{size, isSubmenu: true}}>
        <Provider
          values={[
            [HeaderContext, {className: sectionHeader({size})}],
            [HeadingContext, {className: sectionHeading}],
            [TextContext, {
              slots: {
                'description': {className: description({size})}
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

function Divider(props: SeparatorProps) {
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

export function MenuItem(props: MenuItemProps) {
  let ref = useRef(null);
  let isLink = props.href != null;
  let {size} = useContext(InternalMenuContext);
  let textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaMenuItem
      {...props}
      textValue={textValue}
      ref={ref}
      style={pressScale(ref, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + menuitem({...renderProps, isFocused: (renderProps.hasSubmenu && renderProps.isOpen) || renderProps.isFocused, size, isLink}, props.styles)}>
      {composeRenderProps(props.children, (children, renderProps) => {
        let checkboxRenderProps = {...renderProps, size, isFocused: false, isFocusVisible: false, isIndeterminate: false, isReadOnly: false, isInvalid: false, isRequired: false};
        return (
          <>
            <Provider
              values={[
                [IconContext, {
                  slots: {
                    icon: {render: centerBaseline({slot: 'icon', className: iconCenterWrapper}), styles: icon}, // fix className to css?
                    descriptor: {render: centerBaseline({slot: 'descriptor', className: descriptor})} // TODO: remove once we have default?
                  }
                }],
                [TextContext, {
                  slots: {
                    label: {className: label},
                    description: {className: description({size})},
                    value: {className: value}
                  }
                }],
                [KeyboardContext, {className: keyboard({size, isDisabled: renderProps.isDisabled})}],
                [ImageContext, {className: image({size})}]
              ]}>
              {renderProps.selectionMode === 'single' && !isLink && !renderProps.hasSubmenu && <CheckmarkIcon size={({S: 'S', M: 'L', L: 'XL', XL: 'XXL'} as const)[size]} className={checkmark({...renderProps, size})} />}
              {renderProps.selectionMode === 'multiple' && !isLink && !renderProps.hasSubmenu && (
                <div className={mergeStyles(checkbox, box(checkboxRenderProps))}>
                  <CheckmarkIcon size={size} className={iconStyles} />
                </div>
              )}
              {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
              {isLink && <LinkOutIcon size={size} className={descriptor} />}
              {renderProps.hasSubmenu && <div slot="descriptor" className={descriptor}><ChevronRightIcon size={size} /></div>}
            </Provider>
          </>
        );
      })}
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
      <AriaMenuTrigger {...props} />
    </InternalMenuTriggerContext.Provider>
  );
}

export {MenuTrigger, SubmenuTrigger};

// This is purely so that storybook generates the types for both Menu and MenuTrigger
interface ICombined<T extends object> extends MenuProps<T>, Omit<MenuTriggerProps, 'children'> {}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CombinedMenu<T extends object>(props: ICombined<T>) {
  return <div />;
}
