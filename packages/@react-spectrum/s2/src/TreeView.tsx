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
  useContextProps,
  Virtualizer
} from 'react-aria-components';
import {centerBaseline} from './CenterBaseline';
import {Checkbox} from './Checkbox';
import Chevron from '../ui-icons/Chevron';
import {colorMix, focusRing, fontRelative, lightDark, style} from '../style' with {type: 'macro'};
import {DOMRef, Key} from '@react-types/shared';
import {getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
import {isAndroid} from '@react-aria/utils';
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

export interface TreeViewProps extends Omit<RACTreeProps<any>, 'style' | 'className' | 'onRowAction' | 'selectionBehavior' | 'onScroll' | 'onCellAction' | 'dragAndDropHooks'>, UnsafeStyles, S2TreeProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight
}

export interface TreeViewItemProps extends Omit<RACTreeItemProps, 'className' | 'style'> {
  /** Whether this item has children, even if not loaded yet. */
  hasChildItems?: boolean
}

interface TreeRendererContextValue {
  renderer?: (item) => ReactElement<any, string | JSXElementConstructor<any>>
}
const TreeRendererContext = createContext<TreeRendererContextValue>({});


let InternalTreeContext = createContext<{isDetached?: boolean, isEmphasized?: boolean}>({});

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
  overflow: 'auto',
  boxSizing: 'border-box',
  justifyContent: {
    isEmpty: 'center'
  },
  alignItems: {
    isEmpty: 'center'
  },
  '--indent': {
    type: 'width',
    value: 16
  }
}, getAllowedOverrides({height: true}));

function TreeView(props: TreeViewProps, ref: DOMRef<HTMLDivElement>) {
  let {children, isDetached, isEmphasized, UNSAFE_className, UNSAFE_style} = props;
  let scale = useScale();

  let renderer;
  if (typeof children === 'function') {
    renderer = children;
  }

  let domRef = useDOMRef(ref);

  return (
    <Virtualizer
      layout={ListLayout}
      layoutOptions={{
        rowHeight: scale === 'large' ? 50 : 40,
        gap: isDetached ? 2 : 0
      }}>
      <TreeRendererContext.Provider value={{renderer}}>
        <InternalTreeContext.Provider value={{isDetached, isEmphasized}}>
          <Tree
            {...props}
            style={UNSAFE_style}
            className={renderProps => (UNSAFE_className ?? '') + tree({isDetached, ...renderProps}, props.styles)}
            selectionBehavior="toggle"
            ref={domRef}>
            {props.children}
          </Tree>
        </InternalTreeContext.Provider>
      </TreeRendererContext.Provider>
    </Virtualizer>
  );
}

const selectedBackground = lightDark(colorMix('gray-25', 'informative-900', 10), colorMix('gray-25', 'informative-700', 10));
const selectedActiveBackground = lightDark(colorMix('gray-25', 'informative-900', 15), colorMix('gray-25', 'informative-700', 15));

const rowBackgroundColor = {
  default: '--s2-container-bg',
  isFocusVisibleWithin: colorMix('gray-25', 'gray-900', 7),
  isHovered: colorMix('gray-25', 'gray-900', 7),
  isPressed: colorMix('gray-25', 'gray-900', 10),
  isSelected: {
    default: colorMix('gray-25', 'gray-900', 7),
    isEmphasized: selectedBackground,
    isFocusVisibleWithin: {
      default: colorMix('gray-25', 'gray-900', 10),
      isEmphasized: selectedActiveBackground
    },
    isHovered: {
      default: colorMix('gray-25', 'gray-900', 10),
      isEmphasized: selectedActiveBackground
    },
    isPressed: {
      default: colorMix('gray-25', 'gray-900', 10),
      isEmphasized: selectedActiveBackground
    }
  },
  forcedColors: {
    default: 'Background'
  }
} as const;

