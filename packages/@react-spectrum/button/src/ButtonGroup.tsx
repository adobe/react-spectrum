import {ButtonGroupButton, SpectrumButtonGroupProps} from '@react-types/button';
import {ButtonGroupState, useButtonGroupState} from '@react-stately/button';
import buttonStyles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {CollectionBase, SelectionMode} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {PressResponder} from '@react-aria/interactions';
import {Provider} from '@react-spectrum/provider';
import React, {AllHTMLAttributes, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/buttongroup/vars.css';
import {useButtonGroup} from '@react-aria/button';
import {useSelectableItem} from '@react-aria/selection';

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

  let {buttonGroupProps, buttonProps} = useButtonGroup(props, state);

  let isVertical = orientation === 'vertical';

  let providerProps = {isEmphasized, isDisabled, isQuiet};

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...buttonGroupProps}
      className={
        classNames(
          styles,
          'spectrum-ButtonGroup',
          classNames(buttonStyles, {
            'spectrum-ButtonGroup--vertical': isVertical,
            'spectrum-ButtonGroup--connected': isConnected && !isQuiet,
            'spectrum-ButtonGroup--justified': isJustified
          }),
          otherProps.UNSAFE_className
        )
      } >
      <Provider {...providerProps}>
        {
          state.buttonCollection.items.map((item) => (
            <ButtonGroupItem
              key={item.key}
              {...buttonProps}
              UNSAFE_className={classNames(buttonStyles, 'spectrum-ButtonGroup-item')}
              item={item}
              state={state} />
          ))
        }
      </Provider>
    </div>
  );
}

export interface ButtonGroupItemProps extends AllHTMLAttributes<HTMLButtonElement> {
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

  let buttonProps = mergeProps(itemProps, otherProps);
  let allProps = mergeProps(item.props, buttonProps);

  return (
    <PressResponder ref={ref} {...allProps} >
      {item}
    </PressResponder>
  );

}
