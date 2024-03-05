import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuItemProps,
  MenuProps as AriaMenuProps,
  MenuTrigger,
  MenuTriggerProps,
  Provider,
  composeRenderProps,
  Section as AriaSection,
  SectionProps,
  SubmenuTrigger
} from 'react-aria-components';
import {box, iconStyles} from './Checkbox';
import {TextContext, HeadingContext, HeaderContext, Text, ImageContext, KeyboardContext} from './Content';
import {focusRing} from './style-utils' with {type: 'macro'};
import {style, baseColor, edgeToText} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {mergeStyles} from '../style-macro/runtime';
import {Popover} from './Popover';
import {pressScale} from './pressScale';
import {createContext, ReactNode, useContext, useRef} from 'react';
import {IconContext} from './Icon';
import CheckmarkIcon from '../ui-icons/S2_CheckmarkSize100.svg';
import ChevronRightIcon from './wf-icons/ChevronRight';
import LinkOutIcon from './wf-icons/LinkOut'; // need linkout icon, not in our icons package yet, also needs to be 20x20 or a ui icon?
import {Divider} from './Divider';
// viewbox on LinkOut is super weird just because i copied the icon from figma...
// need to strip id's from icons


export interface MenuProps<T>
  extends AriaMenuProps<T> {
  size?: 'S' | 'M' | 'L' | 'XL'
}

// needed to round the corners of the scroll bar, it can't be popover because that hides the submenu as well
// and it can't be the menu itself because it's the part that scrolls
let menuWrapper = style({
  maxHeight: '[inherit]',
  overflow: 'hidden',
  borderRadius: 'lg',
  // extends the area so the overflow hidden doesn't clip too close
  padding: 2,
  margin: '-2'
});

let menu = style({
  outlineStyle: 'none',
  display: 'grid',
  gridTemplateColumns: {
    size: {
      S: [edgeToText(6), 'auto', 'auto', '1fr', 'auto', 'auto', 'auto', edgeToText(6)],
      M: [edgeToText(8), 'auto', 'auto', '1fr', 'auto', 'auto', 'auto', edgeToText(8)],
      L: [edgeToText(10), 'auto', 'auto', '1fr', 'auto', 'auto', 'auto', edgeToText(10)],
      XL: [edgeToText(12), 'auto', 'auto', '1fr', 'auto', 'auto', 'auto', edgeToText(12)]
    }
  },
  boxSizing: 'border-box',
  maxHeight: '[inherit]',
  overflow: 'auto',
  padding: 2,
  margin: '-2',
  fontFamily: 'sans',
  fontSize: 'control'
});

let section = style({
  gridColumn: '1 / -1',
  alignItems: 'center',
  display: 'grid',
  gridTemplateAreas: [
    '. checkmark icon label       value keyboard descriptor .',
    '. .         .    description .     .        .          .'
  ],
  gridTemplateColumns: 'subgrid'
});

let sectionHeader = style({
  color: 'gray-800',
  gridColumn: '2 / -2',
  paddingTop: 1.5,
  paddingBottom: 2
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
    value: '[calc((self(minHeight) - 1lh) / 2)]'
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
  gridColumn: '1 / -1',
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
    ':has([slot=description])': 'px'
  },
  alignItems: 'baseline',
  minHeight: 'control',
  textDecoration: 'none',
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  transition: 'default'
});

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
  // TODO: not sure the size is right, this is closer than control-sm though
  size: '[calc(12 / 14 * 1em)]',
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
  gridArea: 'icon / icon / span 2',
  marginEnd: 'text-to-visual',
  marginTop: '[calc(6 / 14 * 1em)]', // made up, need feedback
  alignSelf: 'center',
  size: {
    default: 10,
    size: {
      S: 8,
      M: 10,
      L: 11,
      XL: 12 // TODO: feedback, Why is it 50x50, that's on 12.25 so doesn't fit the grid at all
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
    default: 'sm',
    size: {
      S: 'xs',
      M: 'sm',
      L: 'base',
      XL: 'lg'
    }
  }
});

