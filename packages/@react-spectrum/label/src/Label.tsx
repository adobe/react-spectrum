import Asterisk from '@spectrum-icons/ui/Asterisk';
import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import intlMessages from '../intl/*.json';
import React from 'react';
import {SpectrumLabelProps} from '@react-types/label';
import styles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {useMessageFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

function Label(props: SpectrumLabelProps, ref: DOMRef<HTMLLabelElement>) {
  props = useProviderProps(props);
  let {
    children,
    labelPosition = 'top',
    labelAlign = labelPosition === 'side' ? 'start' : null,
    isRequired,
    necessityIndicator = isRequired != null ? 'icon' : null,
    htmlFor,
    for: labelFor,
    elementType: ElementType = 'label',
    ...otherProps
  } = props;

  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);

  let formatMessage = useMessageFormatter(intlMessages);
  let necessityLabel = isRequired ? formatMessage('(required)') : formatMessage('(optional)');
  let icon = (
    <Asterisk
      UNSAFE_className={classNames(styles, 'spectrum-FieldLabel-requiredIcon')}
      size="S" />
  );

  let labelClassNames = classNames(
    styles,
    'spectrum-FieldLabel',
    {
      'spectrum-FieldLabel--positionSide': labelPosition === 'side',
      'spectrum-FieldLabel--alignEnd': labelAlign === 'end'
    },
    styleProps.className
  );

  return (
    <ElementType
      {...filterDOMProps(otherProps)}
      {...styleProps}
      ref={domRef}
      className={labelClassNames}
      htmlFor={ElementType === 'label' ? labelFor || htmlFor : undefined}>
      {children}
      {necessityIndicator && ' \u200b'}
      {/* necessityLabel is hidden to screen readers if the field is required because 
        * aria-required is set on the field in that case. That will already be announced,
        * so no need to duplicate it here. If optional, we do want it to be announced here. */}
      {necessityIndicator === 'label' && <span aria-hidden={isRequired}>{necessityLabel}</span>}
      {necessityIndicator === 'icon' && isRequired && icon}
    </ElementType>
  );
}

let _Label = React.forwardRef(Label);
export {_Label as Label};
