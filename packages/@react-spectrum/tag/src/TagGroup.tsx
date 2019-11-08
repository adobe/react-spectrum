import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {Focus} from '@react-aria/focus';
import React, {useContext, useRef} from 'react';
import {Removable} from '@react-types/shared';
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

export const TagGroup = ((props: TagGroupProps) => {
  let completeProps = useProviderProps(props);

  let {
    isReadOnly,
    isDisabled,
    onRemove,
    validationState,
    children,
    className,
    ...otherProps
  } = completeProps;
  let isFocused = useRef(false);

  let handleFocusWithin = (focused) => {
    isFocused.current = focused;
  };

  const {tagGroupProps} = useTagGroup({...completeProps, isFocused});

  function removeAll(tags) {
    onRemove([tags]);
  }

  return (
    <Focus onFocusWithinChange={handleFocusWithin}>
      <div
        {...filterDOMProps(otherProps)}
        className={
          classNames(
            styles,
            'spectrum-Tags',
            {
              'is-disabled': isDisabled
            },
            className
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
