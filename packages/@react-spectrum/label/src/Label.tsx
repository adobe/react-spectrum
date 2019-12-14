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
    <label
      {...filterDOMProps(otherProps)}
      {...styleProps}
      ref={domRef}
      className={labelClassNames}
      htmlFor={labelFor || htmlFor}>
      {children}
      {necessityIndicator && ' \u200b'}
      {necessityIndicator === 'label' && <span aria-hidden="true">{necessityLabel}</span>}
      {necessityIndicator === 'icon' && isRequired && icon}
    </label>
  );
}

let _Label = React.forwardRef(Label);
export {_Label as Label};
