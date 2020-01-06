import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import React from 'react';
import {SpectrumDividerProps} from '@react-types/divider';
import styles from '@adobe/spectrum-css-temp/components/rule/vars.css';
import {useSeparator} from '@react-aria/separator';
import {useSlotProvider} from '@react-spectrum/layout';

let sizeMap = {
  S: 'small',
  M: 'medium',
  L: 'large'
};

function Divider(props: SpectrumDividerProps, ref: DOMRef) {
  let {
    size = 'L',
    orientation = 'horizontal',
    slot = 'divider',
    ...otherProps
  } = props;
  let {[slot]: slotClassName} = useSlotProvider();
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);
  let weight = sizeMap[size];

  let Element = 'hr';
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
          styleProps.className,
          slotClassName
        )
      }
      ref={domRef}
      {...separatorProps} />
  );
}

let _Divider = React.forwardRef(Divider);
export {_Divider as Divider};
