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
import {baseColor, edgeToText, focusRing, fontRelative, space, style} from '../style' with {type: 'macro'};
import {centerBaseline} from './CenterBaseline';
import {
  ContextValue,
  DEFAULT_SLOT,
  GridList,
  GridListItem,
  GridListItemProps,
  GridListItemRenderProps,
  GridListProps,
  GridListRenderProps,
  ListLayout,
  Provider,
  SlotProps,
  Virtualizer
} from 'react-aria-components';
import {controlFont, getAllowedOverrides, StyleProps, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, JSXElementConstructor, ReactElement, ReactNode, useContext, useRef} from 'react';
import {DOMProps, DOMRef, DOMRefValue, forwardRefType, GlobalDOMAttributes} from '@react-types/shared';
import {IconContext} from './Icon';
import {ImageContext} from './Image';
import {pressScale} from './pressScale';
import {Text, TextContext} from './Content';
import {useDOMRef} from '@react-spectrum/utils';
import {useScale} from './utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ListViewProps<T> extends Omit<GridListProps<T>, 'className' | 'style' | 'children' | keyof GlobalDOMAttributes>, DOMProps, UnsafeStyles, ListViewStylesProps, SlotProps {
  styles?: StylesPropWithHeight,
  /**
   * Whether to automatically focus the Inline Alert when it first renders.
   */
  autoFocus?: boolean,
  children: ReactNode | ((item: T) => ReactNode)
}

interface ListViewStylesProps {
  isQuiet?: boolean,
  isEmphasized?: boolean,
  selectionStyle?: 'highlight' | 'checkbox',
  highlightMode?: 'normal' | 'inverse'
}

export interface ListViewItemProps extends Omit<GridListItemProps, 'children' | 'style' | 'className'>, StyleProps {
  /**
   * The contents of the item.
   */
  children: ReactNode
}

interface ListViewRendererContextValue {
  renderer?: (item) => ReactElement<any, string | JSXElementConstructor<any>>
}
const ListViewRendererContext = createContext<ListViewRendererContextValue>({});

export const ListViewContext = createContext<ContextValue<Partial<ListViewProps<any>>, DOMRefValue<HTMLDivElement>>>(null);

let InternalListViewContext = createContext<{isQuiet?: boolean, isEmphasized?: boolean, highlightMode?: 'normal' | 'inverse'}>({});

const listView = style<GridListRenderProps & {isQuiet?: boolean}>({
  ...focusRing(),
  outlineOffset: -2, // make certain we are visible inside overflow hidden containers
  userSelect: 'none',
  minHeight: 0,
  minWidth: 0,
  width: 'full',
  height: 'full',
  boxSizing: 'border-box',
  overflow: 'auto',
  fontSize: controlFont(),
  borderRadius: 'default',
  borderColor: 'gray-300',
  borderWidth: 1,
  borderStyle: 'solid'
}, getAllowedOverrides({height: true}));

export const ListView = /*#__PURE__*/ (forwardRef as forwardRefType)(function ListView<T extends object>(
  props: ListViewProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  [props, ref] = useSpectrumContextProps(props, ref, ListViewContext);
  let {children, isQuiet, isEmphasized, highlightMode} = props;
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
        rowHeight: scale === 'large' ? 50 : 40
      }}>
      <ListViewRendererContext.Provider value={{renderer}}>
        <InternalListViewContext.Provider value={{isQuiet, isEmphasized, highlightMode}}>
          <GridList
            ref={domRef}
            {...props}
            style={props.UNSAFE_style}
            className={(renderProps) => (props.UNSAFE_className || '') + listView({
              ...renderProps,
              isQuiet
            }, props.styles)}>
            {children}
          </GridList>
        </InternalListViewContext.Provider>
      </ListViewRendererContext.Provider>
    </Virtualizer>
  );
});

