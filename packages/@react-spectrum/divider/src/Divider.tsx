import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import React, {ElementType} from 'react';
import {SpectrumDividerProps} from '@react-types/divider';
import styles from '@adobe/spectrum-css-temp/components/rule/vars.css';
import {useSeparator} from '@react-aria/separator';

let sizeMap = {
  S: 'small',
  M: 'medium',
  L: 'large'
};

function Divider(props: SpectrumDividerProps, ref: DOMRef<HTMLElement>) {
  let {
    size = 'L',
    orientation = 'horizontal',
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps({slot: 'divider', ...otherProps});
  let weight = sizeMap[size];

  let Element = 'hr' as ElementType;
  if (orientation === 'vertical') {
    Element = 'div';
  }

  let {separatorProps} = useSeparator({
    ...props,
    elementType: Element
  });

  return (
    // @ts-ignore https://github.com/Microsoft/TypeScript/issues/28892
    <Element
      {...filterDOMProps(otherProps)}
      {...styleProps}
      className={
        classNames(
          styles,
          'spectrum-Rule',
          `spectrum-Rule--${weight}`,
          {
            'spectrum-Rule--vertical': orientation === 'vertical',
            'spectrum-Rule--horizontal': orientation === 'horizontal'
          },
          styleProps.className
        )
      }
      ref={domRef}
      {...separatorProps} />
  );
}

/**
 * Dividers bring clarity to a layout by grouping and dividing content in close proximity.
 * They can also be used to establish rhythm and hierarchy.
 */
let _Divider = React.forwardRef(Divider);
export {_Divider as Divider};
