
import {AriaMenuProps, MenuTriggerProps as BaseMenuTriggerProps} from '@react-types/menu';
import {ButtonContext} from './Button';
import {CollectionItemProps, CollectionProps, ItemStates, useCachedChildren, useCollection} from './Collection';
import {isFocusVisible} from '@react-aria/interactions';
import {KeyboardContext} from './Keyboard';
import {Node} from '@react-types/shared';
import {PopoverContext} from './Popover';
import {Provider, RenderProps, StyleProps, useContextProps, useRenderProps, WithRef} from './utils';
import React, {createContext, ForwardedRef, forwardRef, ReactNode, useContext, useRef} from 'react';
import {Separator, SeparatorContext} from './Separator';
import {TextContext} from './Text';
import {TreeState, useMenuTriggerState, useTreeState} from 'react-stately';
import {useMenu, useMenuItem, useMenuSection, useMenuTrigger} from 'react-aria';

const MenuContext = createContext<WithRef<Omit<AriaMenuProps<unknown>, 'children'>, HTMLDivElement>>(null);
const InternalMenuContext = createContext<TreeState<unknown>>(null);

interface MenuTriggerProps extends BaseMenuTriggerProps {
  children?: ReactNode
}

export function MenuTrigger(props: MenuTriggerProps) {
  let state = useMenuTriggerState(props);

  let ref = useRef();
  let {menuTriggerProps, menuProps} = useMenuTrigger({
    ...props,
    type: 'menu'
  }, state, ref);

  return (
    <Provider
      values={[
        [MenuContext, menuProps],
        [ButtonContext, {...menuTriggerProps, ref, isPressed: state.isOpen}],
        [PopoverContext, {state, triggerRef: ref, placement: 'bottom start'}]
      ]}>
      {props.children}
    </Provider>
  );
}

interface MenuProps<T> extends Omit<AriaMenuProps<T>, 'children'>, CollectionProps<T>, StyleProps {}

function Menu<T extends object>(props: MenuProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, MenuContext);
  let {portal, collection} = useCollection(props);
  let state = useTreeState({
    ...props,
    collection,
    children: null
  });
  let {menuProps} = useMenu(props, state, ref);

  let children = useCachedChildren({
    items: state.collection,
    children: (item) => {
      switch (item.type) {
        case 'section':
          return <MenuSection section={item} />;
        case 'separator':
          return <Separator {...item.props} />;
        case 'item':
          return <MenuItem item={item} />;
        default:
          throw new Error('Unsupported node type in Menu: ' + item.type);
      }
    }
  });

  return (
    <>
      <div
        {...menuProps}
        ref={ref}
        style={props.style}
        className={props.className ?? 'react-aria-Menu'}>
        <Provider
          values={[
            [InternalMenuContext, state],
            [SeparatorContext, {elementType: 'div'}]
          ]}>
          {children}
        </Provider>
      </div>
      {portal}
    </>
  );
}

/**
 * A menu displays a list of actions or options that a user can choose.
 */
const _Menu = forwardRef(Menu);
export {_Menu as Menu};

interface MenuSectionProps<T> extends StyleProps {
  section: Node<T>
}

function MenuSection<T>({section, className, style}: MenuSectionProps<T>) {
  let {headingProps, groupProps} = useMenuSection({
    heading: section.rendered,
    'aria-label': section['aria-label']
  });

  let children = useCachedChildren({
    items: section.childNodes,
    children: item => {
      if (item.type !== 'item') {
        throw new Error('Only items are allowed within a section');
      }

      return <MenuItem item={item} />;
    }
  });

  return (
    <section 
      {...groupProps}
      className={className || section.props?.className || 'react-aria-Section'}
      style={style || section.props?.style}>
      {section.rendered &&
        <header {...headingProps}>
          {section.rendered}
        </header>
      }
      {children}
    </section>
  );
}

export interface MenuItemStates extends ItemStates {
  /**
   * Whether the item is currently selected.
   * @selector [aria-checked=true]
   */
   isSelected: boolean
}

interface MenuItemProps<T> extends RenderProps<ItemStates> {
  item: Node<T>
}

function MenuItem<T>({item, children, className, style}: MenuItemProps<T>) {
  let state = useContext(InternalMenuContext);
  let ref = useRef();
  let {menuItemProps, labelProps, descriptionProps, keyboardShortcutProps, ...states} = useMenuItem({key: item.key}, state, ref);

  let props: CollectionItemProps<T> = item.props;
  let focusVisible = states.isFocused && isFocusVisible();
  let renderProps = useRenderProps({
    className: className || props.className,
    style: style || props.style,
    children: children || item.rendered,
    defaultClassName: 'react-aria-Item',
    values: {
      ...states,
      isHovered: states.isFocused,
      isFocusVisible: focusVisible,
      selectionMode: state.selectionManager.selectionMode,
      selectionBehavior: state.selectionManager.selectionBehavior
    }
  });

  return (
    <div
      {...menuItemProps}
      {...renderProps}
      ref={ref}
      data-hovered={states.isFocused || undefined}
      data-focused={states.isFocused || undefined}
      data-focus-visible={focusVisible || undefined}
      data-pressed={states.isPressed || undefined}>
      <Provider
        values={[
          [TextContext, {
            slots: {
              label: labelProps,
              description: descriptionProps
            }
          }],
          [KeyboardContext, keyboardShortcutProps]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}
