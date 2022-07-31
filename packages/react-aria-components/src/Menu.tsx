
import {AriaMenuProps, MenuTriggerProps} from '@react-types/menu';
import {ButtonContext} from './Button';
import {isFocusVisible} from '@react-aria/interactions';
import {ItemStates, useCachedChildren, useCollection} from './Collection';
import {Node} from '@react-types/shared';
import {PopoverContext} from './Popover';
import {Provider, RenderProps, StyleProps, useContextProps, useRenderProps, WithRef} from './utils';
import React, {createContext, ForwardedRef, forwardRef, ReactNode, useContext, useRef} from 'react';
import {Separator, SeparatorContext} from './Separator';
import {TreeState, useMenuTriggerState, useTreeState} from 'react-stately';
import {useMenu, useMenuItem, useMenuSection, useMenuTrigger} from 'react-aria';

const MenuContext = createContext<WithRef<Omit<AriaMenuProps<unknown>, 'children'>, HTMLUListElement>>(null);
const InternalMenuContext = createContext<TreeState<unknown>>(null);

interface MenuTriggerProps2 extends MenuTriggerProps {
  children?: ReactNode
}

export function MenuTrigger(props: MenuTriggerProps2) {
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
        [ButtonContext, {...menuTriggerProps, ref}],
        [PopoverContext, {state, triggerRef: ref, placement: 'bottom start'}]
      ]}>
      {props.children}
    </Provider>
  );
}

interface MenuProps<T> extends AriaMenuProps<T>, StyleProps {}

function Menu<T extends object>(props: MenuProps<T>, ref: ForwardedRef<HTMLUListElement>) {
  [props, ref] = useContextProps(props, ref, MenuContext);
  let {portal, collection} = useCollection(props);
  let state = useTreeState({
    ...props,
    collection
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
      <ul
        {...menuProps}
        ref={ref}
        style={props.style}
        className={props.className}>
        <Provider
          values={[
            [InternalMenuContext, state],
            [SeparatorContext, {elementType: 'li'}]
          ]}>
          {children}
        </Provider>
      </ul>
      {portal}
    </>
  );
}

const _Menu = forwardRef(Menu);
export {_Menu as Menu};

interface MenuSectionProps<T> extends StyleProps {
  section: Node<T>
}

function MenuSection<T>({section, className, style}: MenuSectionProps<T>) {
  let {itemProps, headingProps, groupProps} = useMenuSection({
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
    <li {...itemProps} style={{display: 'contents'}}>
      {section.rendered &&
        <span {...headingProps} style={{display: 'contents'}}>
          {section.rendered}
        </span>
      }
      <ul 
        {...groupProps}
        className={className || section.props?.className}
        style={style || section.props?.style}>
        {children}
      </ul>
    </li>
  );
}

interface MenuItemProps<T> extends RenderProps<ItemStates> {
  item: Node<T>
}

function MenuItem<T>({item, children, className, style}: MenuItemProps<T>) {
  let state = useContext(InternalMenuContext);
  let ref = useRef();
  let {menuItemProps, labelProps, descriptionProps, keyboardShortcutProps, ...states} = useMenuItem({key: item.key}, state, ref);

  let focusVisible = states.isFocused && isFocusVisible();
  let renderProps = useRenderProps({
    className: className || item.props.className,
    style: style || item.props.style,
    children: children || item.rendered,
    values: {
      ...states,
      isFocusVisible: focusVisible
    }
  });

  return (
    <li
      {...menuItemProps}
      {...renderProps}
      ref={ref}
      data-focused={states.isFocused || undefined}
      data-focus-visible={focusVisible || undefined}
      data-pressed={states.isPressed || undefined} />
  );
}
