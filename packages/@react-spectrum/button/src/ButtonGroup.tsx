import {ButtonGroupButton, ButtonGroupProps} from '@react-types/button';
import {ButtonGroupKeyboardDelegate, ButtonGroupState, useButtonGroupState} from '@react-stately/button';
import buttonStyles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {CollectionBase, SelectionMode} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {Provider} from '@react-spectrum/provider';
import React, {useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/buttongroup/vars.css';
import {useButtonGroup} from '@react-aria/button';
import {useSelectableCollection, useSelectableItem} from '@react-aria/selection';

export interface SpectrumButtonGroupProps extends ButtonGroupProps {
  isEmphasized?: boolean,
  isConnected?: boolean
  isJustified?: boolean,
  isQuiet?: boolean,
  holdAffordance?: boolean,
  onSelectionChange?: (...args) => void
}

export function ButtonGroup<T>(props: CollectionBase<T> & SpectrumButtonGroupProps) {
  let {
    isEmphasized,
    isConnected, // no quiet option available in this mode
    isJustified,
    isDisabled,
    selectionMode = 'single' as SelectionMode,
    orientation = 'horizontal',
    isQuiet,
    ...otherProps
  } = props;

  let state = useButtonGroupState({...props, selectionMode});

  let layout = new ButtonGroupKeyboardDelegate(state.buttonCollection);

  let {listProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: layout
  });

  let {buttonGroupProps, buttonProps} = useButtonGroup({
    ...props,
    tabIndex: state.selectionManager.focusedKey ? -1 : 0
  });

  let isVertical = orientation === 'vertical';
  let itemClassName;
  if (isVertical) {
    itemClassName = 'spectrum-ButtonGroup-item--vertical';
  } else {
    itemClassName = {
      'spectrum-ButtonGroup-item--connected': isConnected && !isQuiet,
      'spectrum-ButtonGroup-item--justified': isJustified
    };
  }

  let providerProps = {isEmphasized, isDisabled, isQuiet};

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...mergeProps(buttonGroupProps, listProps)}
      className={
        classNames(
          styles,
          'spectrum-ButtonGroup',
          {
            'spectrum-ButtonGroup--vertical': isVertical
          },
          otherProps.UNSAFE_className
        )
      } >
      <Provider {...providerProps}>
        {
          state.buttonCollection.items.map((item) => (
            <ButtonGroupItem
              key={item.key}
              {...buttonProps}
              UNSAFE_className={classNames(buttonStyles, itemClassName)}
              item={item}
              state={state} />
          ))
        }
      </Provider>
    </div>
  );
}

export interface ButtonGroupItemProps {
  role?: string,
  UNSAFE_className?: string,
  item: ButtonGroupButton,
  state: ButtonGroupState
}

export function ButtonGroupItem({item, state, ...otherProps}: ButtonGroupItemProps) {
  let ref = useRef<HTMLDivElement>();
  let {itemProps} = useSelectableItem({
    selectionManager: state && state.selectionManager,
    itemKey: item && item.key,
    itemRef: ref
  });

  let buttonProps = mergeProps(item.props, otherProps);
  let buttonAriaProps = mergeProps(
    itemProps,
    {
      onFocus: e => e.continuePropagation()
    }
  );

  return React.cloneElement(
    item,
    {
    // @ts-ignore
      ref,
      ...buttonProps,
      ...buttonAriaProps
    }
  );
}