const listitem = style<GridListItemRenderProps & {isFocused: boolean, isLink?: boolean, isQuiet?: boolean, isFirstItem?: boolean, isLastItem?: boolean, isEmphasized?: boolean, highlightMode?: 'normal' | 'inverse'}>({
  ...focusRing(),
  outlineOffset: 0,
  columnGap: 0,
  paddingX: 0,
  paddingBottom: '--labelPadding',
  backgroundColor: {
    default: 'transparent',
    isHovered: 'gray-100',
    isSelected: 'gray-100',
    highlightMode: {
      normal: {
        isEmphasized: {
          isSelected: 'blue-200'
        }
      },
      inverse: {
        isEmphasized: {
          isSelected: 'blue-800'
        }
      }
    }
  },
  color: {
    default: baseColor('neutral-subdued'),
    isHovered: 'gray-800',
    isSelected: {
      highlightMode: {
        normal: 'gray-900',
        inverse: 'gray-25'
      }
    },
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  position: 'relative',
  gridColumnStart: 1,
  gridColumnEnd: -1,
  display: 'grid',
  gridTemplateAreas: [
    '. checkmark icon label       actions chevron .',
    '. .         .    description actions chevron .'
  ],
  gridTemplateColumns: [edgeToText(40), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', edgeToText(40)],
  gridTemplateRows: '1fr auto',
  rowGap: {
    ':has([slot=description])': space(1)
  },
  alignItems: 'baseline',
  height: 'full',
  textDecoration: 'none',
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  transition: 'default',
  borderColor: {
    default: 'gray-300',
    forcedColors: 'ButtonBorder'
  },
  borderBottomWidth: 1,
  borderTopWidth: 0,
  borderXWidth: 0,
  borderStyle: 'solid'
}, getAllowedOverrides());

export let label = style({
  gridArea: 'label',
  alignSelf: 'center',
  font: controlFont(),
  color: 'inherit',
  fontWeight: {
    default: 'normal',
    isSelected: 'bold'
  },
  // TODO: token values for padding not defined yet, revisit
  marginTop: '--labelPadding',
  truncate: true
});

export let description = style({
  gridArea: 'description',
  alignSelf: 'center',
  font: 'ui-sm',
  color: {
    default: baseColor('neutral-subdued'),
    // Ideally this would use the same token as hover, but we don't have access to that here.
    // TODO: should we always consider isHovered and isFocused to be the same thing?
    isFocused: 'gray-800',
    isDisabled: 'disabled'
  },
  transition: 'default'
});

export let iconCenterWrapper = style({
  display: 'flex',
  gridArea: 'icon',
  alignSelf: 'center'
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

let image = style({
  gridArea: 'icon',
  gridRowEnd: 'span 2',
  marginEnd: 'text-to-visual',
  alignSelf: 'center',
  borderRadius: 'sm',
  height: 'calc(100% - 12px)',
  aspectRatio: 'square',
  objectFit: 'contain'
});

let actionButtonGroup = style({
  gridArea: 'actions',
  gridRowEnd: 'span 2',
  alignSelf: 'center',
  justifySelf: 'end',
  marginStart: 'text-to-visual'
});

export function ListViewItem(props: ListViewItemProps): ReactNode {
  let ref = useRef(null);
  let isLink = props.href != null;
  // let isLinkOut = isLink && props.target === '_blank';
  let {isQuiet, isEmphasized, highlightMode} = useContext(InternalListViewContext);
  let textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  // let {direction} = useLocale();
  return (
    <GridListItem
      {...props}
      textValue={textValue}
      ref={ref}
      style={pressScale(ref, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + listitem({
        ...renderProps,
        isLink,
        isQuiet,
        isEmphasized,
        highlightMode
      }, props.styles)}>
      {(renderProps) => {
        let {children} = props;
        return (
          <Provider
            values={[
              [TextContext, {
                slots: {
                  [DEFAULT_SLOT]: {styles: label(renderProps)},
                  label: {styles: label(renderProps)},
                  description: {styles: description(renderProps)}
                }
              }],
              [IconContext, {
                slots: {
                  icon: {render: centerBaseline({slot: 'icon', styles: iconCenterWrapper}), styles: icon}
                }
              }],
              [ImageContext, {styles: image}],
              [ActionButtonGroupContext, {
                styles: actionButtonGroup,
                size: 'S',
                isQuiet: true,
                staticColor: highlightMode === 'inverse' && renderProps.isSelected ? 'white' : undefined // how to invert this and react to color scheme? also, too bright/bold in dark mode unselected
              }]
            ]}>
            {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
          </Provider>
        );
      }}
    </GridListItem>
  );
}
