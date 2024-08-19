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

import {Breadcrumb as AriaBreadcrumb, BreadcrumbsProps as AriaBreadcrumbsProps, ContextValue, HeadingContext, Link, Provider, Breadcrumbs as RACBreadcrumbs, useSlottedContext} from 'react-aria-components';
import {AriaBreadcrumbItemProps, useLocale} from 'react-aria';
import ChevronIcon from '../ui-icons/Chevron';
import {createContext, forwardRef, ReactNode, RefObject, useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {DOMRef, DOMRefValue, Collection, Node} from '@react-types/shared';
import {focusRing, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {forwardRefType} from './types';
import {size, style} from '../style/spectrum-theme' with { type: 'macro' };
import {useDOMRef} from '@react-spectrum/utils';
import { useSpectrumContextProps } from './useSpectrumContextProps';
import { CollectionBuilder, createHideableComponent, createLeafComponent } from '@react-aria/collections';
import { useLayoutEffect, useResizeObserver } from '@react-aria/utils';
import { ActionButtonProps, ActionButton as S2ActionButton } from './ActionButton';
import FolderIcon from '../s2wf-icons/S2_Icon_FolderBreadcrumb_20_N.svg';
import { composeRenderProps, CollectionRenderer, UNSTABLE_CollectionRendererContext} from 'react-aria-components';
import { Menu, MenuItem, MenuTrigger } from './Menu';
import {Text} from './Content';
import { Default } from '@react-aria/utils/stories/platform.stories';
import { UNSTABLE_DefaultCollectionRenderer } from 'react-aria-components';

interface BreadcrumbsStyleProps {
  /**
   * Size of the Breadcrumbs including spacing and layout.
   *
   * @default 'M'
   */
  size?: 'M' | 'L',
  /** Whether the breadcrumbs are disabled. */
  isDisabled?: boolean
  /**
   * Whether to place the last Breadcrumb item onto a new line.
   */
  // TODO: isMultiline?: boolean
  /** Whether to always show the root item if the items are collapsed. */
  // TODO: showRoot?: boolean,
}

export interface BreadcrumbsProps<T> extends Omit<AriaBreadcrumbsProps<T>, 'children' | 'items' | 'style' | 'className'>, BreadcrumbsStyleProps, StyleProps {
  /** The children of the Breadcrumbs. */
  children?: ReactNode
}

export const BreadcrumbsContext = createContext<ContextValue<BreadcrumbsProps<any>, DOMRefValue<HTMLDivElement>>>(null);

const wrapper = style<BreadcrumbsStyleProps>({
  position: 'relative',
  display: 'flex',
  justifyContent: 'start',
  listStyleType: 'none',
  flexWrap: 'nowrap',
  flexGrow: 1,
  flexShrink: 0,
  flexBasis: 0,
  gap: {
    size: {
      M: size(6), // breadcrumbs-text-to-separator-medium
      L: size(9) // breadcrumbs-text-to-separator-large
    }
  },
  padding: 0,
  transition: 'default',
  marginTop: 0,
  marginBottom: 0,
  marginStart: {
    size: {
      M: size(6),
      L: size(9)
    }
  }
}, getAllowedOverrides());

const InternalBreadcrumbsContext = createContext<BreadcrumbsProps<any>>({});

function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>, ref: DOMRef<HTMLOListElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, BreadcrumbsContext);
  let domRef = useDOMRef(ref);
  let {
    UNSAFE_className = '',
    UNSAFE_style,
    styles,
    size = 'M',
    children,
    ...otherProps
  } = props;
  return (
    <Provider
      values={[
        [InternalBreadcrumbsContext, {size}]
      ]}>
      {/* invisible collection for measuring */}
      {/* <HiddenBreadcrumbs items={items} hiddenBreadcrumbsRef={hiddenBreadcrumbsRef} size={size} /> */}

        <CollapsingCollection count={2}>
          <RACBreadcrumbs
            {...otherProps}
            ref={domRef}
            style={UNSAFE_style}
            className={UNSAFE_className + wrapper({
              size
            }, styles)}>
              {props.children}
          </RACBreadcrumbs>
        </CollapsingCollection>
    </Provider>
  );
}

