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

import {ActionButtonGroupContext} from './ActionButtonGroup';
import {ActionMenuContext} from './ActionMenu';
import {baseColor, focusRing, space, style} from '../style' with {type: 'macro'};
import {Button, ButtonContext} from 'react-aria-components/Button';
import {centerBaseline} from './CenterBaseline';
import {
  centerPadding,
  getAllowedOverrides,
  StylesPropWithHeight,
  UnsafeStyles
} from './style-utils' with {type: 'macro'};
import Chevron from '../ui-icons/Chevron';
import {createContext, forwardRef, ReactNode, useContext, useRef, useState} from 'react';
import {DOMRef, forwardRefType, GlobalDOMAttributes} from '@react-types/shared';
import {IconContext} from './Icon';
import {Link} from 'react-aria-components/Link';
import {
  NavigationTree,
  NavigationTreeHeader,
  NavigationTreeHeaderProps,
  NavigationTreeItem,
  NavigationTreeItemContent,
  NavigationTreeItemContentRenderProps,
  NavigationTreeItemProps,
  NavigationTreeProps,
  NavigationTreeSection,
  NavigationTreeSectionProps
} from 'react-aria-components/NavigationTree';
import {pressScale} from './pressScale';
import {Provider, useContextProps} from 'react-aria-components/slots';
import {Text, TextContext} from './Content';
import {useDOMRef} from './useDOMRef';
import {useLocale} from 'react-aria/I18nProvider';
import {useScale} from './utils';

export interface SideNavProps<T>
  extends
    Omit<NavigationTreeProps<T>, 'style' | 'className' | 'render' | keyof GlobalDOMAttributes>,
    UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight;
}

export interface SideNavItemProps extends Omit<
  NavigationTreeItemProps,
  | 'className'
  | 'style'
  | 'render'
  | 'onClick'
  | 'allowsArrowNavigation'
  | 'focusMode'
  | 'value'
  | 'onAction'
  | keyof GlobalDOMAttributes
> {
  /** A string representation of the side nav item's contents, used for features like typeahead. */
  textValue: string;
  /** Whether this item has children. */
  hasChildItems?: boolean;
}

const sideNavWrapper = style(
  {
    minHeight: 0,
    height: 'full',
    minWidth: 160,
    display: 'flex',
    isolation: 'isolate',
    disableTapHighlight: true,
    position: 'relative',
    overflow: 'clip'
  },
  getAllowedOverrides({height: true})
);

// TODO: the below is needed so the borders of the top and bottom row isn't cut off if the TreeView is wrapped within a container by always reserving the 2px needed for the
// keyboard focus ring. Perhaps find a different way of rendering the outlines since the top of the item doesn't
// scroll into view due to how the ring is offset. Alternatively, have the tree render the top/bottom outline like it does in Listview
const tree = style({
  ...focusRing(),
  outlineOffset: -2, // make certain we are visible inside overflow hidden containers
  userSelect: 'none',
  minHeight: 0,
  minWidth: 0,
  width: 'full',
  height: 'full',
  overflowY: 'auto',
  overflowX: 'hidden',
  boxSizing: 'border-box',
  paddingBottom: 0,
  scrollPaddingBottom: 0,
  '--indent': {
    type: 'width',
    value: 16
  }
});

/**
 * A SideNav provides users with a way to navigate nested hierarchical set of links.
 */
export const SideNav = /*#__PURE__*/ (forwardRef as forwardRefType)(function SideNav<T>(
  props: SideNavProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  let {children, UNSAFE_className, UNSAFE_style, selectedRoute, ...rest} = props;

  let domRef = useDOMRef(ref);

  return (
    <div
      ref={domRef}
      className={(UNSAFE_className ?? '') + sideNavWrapper(null, props.styles)}
      style={UNSAFE_style}>
      <NavigationTree
        {...rest}
        selectedRoute={selectedRoute}
        className={renderProps => tree(renderProps)}>
        {children}
      </NavigationTree>
    </div>
  );
});

const treeRow = style({
  outlineStyle: 'none',
  position: 'relative',
  display: 'flex',
  minHeight: 32,
  width: 'full',
  boxSizing: 'border-box',
  font: 'ui',
  color: {
    default: baseColor('neutral-subdued'),
    forcedColors: 'ButtonText'
  },
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  borderRadius: 'sm',
  marginTop: {
    default: space(6),
    ':first-child': 0
  },
  '--centerPadding': {
    type: 'paddingTop',
    value: centerPadding()
  },
  transition: 'default'
});

