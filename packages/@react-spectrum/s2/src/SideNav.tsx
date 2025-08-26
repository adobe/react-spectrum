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
  Button,
  ButtonContext,
  ListLayout,
  Provider,
  TreeItemProps as RACTreeItemProps,
  TreeProps as RACTreeProps,
  Tree,
  TreeItem,
  TreeItemContent,
  TreeItemContentProps,
  TreeSection,
  SectionProps,
  TreeHeader,
  useContextProps,
  Virtualizer
} from 'react-aria-components';
import {centerBaseline} from './CenterBaseline';
import Chevron from '../ui-icons/Chevron';
import {edgeToText, focusRing, fontRelative, style} from '../style' with {type: 'macro'};
import {DOMRef, Key} from '@react-types/shared';
import {getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
import {raw} from '../style/style-macro' with {type: 'macro'};
import React, {createContext, forwardRef, JSXElementConstructor, ReactElement, ReactNode, useContext, useRef} from 'react';
import {TextContext} from './Content';
import {useDOMRef} from '@react-spectrum/utils';
import {useLocale} from 'react-aria';
import {useScale} from './utils';

interface S2TreeProps {
  // Only detatched is supported right now with the current styles from Spectrum
  isDetached?: boolean,
  onAction?: (key: Key) => void,
  // not fully supported yet
  isEmphasized?: boolean
}

export interface SideNavProps extends Omit<RACTreeProps<any>, 'style' | 'className' | 'onRowAction' | 'selectionBehavior' | 'onScroll' | 'onCellAction' | 'dragAndDropHooks'>, UnsafeStyles, S2TreeProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight
}

export interface SideNavItemProps extends Omit<RACTreeItemProps, 'className' | 'style'> {
  /** Whether this item has children, even if not loaded yet. */
  hasChildItems?: boolean,
  counter?: number
}


export interface SideNavCategoryProps extends Omit<RACTreeItemProps, 'className' | 'style' | 'href' | 'hrefLang' | 'target' | 'rel' | 'download' | 'ping' | 'referrerPolicy' | 'routerOptions'> {
  /** Whether this item has children, even if not loaded yet. */
  hasChildItems?: boolean,
  counter?: number
}

export interface SideNavSectionProps<T> extends SectionProps<T> {}
interface TreeRendererContextValue {
  renderer?: (item) => ReactElement<any, string | JSXElementConstructor<any>>
}
const TreeRendererContext = createContext<TreeRendererContextValue>({});


let InternalTreeContext = createContext<{counter?: number}>({});

// TODO: the below is needed so the borders of the top and bottom row isn't cut off if the SideNav is wrapped within a container by always reserving the 2px needed for the
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
  overflow: 'visible',
  boxSizing: 'border-box',
  '--indent': {
    type: 'width',
    value: 16
  }
}, getAllowedOverrides({height: true}));

function SideNav(props: SideNavProps, ref: DOMRef<HTMLDivElement>) {
  let {children, isDetached, isEmphasized, UNSAFE_className, UNSAFE_style} = props;
  let scale = useScale();



  let domRef = useDOMRef(ref);

  return (
    <Virtualizer
      layout={ListLayout}
      layoutOptions={{
        rowHeight: scale === 'large' ? 50 : 40,
        gap: 4
      }}>
      {/* <TreeRendererContext.Provider value={{renderer}}> */}
      <Tree
        {...props}
        style={UNSAFE_style}
        className={renderProps => (UNSAFE_className ?? '') + tree({isDetached, ...renderProps}, props.styles)}
        selectionBehavior="toggle"
        ref={domRef}>
        {props.children}
      </Tree>
      {/* </TreeRendererContext.Provider> */}
    </Virtualizer>
  );
}

// const selectedBackground = lightDark(colorMix('gray-25', 'informative-900', 10), colorMix('gray-25', 'informative-700', 10));
// const selectedActiveBackground = lightDark(colorMix('gray-25', 'informative-900', 15), colorMix('gray-25', 'informative-700', 15));

const treeRow = style({
  ...focusRing(),
  position: 'relative',
  display: 'flex',
  minHeight: 32,
  boxSizing: 'border-box',
  borderRadius: 'default',
  font: 'ui',
  color: {
    default: 'neutral-subdued',
    isHovered: 'gray-800'
  },
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  paddingX: 'edge-to-text',
  '--indicatorHeight': {
    type: 'height',
    value: 'calc((100% - 18px)/2)'
  },
  '--indicatorColor': {
    type: 'backgroundColor',
    value: {
      default: 'gray-400',
      isSelected: 'neutral'
    }
  }
});


const treeCellGrid = style({
  display: 'grid',
  width: 'full',
  height: 'full',
  boxSizing: 'border-box',
  alignContent: 'center',
  alignItems: 'center',
  gridTemplateColumns: ['auto', 'auto', '1fr', 'auto', 'auto'],
  gridTemplateRows: '1fr',
  gridTemplateAreas: [
    'level-padding icon content counter expand-button'
  ],
  color: {
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    }
  }
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
  textOverflow: 'ellipsis',
  whiteSpace: 'normal',
  overflow: 'hidden'
});