let BreadcrumbMenu = (props: BreadcrumbProps) => {
  let {items} = props;
  let {direction} = useLocale();
  let size = 'M';
  return (
    <UNSTABLE_CollectionRendererContext.Provider value={UNSTABLE_DefaultCollectionRenderer}>
      <li className={breadcrumbStyles({size, isMenu: true})}>
        <MenuTrigger>
          <S2ActionButton isQuiet aria-label='See more'><FolderIcon /></S2ActionButton>
          <Menu>
            {items.map((item, idx) => {
              console.log(item)
              // pull off individual props as an allow list, don't want refs or other props getting through
              return (
                <MenuItem
                  key={item.key}>
                  <Text slot="label">
                    {item.props.children({size, isInCtx: true, isCurrent: false, isMenu: true})}
                  </Text>
                </MenuItem>
              );
            })}
          </Menu>
        </MenuTrigger>
        <ChevronIcon
          size={size}
          className={chevronStyles({direction, isMenu: true})} />
      </li>
    </UNSTABLE_CollectionRendererContext.Provider>
  );
};

/** Breadcrumbs show hierarchy and navigational context for a user’s location within an application. */
let _Breadcrumbs = /*#__PURE__*/ (forwardRef as forwardRefType)(Breadcrumbs);
export {_Breadcrumbs as Breadcrumbs};

let HiddenBreadcrumbs = function(props: {hiddenBreadcrumbsRef: RefObject<HTMLDivElement | null>, items: Array<Node<any>>, size: string}) {
  let {hiddenBreadcrumbsRef, items, size} = props;
  return (
    <div
      // @ts-ignore
      inert="true"
      ref={hiddenBreadcrumbsRef}
      className={style({
        display: '[inherit]',
        gap: '[inherit]',
        flexWrap: '[inherit]',
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: 0,
        end: 0,
        visibility: 'hidden',
        overflow: 'hidden',
        opacity: 0
      })}>
      {items.map((item, idx) => {
        // pull off individual props as an allow list, don't want refs or other props getting through
        return (
          <div
            style={item.props.UNSAFE_style}
            key={item.key}
            className={item.props.className({size, isCurrent: idx === items.length - 1})}>
            {item.props.children({size, isInCtx: true, isCurrent: idx === items.length - 1})}
          </div>
        );
      })}
    </div>
  );
}

const breadcrumbStyles = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'start',
  height: 'control',
  transition: 'default',
  position: 'relative',
  color: {
    default: 'neutral',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isDisabled: 'GrayText'
    }
  },
  borderStyle: 'none',
  marginStart: {
    // adjusts with the parent flex gap
    isMenu: size(-6),
  }
});