const treeCellGrid = style({
  display: 'grid',
  width: 'full',
  minHeight: 'full',
  boxSizing: 'border-box',
  alignContent: 'center',
  alignItems: 'center',
  gridTemplateColumns: [12, 'auto', 'auto', '1fr', 'auto', 'auto'],
  gridTemplateRows: '1fr',
  gridTemplateAreas: ['. level-padding icon content actions actionmenu'],
  paddingEnd: 4, // account for any focus rings on the last item in the cell
  color: {
    default: baseColor('neutral-subdued'),
    isSelected: baseColor('neutral'),
    isDescendantSelected: baseColor('neutral'),
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    },
    forcedColors: 'ButtonText'
  },
  fontWeight: {
    isSelected: 'bold',
    isDescendantSelected: 'bold'
  },
  transition: 'default',
  forcedColorAdjust: 'none'
});

const treeIcon = style({
  gridArea: 'icon',
  marginEnd: 'text-to-visual',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

const treeContent = style({
  gridArea: 'content',
  paddingY: `--centerPadding`
});

let treeRowFocusRing = style({
  ...focusRing(),
  outlineOffset: -2,
  outlineWidth: 2,
  outlineColor: {
    default: 'focus-ring',
    forcedColors: 'ButtonBorder'
  },
  position: 'absolute',
  inset: 0,
  top: 0,
  bottom: 0,
  borderRadius: 'default', // tokens say 12... but that seems a lot, should it match selection in other collections?
  zIndex: 1,
  pointerEvents: 'none'
});

const treeRowLink = style({
  display: 'grid',
  gridArea: 'content',
  gridTemplateColumns: ['auto', '1fr'],
  gridTemplateAreas: ['icon content'],
  alignItems: 'center',
  minWidth: 0,
  outlineStyle: 'none',
  textDecoration: 'none',
  color: 'inherit',
  cursor: {
    default: 'pointer',
    isDisabled: 'default'
  }
});

const treeActions = style({
  gridArea: 'actions',
  marginStart: 2,
  marginEnd: 4
});

const treeActionMenu = style({
  gridArea: 'actionmenu'
});

const SideNavItemLinkContext = createContext<{
  isDisabled?: boolean;
  onPressChange?: (isPressed: boolean) => void;
}>({});

const SideNavInternalItemContext = createContext<{setLinkPressed?: (isPressed: boolean) => void}>(
  {}
);

export const SideNavItem = (props: SideNavItemProps): ReactNode => {
  let [isLinkPressed, setLinkPressed] = useState(false);
  let rowRef = useRef<HTMLDivElement | null>(null);
  // oxlint-disable-next-line react-compiler
  let scaling = pressScale(rowRef);

  return (
    <SideNavInternalItemContext.Provider value={{setLinkPressed}}>
      <NavigationTreeItem
        {...props}
        ref={rowRef}
        style={({isPressed}) => scaling({isPressed: isLinkPressed || isPressed})}
        className={renderProps => treeRow(renderProps)}
      />
    </SideNavInternalItemContext.Provider>
  );
};

export interface SideNavItemContentProps {
  /** Rendered contents of the side nav item or child items. */
  children: ReactNode;
}

const indicator = style<{isDisabled: boolean; isSelected: boolean; isHovered: boolean}>({
  position: 'absolute',
  display: {
    default: 'none',
    isSelected: 'block',
    isHovered: 'block'
  },
  backgroundColor: {
    isHovered: 'gray-400',
    isSelected: 'gray-800',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  height: 18,
  width: '[2px]',
  contain: 'strict',
  top: '50%',
  transform: 'translateY(-50%)',
  '--indicator-indent': {
    type: 'width',
    value: 4
  },
  insetStart:
    '[calc(calc(var(--tree-item-level, 0) - 1) * var(--indent) + var(--indicator-indent))]',
  borderStyle: 'none',
  borderRadius: 'full'
});

export const SideNavItemContent = (props: SideNavItemContentProps): ReactNode => {
  let {children} = props;
  let scale = useScale();
  let {setLinkPressed} = useContext(SideNavInternalItemContext);
  return (
    <NavigationTreeItemContent>
      {(renderProps: NavigationTreeItemContentRenderProps) => (
        <SideNavItemContentInner {...renderProps} scale={scale} setLinkPressed={setLinkPressed}>
          {children}
        </SideNavItemContentInner>
      )}
    </NavigationTreeItemContent>
  );
};

const SideNavItemContentInner = props => {
  let {
    isExpanded,
    hasChildItems,
    isDisabled,
    isCurrent,
    isCurrentAncestor,
    isHovered,
    isFocusVisible,
    scale,
    setLinkPressed,
    children
  } = props;

  return (
    <>
      <div
        className={treeRowFocusRing({
          isFocusVisible,
          isSelected: isCurrent
        })}
      />
      <div
        className={treeCellGrid({
          isDisabled,
          isSelected: isCurrent,
          isDescendantSelected: isCurrentAncestor && !isExpanded
        })}>
        <div
          className={indicator({
            isDisabled,
            isSelected: isCurrent,
            isHovered
          })}
        />
        <div
          className={style({
            gridArea: 'level-padding',
            width: 'calc(calc(var(--tree-item-level, 0) - 1) * var(--indent))'
          })}
        />
        <Provider
          values={[
            [TextContext, {styles: treeContent}],
            [
              SideNavItemLinkContext,
              {
                isDisabled,
                onPressChange: setLinkPressed
              }
            ],
            [
              IconContext,
              {
                render: centerBaseline({slot: 'icon', styles: treeIcon}),
                styles: style({size: '1lh', flexShrink: 0})
              }
            ],
            [ActionButtonGroupContext, {styles: treeActions, isDisabled, size: 'S'}],
            [ActionMenuContext, {styles: treeActionMenu, isQuiet: true, isDisabled, size: 'S'}]
          ]}>
          {typeof children === 'string' ? <Text>{children}</Text> : children}
        </Provider>
      </div>
      <ExpandableRowChevron
        isDisabled={isDisabled}
        isExpanded={isExpanded}
        scale={scale}
        isHidden={!hasChildItems}
      />
    </>
  );
};

interface ExpandableRowChevronProps {
  isExpanded?: boolean;
  isDisabled?: boolean;
  isRTL?: boolean;
  scale: 'medium' | 'large';
  isHidden?: boolean;
}

const expandButton = style<ExpandableRowChevronProps>({
  gridArea: 'expand-button',
  color: {
    default: 'inherit',
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  height: 32,
  width: 32,
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'center',
  justifyContent: 'center',
  outlineStyle: 'none',
  cursor: 'default',
  transform: {
    isExpanded: {
      default: 'rotate(90deg)',
      isRTL: 'rotate(-90deg)'
    }
  },
  padding: 0,
  transition: 'default',
  backgroundColor: 'transparent',
  borderStyle: 'none',
  disableTapHighlight: true,
  visibility: {
    isHidden: 'hidden'
  }
});

function ExpandableRowChevron(props: ExpandableRowChevronProps) {
  let expandButtonRef = useRef<HTMLButtonElement>(null);
  let [fullProps, ref] = useContextProps(
    {...props, slot: 'chevron'},
    expandButtonRef,
    ButtonContext
  );
  let {isExpanded, scale, isHidden} = fullProps;
  let {direction} = useLocale();

  return (
    <Button
      {...props}
      ref={ref}
      slot="chevron"
      className={renderProps =>
        expandButton({...renderProps, isExpanded, isRTL: direction === 'rtl', scale, isHidden})
      }>
      <Chevron
        className={style({
          scale: {
            direction: {
              ltr: '1',
              rtl: '-1'
            }
          },
          '--iconPrimary': {
            type: 'fill',
            value: 'currentColor'
          }
        })({direction})}
      />
    </Button>
  );
}

export interface SideNavSectionProps<T> extends Omit<
  NavigationTreeSectionProps<T>,
  'value' | 'render' | 'style' | 'className'
> {}

export function SideNavSection<T extends object>(props: SideNavSectionProps<T>) {
  return (
    <NavigationTreeSection {...props} className={style({marginTop: {':not(:first-child)': 24}})}>
      {props.children}
    </NavigationTreeSection>
  );
}

export interface SideNavHeaderProps extends Omit<
  NavigationTreeHeaderProps,
  'value' | 'render' | 'style' | 'className'
> {}

export const SideNavHeader = (props: SideNavHeaderProps): ReactNode => {
  return (
    <NavigationTreeHeader
      className={style({
        font: 'ui-sm',
        // Component/S/Medium for the font, doesn't appear to match our fonts
        fontWeight: 'medium',
        color: 'gray-600',
        paddingStart: 'edge-to-text',
        marginBottom: '[8px]',
        height: 16
      })}>
      {props.children}
    </NavigationTreeHeader>
  );
};

export interface SideNavItemLinkProps {
  /** Rendered contents of the link. */
  children?: ReactNode;
}

export const SideNavItemLink = (props: SideNavItemLinkProps): ReactNode => {
  let {children} = props;
  let linkFocus = useContext(SideNavItemLinkContext);

  return (
    <Link {...props} {...linkFocus} className={treeRowLink({isDisabled: linkFocus.isDisabled})}>
      <Provider
        values={[
          [TextContext, {styles: treeContent}],
          [
            IconContext,
            {
              render: centerBaseline({slot: 'icon', styles: treeIcon}),
              styles: style({size: '1lh', flexShrink: 0})
            }
          ]
        ]}>
        {typeof children === 'string' ? <Text>{children}</Text> : children}
      </Provider>
    </Link>
  );
};
