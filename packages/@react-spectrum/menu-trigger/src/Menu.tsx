import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {CollectionView} from '@react-aria/collections';
import {Item, ListLayout, Node, Section} from '@react-stately/collections';
import {MenuContext} from './context';
import {MenuDivider, MenuHeading, MenuItem} from './';
import {mergeProps} from '@react-aria/utils';
import React, {Fragment, useContext, useEffect, useMemo} from 'react';
import {SpectrumMenuProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useMenu} from '@react-aria/menu-trigger';
import {useTreeState} from '@react-stately/tree'; 

export {Item, Section};

export function Menu<T>(props: SpectrumMenuProps<T>) {
  let layout = useMemo(() => 
    new ListLayout({
      rowHeight: 32, // Feel like we should eventually calculate this number (based on the css)? It should probably get a multiplier in order to gracefully handle scaling
      headingHeight: 31 // Same as above
    })
  , []);

  let contextProps = useContext(MenuContext);
  let completeProps = {
    ...mergeProps(contextProps, props),
    selectionMode: props.selectionMode || 'single'
  };

  let state = useTreeState(completeProps);
  let {menuProps, menuItemProps} = useMenu(completeProps, state, layout);
  let {styleProps} = useStyleProps(completeProps);
  let menuContext = mergeProps(menuProps, completeProps);

  let {
    focusStrategy,
    setFocusStrategy,
    autoFocus = true,
    ...otherProps
  } = completeProps;

  useEffect(() => {
    // By default, attempt to focus first item upon opening menu
    let focusedKey = layout.getFirstKey();
    let selectionManager = state.selectionManager;
    let selectedKeys = selectionManager.selectedKeys;
    selectionManager.setFocused(true);
    
    // Focus last item if focusStrategy is 'last' (i.e. ArrowUp opening the menu)
    if (focusStrategy && focusStrategy === 'last') {
      focusedKey = layout.getLastKey();

      // Reset focus strategy so it doesn't get applied to future menu openings
      setFocusStrategy('first');
    }

    // TODO: add other default focus behaviors https://jira.corp.adobe.com/browse/RSP-1399
    // Focus the first selected key (if any)
    if (selectedKeys.size) {
      focusedKey = selectedKeys.values().next().value;
    }
    
    if (autoFocus) {
      selectionManager.setFocusedKey(focusedKey);
    }
  }, []);

  return (
    <MenuContext.Provider value={menuContext}>
      <CollectionView
        {...filterDOMProps(otherProps)}
        {...styleProps}
        {...menuProps}
        focusedKey={state.selectionManager.focusedKey}
        className={
          classNames(
            styles, 
            'spectrum-Menu',
            styleProps.className
          )
        }
        layout={layout}
        collection={state.tree}>
        {(type, item: Node<T>) => {
          if (type === 'section') {
            // Only render the Divider if it isn't the first Heading (extra equality check to guard against rerenders)
            if (item.key === state.tree.getKeys().next().value) {
              return (
                <MenuHeading item={item} />
              );
            } else {
              return (
                <Fragment>
                  <MenuDivider />
                  <MenuHeading item={item} />
                </Fragment>
              );
            }
          }

          return (   
            <MenuItem
              {...menuItemProps}
              item={item}
              state={state} />
          );
        }}
      </CollectionView>
    </MenuContext.Provider>
  );
}
