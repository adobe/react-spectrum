
import {AriaMenuProps, MenuTriggerProps} from '@react-types/menu';
import {ButtonContext} from './Button';
import {Node} from '@react-types/shared';
import {PopoverContext} from './Popover';
import {Provider, RenderProps, StyleProps, useContextProps, useRenderProps, WithRef} from './utils';
import React, {cloneElement, createContext, ForwardedRef, forwardRef, ReactNode, useContext, useRef} from 'react';
import {Separator, SeparatorContext} from './Separator';
import {TreeState, useMenuTriggerState, useTreeState} from 'react-stately';
import {useMenu, useMenuItem, useMenuSection, useMenuTrigger} from 'react-aria';

interface InternalMenuContextValue {
  state: TreeState<unknown>,
  renderItem?: (item: Node<unknown>) => JSX.Element
}

const MenuContext = createContext<WithRef<Omit<AriaMenuProps<unknown>, 'children'>, HTMLUListElement>>(null);
const InternalMenuContext = createContext<InternalMenuContextValue>(null);

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
        [PopoverContext, {state, triggerRef: ref}]
      ]}>
      {props.children}
    </Provider>
  );
}

interface MenuProps<T> extends AriaMenuProps<T>, StyleProps {
  renderSection?: (section: Node<T>) => JSX.Element,
  renderItem?: (item: Node<T>) => JSX.Element,
  renderSeparator?: (item: Node<T>) => JSX.Element
}

function Menu<T extends object>(props: MenuProps<T>, ref: ForwardedRef<HTMLUListElement>) {
  [props, ref] = useContextProps(props, ref, MenuContext);
  let state = useTreeState(props);
  let {menuProps} = useMenu(props, state, ref);

  let renderSection = props.renderSection || ((section) => <MenuSection section={section} />);
  let renderItem = props.renderItem || ((item) => <MenuItem item={item} />);
  let renderSeparator = props.renderSeparator || ((separator) =>  <Separator {...separator.props} />);
  let render = (item: Node<T>) => {
    switch (item.type) {
      case 'section':
        return renderSection(item);
      case 'separator':
        return renderSeparator(item);
      case 'item':
        return renderItem(item);
      default:
        throw new Error('Unsupported node type in Menu: ' + item.type);
    }
  };

  return (
    <ul
      {...menuProps}
      ref={ref}
      style={props.style}
      className={props.className}>
      <Provider
        values={[
          [InternalMenuContext, {renderItem, state}],
          [SeparatorContext, {elementType: 'li'}]
        ]}>
        {[...state.collection].map(item => cloneElement(render(item), {key: item.key}))}
      </Provider>
    </ul>
  );
}

const _Menu = forwardRef(Menu);
export {_Menu as Menu};

interface MenuSectionProps<T> extends RenderProps<{section: Node<T>}> {
  section: Node<T>
}

export function MenuSection<T>({section, children, className, style}: MenuSectionProps<T>) {
  let {renderItem} = useContext(InternalMenuContext);
  let {itemProps, headingProps, groupProps} = useMenuSection({
    heading: section.rendered,
    'aria-label': section['aria-label']
  });

  let renderProps = useRenderProps({
    className: className || section.props?.className,
    style: style || section.props?.style,
    children: children || section.rendered,
    values: section
  });

  return (
    <li {...itemProps} style={{display: 'contents'}}>
      {renderProps.children &&
        <span {...headingProps} style={{display: 'contents'}}>
          {renderProps.children}
        </span>
      }
      <ul {...groupProps} {...renderProps}>
        {[...section.childNodes].map(renderItem)}
      </ul>
    </li>
  );
}

interface MenuItemRenderProps {
  isFocused: boolean,
  isSelected: boolean,
  isDisabled: boolean
}

interface MenuItemProps<T> extends RenderProps<MenuItemRenderProps> {
  item: Node<T>
}

export function MenuItem<T>({item, children, className, style}: MenuItemProps<T>) {
  let {state} = useContext(InternalMenuContext);
  let ref = useRef();
  let {menuItemProps, isDisabled, isSelected, isFocused} = useMenuItem({key: item.key}, state, ref);

  let renderProps = useRenderProps({
    className: className || item.props.className,
    style: style || item.props.style,
    children: children || item.rendered,
    values: {
      isFocused,
      isSelected,
      isDisabled
    }
  });

  return (
    <li
      {...menuItemProps}
      {...renderProps}
      ref={ref} />
  );
}