const chevronStyles = style({
  scale: {
    direction: {
      rtl: -1
    }
  },
  marginStart: {
    default: 'text-to-visual',
    isMenu: 0
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

const linkStyles = style({
  ...focusRing(),
  borderRadius: 'sm',
  color: {
    default: 'neutral-subdued',
    isDisabled: 'disabled',
    isCurrent: 'neutral',
    forcedColors: {
      default: 'LinkText',
      isDisabled: 'GrayText'
    }
  },
  transition: 'default',
  font: 'control',
  fontWeight: {
    default: 'normal',
    isCurrent: 'bold'
  },
  textDecoration: {
    default: 'none',
    isHovered: 'underline',
    isFocusVisible: 'underline',
    isDisabled: 'none'
  },
  cursor: {
    default: 'pointer',
    isDisabled: 'default'
  },
  outlineColor: {
    default: 'focus-ring',
    forcedColors: 'Highlight'
  },
  disableTapHighlight: true
});

const currentStyles = style<{size: string}>({
  color: {
    default: 'neutral',
    forcedColors: 'ButtonText'
  },
  transition: 'default',
  font: 'control',
  fontWeight: 'bold'
});

// TODO: support user heading size customization, for now just set it to large
const heading = style({
  margin: 0,
  font: 'heading-lg',
  fontWeight: 'extra-bold'
});

export interface BreadcrumbProps extends Omit<AriaBreadcrumbItemProps, 'children' | 'style' | 'className' | 'autoFocus'>, LinkDOMProps {
  /** The children of the breadcrumb item. */
  children?: ReactNode
}

function Breadcrumb({children, ...props}: BreadcrumbProps, ref: DOMRef<HTMLLIElement>) {
  let {href, target, rel, download, ping, referrerPolicy, ...other} = props;
  let {size} = useSlottedContext(InternalBreadcrumbsContext);
  let domRef = useDOMRef(ref);
  let {direction} = useLocale();
  console.log('rendering breadcrumb')
  return (
    <AriaBreadcrumb
      {...other}
      ref={domRef}
      className={({isCurrent}) => breadcrumbStyles({size, isCurrent})}>
      {({isCurrent, isDisabled, isMenu}) => {
        if (isMenu) {
          return children;
        }
        return (
          isCurrent ?
            <div
              className={currentStyles({size})}>
              <Provider
                values={[
                  [HeadingContext, {className: heading}]
                ]}>
                {children}
              </Provider>
            </div>
            : (
              <>
                <Link
                  style={({isFocusVisible}) => ({clipPath: isFocusVisible ? 'none' : 'margin-box'})}
                  href={href}
                  target={target}
                  rel={rel}
                  download={download}
                  ping={ping}
                  referrerPolicy={referrerPolicy}
                  isDisabled={isDisabled || isCurrent}
                  className={({isFocused, isFocusVisible, isHovered, isDisabled, isPressed}) => linkStyles({isFocused, isFocusVisible, isHovered, isDisabled, size, isCurrent, isPressed})}>
                  {children}
                </Link>
                <ChevronIcon
                  size="M"
                  className={chevronStyles({direction})} />
              </>
            )
          );
        }}
    </AriaBreadcrumb>
  );
}

/** An individual Breadcrumb for Breadcrumbs. */
let _Breadcrumb = /*#__PURE__*/ (forwardRef as forwardRefType)(Breadcrumb);
export {_Breadcrumb as Breadcrumb};

// Context for passing the count for the custom renderer
let CollapseContext = createContext({count: Infinity});

function CollapsingCollection({children, count}) {
  return (
    <CollapseContext.Provider value={{count}}>
      <UNSTABLE_CollectionRendererContext.Provider value={CollapsingCollectionRenderer}>
        {children}
      </UNSTABLE_CollectionRendererContext.Provider>
    </CollapseContext.Provider>
  );
}

let CollapsingCollectionRenderer: CollectionRenderer = {
  CollectionRoot({collection}) {
    return useCollectionRender(collection);
  },
  CollectionBranch({collection}) {
    return useCollectionRender(collection);
  }
};

let useCollectionRender = (collection: Collection<Node<unknown>>) => {
  let {count} = useContext(CollapseContext);
  let children = useMemo(() => {
    let result: Node<unknown>[] = [];
    let index = 0;
    for (let key of collection.getKeys()) {
      result.push(collection.getItem(key)!);
      index++;
    }
    return result;
  }, [collection, count]);
  let hiddenBreadcrumbsRef = useRef<HTMLDivElement | null>(null);
  if (children.length > 0) {
    return (
      <>
        <HiddenBreadcrumbs items={children} size='M' hiddenBreadcrumbsRef={hiddenBreadcrumbsRef} />
        {children[0].render?.(children[0])}
        <BreadcrumbMenu items={children.slice(1, 2)} />
        {children.slice(2).map(node => node.render?.(node))}
      </>
    );
  } else {
    <>
      {children.map(node => node.render?.(node))}
    </>
  }
};