let value = style({
  gridArea: 'value',
  marginStart: 2
});

let keyboard = style({
  gridArea: 'keyboard',
  marginStart: 2,
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
  marginStart: 2
});

let InternalMenuContext = createContext<{size: 'S' | 'M' | 'L' | 'XL', isSubmenu: boolean}>({size: 'M', isSubmenu: false});

export function Menu<T extends object>(props: MenuProps<T>) {
  let {isSubmenu, size: ctxSize} = useContext(InternalMenuContext);
  let {
    children,
    size = ctxSize
  } = props;

  // TODO: change offset/crossoffset based on size? scale?
  // actual values?
  return (
    <Popover hideArrow offset={isSubmenu ? -8 : 0} crossOffset={isSubmenu ? 4 : 0}>
      <div role="presentation" className={menuWrapper()}>
        <InternalMenuContext.Provider value={{size, isSubmenu: true}}>
          <Provider
            values={[
              [HeaderContext, {
                slots: {
                  header: {className: sectionHeader()}
                }
              }],
            [HeadingContext, {className: sectionHeading()}],
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
        className={section()}>
        {props.children}
      </AriaSection>
      <Divider
        className={style({
          display: {
            default: 'grid',
            ':last-child': 'none'
          },
          gridColumn: '2 / -2',
          marginY: 2.5 // height of the menu separator is 12px, and the divider is 2px
        })()} />
    </>
  );
}

export function MenuItem(props: Omit<MenuItemProps, 'children'> & {children: ReactNode}) {
  let ref = useRef(null);
  let isLink = props.href != null;
  let {size} = useContext(InternalMenuContext);
  return (
    <AriaMenuItem
      {...props}
      ref={ref}
      style={pressScale(ref)}
      className={renderProps => menuitem({...renderProps, isFocused: (renderProps.hasSubmenu && renderProps.isOpen) || renderProps.isFocused, size, isLink})}>
      {composeRenderProps(props.children, (children, renderProps) => {
        let checkboxRenderProps = {...renderProps, size, isFocused: false, isFocusVisible: false, isIndeterminate: false, isReadOnly: false, isInvalid: false, isRequired: false};
        return (
          <>
            <Provider
              values={[
                [IconContext, {
                  slots: {
                    icon: {className: icon()},
                    descriptor: {className: descriptor()} // TODO: remove once we have default?
                  }
                }],
                [TextContext, {
                  slots: {
                    label: {className: label()},
                    description: {className: description({size})},
                    value: {className: value()}
                  }
                }],
                [KeyboardContext, {className: keyboard({size, isDisabled: renderProps.isDisabled})}],
                [ImageContext, {className: image({size})}]
              ]}>
              {renderProps.selectionMode === 'single' && !isLink && !renderProps.hasSubmenu && <CheckmarkIcon className={checkmark({...renderProps, size})} />}
              {renderProps.selectionMode === 'multiple' && !isLink && !renderProps.hasSubmenu && (
                <div className={mergeStyles(checkbox(), box(checkboxRenderProps))}>
                  <CheckmarkIcon className={iconStyles(checkboxRenderProps)} />
                </div>
              )}
              {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
              {isLink && <LinkOutIcon  slot="descriptor" className={descriptor()} />}
              {renderProps.hasSubmenu && <ChevronRightIcon  slot="descriptor" className={descriptor()} />}
            </Provider>
          </>
        );
      })}
    </AriaMenuItem>
  );
}

export {MenuTrigger, SubmenuTrigger};

// This is purely so that storybook generates the types for both Menu and MenuTrigger
interface ICombined<T extends object> extends MenuProps<T>, Omit<MenuTriggerProps, 'children'> {}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CombinedMenu<T extends object>(props: ICombined<T>) {
  return <div />;
}
