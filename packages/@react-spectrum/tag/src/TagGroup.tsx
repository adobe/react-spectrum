import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import React, {useContext} from 'react';
import {Removable} from '@react-types/shared';
import {SpectrumTagGroupProps} from '@react-types/tag';
import styles from '@adobe/spectrum-css-temp/components/tags/vars.css';
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
  const {tagGroupProps} = useTagGroup(completeProps);

  function removeAll(tags) {
    onRemove([tags]);
  }

  return (
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
  );
});
