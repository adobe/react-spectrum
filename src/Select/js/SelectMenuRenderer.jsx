import classNames from 'classnames';
import React from 'react';

export default ({
  focusedOption,
  instancePrefix,
  onFocus,
  onSelect,
  optionClassName,
  optionComponent,
  optionRenderer,
  options,
  valueArray,
  valueKey,
  onOptionRef
}) => {
  const Option = optionComponent;

  return options.map((option, i) => {
    const isSelected = valueArray && valueArray.indexOf(option) > -1;
    const isFocused = option === focusedOption;
    const optionClass = classNames(optionClassName, option.className, {
      'coral-BasicList-item': true,
      'coral-ButtonList-item': true,
      'is-selected': isSelected,
      'is-focused': isFocused,
      'is-highlighted': isFocused,
      'is-disabled': option.disabled
    });

    return (
      <Option
        className={ optionClass }
        instancePrefix={ instancePrefix }
        isDisabled={ option.disabled }
        isFocused={ isFocused }
        isSelected={ isSelected }
        key={ `option-${ i }-${ option[valueKey] }` }
        onFocus={ onFocus }
        onSelect={ onSelect }
        option={ option }
        optionIndex={ i }
        ref={ ref => { onOptionRef(ref, isFocused); } }
      >
        {optionRenderer(option, i)}
      </Option>
    );
  });
};
