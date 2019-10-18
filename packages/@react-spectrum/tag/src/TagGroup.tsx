import {classNames, filterDOMProps} from '@react-spectrum/utils';
import React, {useContext} from 'react';
import {Removable} from '@react-types/shared';
import styles from '@adobe/spectrum-css-temp/components/tags/vars.css';
import {TagGroupProps} from '@react-types/tag';
import {useProviderProps} from '@react-spectrum/provider';
import {useTagGroup} from '@react-aria/tag';

interface TagGroupContext extends Removable<any, void> {
  isDisabled?: boolean,
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
    isRemovable,
    onRemove,
    validationState,
    children,
    className,
    ...otherProps
  } = completeProps;

  const {tagGroupProps} = useTagGroup(completeProps);

  function removeAll(tags) {
    // TODO: implement when selection state hook is available
    onRemove([tags]);
  }

  return (
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
          isRemovable: !isReadOnly && isRemovable,
          isDisabled,
          onRemove: removeAll,
          validationState,
          role: 'gridcell'
        }}>
        <span role="row">
          {children}
        </span>
      </TagGroupContext.Provider>
    </div>
  );
});
