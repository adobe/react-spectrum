import {classNames, DOMRef, filterDOMProps, useDOMRef} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import React, {forwardRef, ReactElement, ReactNode} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/illustratedmessage/vars.css';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import {useIllustratedMessage} from '@react-aria/illustrated-message';

export interface IllustratedMessageProps extends DOMProps, StyleProps {
  heading?: string,
  description?: ReactNode,
  illustration?: ReactElement,
  ariaLevel?: number
}

function IllustratedMessage(props: IllustratedMessageProps, ref: DOMRef<HTMLDivElement>) {
  let {
    illustration,
    heading,
    description,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);
  let {
    illustrationProps,
    headingProps
  } = useIllustratedMessage(props);

  // todo replace h2 with rsp heading when it exists
  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      ref={domRef}
      className={classNames(styles, 'spectrum-IllustratedMessage', styleProps.className)}>
      {illustration &&
        React.cloneElement(illustration, {
          ...illustrationProps,
          className: classNames(styles, illustration.props.className, 'spectrum-IllustratedMessage-illustration')
        })
      }
      {heading &&
        <h2
          {...headingProps}
          className={
            classNames(
              {},
              classNames(typographyStyles, 'spectrum-Heading', 'spectrum-Heading--pageTitle'),
              classNames(styles, 'spectrum-IllustratedMessage-heading')
            )}>
          {heading}
        </h2>
      }
      {description &&
        <p className={classNames({}, classNames(typographyStyles, 'spectrum-Body--secondary'), classNames(styles, 'spectrum-IllustratedMessage-description'))}>{description}</p>
      }
    </div>
  );
}

let _IllustratedMessage = forwardRef(IllustratedMessage);
export {_IllustratedMessage as IllustratedMessage};
