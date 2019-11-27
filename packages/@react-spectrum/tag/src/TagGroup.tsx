import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {DOMProps, Removable} from '@react-types/shared';
import {Focus} from '@react-aria/focus';
import React, {useContext, useRef} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/tags/vars.css';
import {TagGroupProps} from '@react-types/tag';
import {useProviderProps} from '@react-spectrum/provider';
import {useTagGroup} from '@react-aria/tag';

interface TagGroupContext extends Removable<any, void> {
  isDisabled?: boolean,
  isFocused?: boolean,
  isRequired?: boolean,
  isReadOnly?: boolean,
  validationState?: 'valid' | 'invalid',
  role?: 'gridcell'
}

const TagGroupContext = React.createContext<TagGroupContext | {}>({});

export function useTagGroupProvider(): TagGroupContext {
  return useContext(TagGroupContext);
}

interface SpectrumTagGroupProps extends TagGroupProps, DOMProps, StyleProps {}

export const TagGroup = ((props: SpectrumTagGroupProps) => {
  let completeProps = useProviderProps(props);

  let {
    isReadOnly,
    isDisabled,
    onRemove,
    validationState,
    children,
    ...otherProps
  } = completeProps;
  let {styleProps} = useStyleProps(otherProps);
  let isFocused = useRef(false);

  let handleFocusWithin = (focused) => {
    isFocused.current = focused;
  };

  const {tagGroupProps} = useTagGroup({...completeProps, isFocused: isFocused.current});

  function removeAll(tags) {
    onRemove([tags]);
  }

  return (
    <Focus onFocusWithinChange={handleFocusWithin}>
      <div
        {...filterDOMProps(otherProps)}
        {...styleProps}
        className={
          classNames(
            styles,
            'spectrum-Tags',
            {
              'is-disabled': isDisabled
            },
            styleProps.className
          )
        }
        {...tagGroupProps}>
        <TagGroupContext.Provider
          value={{
            isRemovable: isReadOnly ? false : isReadOnly,
            isDisabled,
            onRemove: isReadOnly ? null : removeAll,
            validationState,
            role: 'gridcell'
          }}>
          {children}
        </TagGroupContext.Provider>
      </div>
    </Focus>
  );
});