const treeRow = style({
  position: 'relative',
  display: 'flex',
  height: 40,
  width: 'full',
  boxSizing: 'border-box',
  font: 'ui',
  color: 'body',
  outlineStyle: 'none',
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  '--rowBackgroundColor': {
    type: 'backgroundColor',
    value: rowBackgroundColor
  },
  '--rowFocusIndicatorColor': {
    type: 'outlineColor',
    value: {
      default: 'focus-ring',
      forcedColors: 'Highlight'
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
  gridTemplateColumns: ['auto', 'auto', 'auto', 'auto', 'auto', '1fr', 'minmax(0, auto)', 'auto'],
  gridTemplateRows: '1fr',
  gridTemplateAreas: [
    'drag-handle checkbox level-padding expand-button icon content actions actionmenu'
  ],
  backgroundColor: '--rowBackgroundColor',
  paddingEnd: 4, // account for any focus rings on the last item in the cell
  color: {
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    }
  },
  '--rowSelectedBorderColor': {
    type: 'outlineColor',
    value: {
      default: 'gray-800',
      isFocusVisible: 'focus-ring',
      forcedColors: 'Highlight'
    }
  },
  '--rowForcedFocusBorderColor': {
    type: 'outlineColor',
    value: {
      default: 'focus-ring',
      forcedColors: 'Highlight'
    }
  },
  borderColor: {
    isDetached: {
      default: 'transparent',
      isSelected: '--rowSelectedBorderColor'
    }
  },
  borderWidth: {
    isDetached: 1
  },
  borderRadius: {
    isDetached: 'default'
  },
  borderStyle: {
    isDetached: 'solid'
  }
});

const treeCheckbox = style({
  gridArea: 'checkbox',
  marginStart: 12,
  marginEnd: 0,
  paddingEnd: 0
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
  whiteSpace: 'nowrap',
  overflow: 'hidden'
});

const treeActions = style({
  gridArea: 'actions',
  /* TODO: I made this one up, confirm desired behavior. These paddings are to make sure the action group has enough padding for the focus ring */
  marginStart: 2,
  marginEnd: 4
});

const treeActionMenu = style({
  gridArea: 'actionmenu'
});

const cellFocus = {
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  outlineOffset: -2,
  outlineWidth: 2,
  outlineColor: 'focus-ring',
  borderRadius: '[6px]'
} as const;

const treeRowFocusIndicator = raw(`
  &:before {
    content: "";
    display: inline-block;
    position: sticky;
    inset-inline-start: 0;
    width: 3px;
    height: 100%;
    margin-inline-end: -3px;
    margin-block-end: 1px;
    z-index: 3;
    background-color: var(--rowFocusIndicatorColor);
  }`
);

export const TreeViewItem = (props: TreeViewItemProps): ReactNode => {
  let {
    href
  } = props;
  let {isDetached, isEmphasized} = useContext(InternalTreeContext);

  return (
    <TreeItem
      {...props}
      className={(renderProps) => treeRow({
        ...renderProps,
        isLink: !!href, isEmphasized
      }) + (renderProps.isFocusVisible && !isDetached ? ' ' + treeRowFocusIndicator : '')} />
  );
};

export interface TreeViewItemContentProps extends Omit<TreeItemContentProps, 'children'> {
  /** Rendered contents of the tree item or child items. */
  children: ReactNode
}

export const TreeViewItemContent = (props: TreeViewItemContentProps): ReactNode => {
  let {
    children
  } = props;
  let {isDetached, isEmphasized} = useContext(InternalTreeContext);
  let scale = useScale();

  return (
    <TreeItemContent>
      {({isExpanded, hasChildItems, selectionMode, selectionBehavior, isDisabled, isFocusVisible, isSelected, id, state}) => {
        let isNextSelected = false;
        let isNextFocused = false;
        let keyAfter = state.collection.getKeyAfter(id);
        if (keyAfter != null) {
          isNextSelected = state.selectionManager.isSelected(keyAfter);
        }
        let isFirst = state.collection.getFirstKey() === id;
        return (
          <div className={treeCellGrid({isDisabled, isNextSelected, isSelected, isFirst, isNextFocused, isDetached})}>
            {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
              // TODO: add transition?
              <div className={treeCheckbox}>
                <Checkbox
                  isEmphasized={isEmphasized}
                  slot="selection" />
              </div>
            )}
            <div
              className={style({
                gridArea: 'level-padding',
                width: '[calc(calc(var(--tree-item-level, 0) - 1) * var(--indent))]'
              })} />
            {/* TODO: revisit when we do async loading, at the moment hasChildItems will only cause the chevron to be rendered, no aria/data attributes indicating the row's expandability are added */}
            <ExpandableRowChevron isDisabled={isDisabled} isExpanded={isExpanded} scale={scale} isHidden={!(hasChildItems)} />
            <Provider
              values={[
                [TextContext, {styles: treeContent}],
                [IconContext, {
                  render: centerBaseline({slot: 'icon', styles: treeIcon}),
                  styles: style({size: fontRelative(20), flexShrink: 0})
                }],
                [ActionButtonGroupContext, {styles: treeActions}],
                [ActionMenuContext, {styles: treeActionMenu, isQuiet: true}]
              ]}>
              {children}
            </Provider>
            {isFocusVisible && isDetached && <div role="presentation" className={style({...cellFocus, position: 'absolute', inset: 0})({isFocusVisible: true})} />}
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
    default: '[inherit]',
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
  let {isExpanded, isDisabled, scale, isHidden} = fullProps;
  let {direction} = useLocale();
  isDisabled = isDisabled || isHidden;

  return (
    <Button
      {...props}
      ref={ref}
      slot="chevron"
      // Override tabindex so that grid keyboard nav skips over it. Needs -1 so android talkback can actually "focus" it
      excludeFromTabOrder={isAndroid() && !isDisabled}
      preventFocusOnPress
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

/**
 * A tree view provides users with a way to navigate nested hierarchical information.
 */
const _TreeView = forwardRef(TreeView);
export {_TreeView as TreeView};
