import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuItemProps as AriaMenuItemProps,
  MenuProps as AriaMenuProps,
  MenuTrigger as AriaMenuTrigger,
  MenuTriggerProps as AriaMenuTriggerProps,
  Provider,
  composeRenderProps,
  Section as AriaSection,
  SectionProps,
  SubmenuTrigger
} from 'react-aria-components';
import {box, iconStyles} from './Checkbox';
import {TextContext, HeadingContext, HeaderContext, Text, ImageContext, KeyboardContext} from './Content';
import {StyleProps, centerPadding, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {style, baseColor, edgeToText, fontRelative, size, space} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {mergeStyles} from '../style-macro/runtime';
import {Popover} from './Popover';
import {pressScale} from './pressScale';
import {createContext, ReactNode, useContext, useRef} from 'react';
import {IconContext} from './Icon';
import CheckmarkIcon from '../ui-icons/Checkmark';
import ChevronRightIcon from './wf-icons/ChevronRight';
import LinkOutIcon from '../ui-icons/LinkOut';
import {Divider} from './Divider';
import {Placement} from 'react-aria';
// viewbox on LinkOut is super weird just because i copied the icon from figma...
// need to strip id's from icons

export interface MenuTriggerProps extends AriaMenuTriggerProps {
  align?: 'start' | 'end',
  direction?: 'bottom' | 'top' | 'left' | 'right' | 'start' | 'end',
  shouldFlip?: boolean
}

export interface MenuProps<T> extends Omit<AriaMenuProps<T>, 'children' | 'style' | 'className'>, StyleProps {
  size?: 'S' | 'M' | 'L' | 'XL',
  children?: ReactNode | ((item: T) => ReactNode) // until we export CollectionProps
}

// needed to round the corners of the scroll bar, it can't be popover because that hides the submenu as well
// and it can't be the menu itself because it's the part that scrolls
let menuWrapper = style({
  maxHeight: '[inherit]',
  overflow: 'hidden',
  borderRadius: 'lg',
  // extends the area so the overflow hidden doesn't clip too close
  padding: 8,
  margin: -8
});

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
  overflow: 'auto',
  padding: 8,
  margin: -8,
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
    type: 'color',
    value: '[currentColor]'
  },
  marginEnd: 'text-to-control',
  aspectRatio: 'square'
});

let checkbox = style({
  gridArea: 'checkmark',
  marginEnd: 'text-to-control'
});

let icon = style({
  gridArea: 'icon',
  marginEnd: 'text-to-visual' // TODO: once i have access to figma again
  // too small default icon size is wrong, it's like the icons are 1 tshirt size bigger than the rest of the component? check again after typography changes
  // reminder, size of WF is applied via font size
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
  marginStart: 8
});

let InternalMenuContext = createContext<{size: 'S' | 'M' | 'L' | 'XL', isSubmenu: boolean}>({size: 'M', isSubmenu: false});
let InternalMenuTriggerContext = createContext<MenuTriggerProps>({});

export function Menu<T extends object>(props: MenuProps<T>) {
  let {isSubmenu, size: ctxSize} = useContext(InternalMenuContext);
  let {
    children,
    size = ctxSize,
    UNSAFE_style,
    UNSAFE_className,
    css
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

  return (
    <Popover
      hideArrow
      placement={initialPlacement}
      shouldFlip={shouldFlip}
      offset={isSubmenu ? -8 : 0}
      crossOffset={isSubmenu ? 4 : 0}
      UNSAFE_style={UNSAFE_style}
      UNSAFE_className={UNSAFE_className}
      css={css}>
      <div role="presentation" className={menuWrapper}>
        <InternalMenuContext.Provider value={{size, isSubmenu: true}}>
          <Provider
            values={[
              [HeaderContext, {
                slots: {
                  header: {className: sectionHeader({size})}
                }
              }],
            [HeadingContext, {className: sectionHeading}],
              [TextContext, {
                slots: {
                  'section-description': {className: description({size})}
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
      </div>
    </Popover>
  );
}

export function MenuSection<T extends object>(props: SectionProps<T>) {
  // remember, context doesn't work if it's around Section nor inside
  return (
    <>
      <AriaSection
        {...props}
        className={section}>
        {props.children}
      </AriaSection>
      <Divider
        UNSAFE_className={style({
          display: {
            default: 'grid',
            ':last-child': 'none'
          },
          gridColumnStart: 2,
          gridColumnEnd: -2,
          marginY: size(10) // height of the menu separator is 12px, and the divider is 2px
        })} />
    </>
  );
}

interface MenuItemProps extends Omit<AriaMenuItemProps, 'children' | 'style' | 'className'>, StyleProps {
  children: ReactNode
}

export function MenuItem(props: MenuItemProps) {
  let ref = useRef(null);
  let isLink = props.href != null;
  let {size} = useContext(InternalMenuContext);
  return (
    <AriaMenuItem
      {...props}
      ref={ref}
      style={pressScale(ref, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + menuitem({...renderProps, isFocused: (renderProps.hasSubmenu && renderProps.isOpen) || renderProps.isFocused, size, isLink}, props.css)}>
      {composeRenderProps(props.children, (children, renderProps) => {
        let checkboxRenderProps = {...renderProps, size, isFocused: false, isFocusVisible: false, isIndeterminate: false, isReadOnly: false, isInvalid: false, isRequired: false};
        return (
          <>
            <Provider
              values={[
                [IconContext, {
                  slots: {
                    icon: {css: icon},
                    descriptor: {css: descriptor} // TODO: remove once we have default?
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
              {renderProps.hasSubmenu && <ChevronRightIcon  slot="descriptor" css={descriptor} />}
            </Provider>
          </>
        );
      })}
    </AriaMenuItem>
  );
}

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
