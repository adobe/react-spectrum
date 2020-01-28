import {Checkbox} from '@react-spectrum/checkbox';
import CheckmarkMedium from '@spectrum-icons/ui/CheckmarkMedium';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {Grid} from '@react-spectrum/layout';
import {MenuContext} from './context';
import React, {useContext, useRef} from 'react';
import {SpectrumMenuItemProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {Text} from '@react-spectrum/typography';
import {useMenuItem} from '@react-aria/menu-trigger';

export function MenuItem<T>(props: SpectrumMenuItemProps<T>) {
  let {
    item,
    state,
    ...otherProps
  } = props;

  let menuProps = useContext(MenuContext) || {};

  let {
    selectionMode,
    setOpen
  } = menuProps;

  let {
    rendered,
    isSelected,
    isDisabled,
    key
  } = item;

  let ref = useRef<HTMLDivElement>();
  let {menuItemProps} = useMenuItem(
    {
      isSelected,
      isDisabled,
      key,
      ...otherProps
    }, 
    ref, 
    state,
    setOpen
  );

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...filterDOMProps(otherProps)}
        {...menuItemProps}
        ref={ref}
        className={classNames(
          styles,
          'spectrum-Menu-item',
          {
            'is-disabled': isDisabled,
            'is-selected': isSelected && selectionMode === 'single'
          }
        )}>
        <Grid
          UNSAFE_className={classNames(styles, 'spectrum-Menu-itemGrid')}
          slots={{
            label: styles['spectrum-Menu-itemLabel'],
            tools: styles['spectrum-Menu-tools'],
            icon: styles['spectrum-Menu-icon'],
            detail: styles['spectrum-Menu-detail'],
            keyboardIcon: styles['spectrum-Menu-keyboard']}}>
          {!Array.isArray(rendered) && (
            <Text slot="label">
              {rendered}
            </Text>
          )}
          {Array.isArray(rendered) && rendered}
          {isSelected && selectionMode === 'single' && 
            <CheckmarkMedium 
              slot="tools" 
              UNSAFE_className={
                classNames(
                  styles, 
                  'spectrum-Menu-checkmark'
                )
              } />}
          {selectionMode === 'multiple' && 
            <Checkbox
              tabIndex={-1} // TODO: Should tabindex propagate to the <input> of checkbox?
              isEmphasized
              isSelected={isSelected} 
              isDisabled={isDisabled} 
              UNSAFE_className={
                classNames(
                  styles,
                  'spectrum-Menu-multiselect-checkbox'
                )
              } />}
        </Grid>  
      </div>
    </FocusRing>
  );
}