// const cellFocus = {
//   outlineStyle: {
//     default: 'none',
//     isFocusVisible: 'solid'
//   },
//   outlineOffset: -2,
//   outlineWidth: 2,
//   outlineColor: 'focus-ring',
//   borderRadius: '[6px]'
// } as const;

const treeRowFocusIndicator = raw(`
  &:before {
    content: "";
    display: inline-block;
    position: absolute;
    inset-inline-start: 0;
    width: 2px;
    height: 18px;
    top: var(--indicatorHeight);
    margin-inline-start: calc(calc(var(--tree-item-level, 0) - 1) * var(--indent) + 4px);
    z-index: 3;
    background-color: var(--indicatorColor);
    border-radius: 1px;
  }`
);

export const SideNavItem = (props: SideNavItemProps): ReactNode => {
  let {
    href,
    counter
  } = props;

  return (
    <InternalTreeContext.Provider value={{counter}}>
      <TreeItem
        {...props}
        className={(renderProps) => treeRow({
          ...renderProps,
          isLink: !!href
        }) + (renderProps.isFocusVisible || renderProps.isHovered || renderProps.isSelected ? ' ' + treeRowFocusIndicator : ' ')}>
        {props.children}
      </TreeItem>
    </InternalTreeContext.Provider>
  );
};

export const SideNavCategory = (props: SideNavCategoryProps): ReactNode => {

  return (
    <TreeItem
      {...props}
      className={(renderProps) => treeRow({
        ...renderProps,
      })}/>
  );
};
export interface SideNavItemContentProps extends Omit<TreeItemContentProps, 'children'> {
  /** Rendered contents of the tree item or child items. */
  children: ReactNode
}

export const SideNavItemContent = (props: SideNavItemContentProps): ReactNode => {
  let {
    children
  } = props;
  let {counter} = useContext(InternalTreeContext);
  let scale = useScale();

  return (
    <TreeItemContent>
      {({isExpanded, hasChildItems, selectionMode, selectionBehavior, isDisabled, isFocusVisible, isSelected, id, state, isHovered}) => {
        let isNextSelected = false;
        let isNextFocused = false;
        let keyAfter = state.collection.getKeyAfter(id);
        if (keyAfter != null) {
          isNextSelected = state.selectionManager.isSelected(keyAfter);
        }
        let isFirst = state.collection.getFirstKey() === id;
        return (
          <div className={treeCellGrid({isDisabled, isNextSelected, isSelected, isFirst, isNextFocused})}>
            <div
              className={style({
                gridArea: 'level-padding',
                width: 'calc(calc(var(--tree-item-level, 0) - 1) * var(--indent))'
              })} />
            <Provider
              values={[
                [TextContext, {styles: treeContent}],
                [IconContext, {
                  render: centerBaseline({slot: 'icon', styles: treeIcon}),
                  styles: style({size: fontRelative(20), flexShrink: 0})
                }]
              ]}>
              {children}
            </Provider>
            {/* {isFocusVisible && isDetached && <div role="presentation" className={style({...cellFocus, position: 'absolute', inset: 0})({isFocusVisible: true})} />} */}
            <div className={style({gridArea: 'counter'})}>{counter}</div>
            <ExpandableRowChevron isDisabled={isDisabled} isExpanded={isExpanded} scale={scale} isHidden={!(hasChildItems)} />
          </div>
        );
      }}
    </TreeItemContent>
  );
};

interface ExpandableRowChevronProps {
  isExpanded?: boolean,
  isDisabled?: boolean,
  isRTL?: boolean,
  scale: 'medium' | 'large',
  isHidden?: boolean
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
  height: 40,
  width: 40,
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
  let [fullProps, ref] = useContextProps({...props, slot: 'chevron'}, expandButtonRef, ButtonContext);
  let {isExpanded, scale, isHidden} = fullProps;
  let {direction} = useLocale();

  return (
    <Button
      {...props}
      ref={ref}
      slot="chevron"
      className={renderProps => expandButton({...renderProps, isExpanded, isRTL: direction === 'rtl', scale, isHidden})}>
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
        })({direction})} />
    </Button>
  );
}

export function SideNavSection<T extends object>(props: SideNavSectionProps<T>) {
  return (
      <TreeSection
        {...props}>
        {props.children}
      </TreeSection>
  );
};

export const SideNavHeader = forwardRef<HTMLElement, {children: ReactNode}>((props, ref) => {
  return (
    <TreeHeader ref={ref} className={style({font: 'ui-sm', paddingStart: edgeToText(32)})}>
      {props.children}
    </TreeHeader>
  );
});

/**
 * A tree view provides users with a way to navigate nested hierarchical information.
 */
const _SideNav = forwardRef(SideNav);
export {_SideNav as SideNav};
