import {ButtonGroupProps} from '@react-types/button';
import buttonStyles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {CollectionBase, SelectionMode} from '@react-types/shared';
import {GroupLayout, GroupNode, GroupState, useButtonGroupState} from '@react-stately/button';
import {mergeProps} from '@react-aria/utils';
import React, {useContext, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/buttongroup/vars.css';
import {useButtonGroup} from '@react-aria/button';
import {useSelectableCollection, useSelectableItem} from '@react-aria/selection';

interface ButtonGroupContext {
  isDisabled?: boolean,
  isEmphasized?: boolean,
  isQuiet?: boolean,
  holdAffordance?: boolean,
  className?: string,
  role?: string
}

export interface SpectrumButtonGroupProps extends ButtonGroupProps {
  isEmphasized?: boolean,
  isConnected?: boolean
  isJustified?: boolean,
  isQuiet?: boolean,
  holdAffordance?: boolean,
  onSelect?: (...args) => void
}

const ButtonContext = React.createContext<ButtonGroupContext | {}>({});

export function useButtonProvider(): ButtonGroupContext {
  return useContext(ButtonContext);
}

export function ButtonGroup<T>(props: CollectionBase<T> & SpectrumButtonGroupProps) {
  let {
    isEmphasized,
    isConnected, // no quiet option available in this mode
    isJustified,
    isDisabled,
    selectionMode = 'single' as SelectionMode,
    orientation = 'horizontal',
    className,
    onSelect,
    holdAffordance,
    isQuiet,
    ...otherProps
  } = props;

  let state = useButtonGroupState({...props, selectionMode});

  let layout = new GroupLayout(state.buttonCollection);

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
          className
        )
      } >
      <ButtonContext.Provider
        value={{
          ...buttonProps,
          isEmphasized,
          isDisabled,
          isQuiet,
          holdAffordance,
          className: classNames(buttonStyles, itemClassName)
        }}>
        {
          [...state.buttonCollection].map((item) => (
            <ButtonGroupItem
              item={item}
              state={state}
              onSelect={onSelect} />
          ))
        }
      </ButtonContext.Provider>
    </div>
  );
}

export interface ButtonGroupItemProps {
  item: GroupNode,
  state: GroupState,
  onSelect?: (...args) => void
}

export function ButtonGroupItem({item, state, onSelect}: ButtonGroupItemProps) {
  let ref = useRef<HTMLDivElement>();
  let {itemProps} = useSelectableItem({
    selectionManager: state && state.selectionManager,
    itemKey: item && item.key,
    itemRef: ref
  });

  let {
    isDisabled,
    value
  } = item;

  let onPress = () => {
    if (!isDisabled) {
      onSelect(item);
    }
  };

  let buttonProps = mergeProps(item, itemProps);

  return React.cloneElement(value, {...buttonProps, onPress, ref});
}
