import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, ReactNode, RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/illustratedmessage/vars.css';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import {useIllustratedMessage} from '@react-aria/illustrated-message';
import {useProviderProps} from '@react-spectrum/provider';

export interface IllustratedMessageProps extends DOMProps {
  heading?: string,
  description?: ReactNode,
  illustration?: ReactElement,
  ariaLevel?: number
}

export const IllustratedMessage = React.forwardRef((props: IllustratedMessageProps, ref: RefObject<HTMLElement>) => {
  let completeProps = useProviderProps(props);
  let {
    className,
    illustration,
    heading,
    description
  } = completeProps;
  let {
    illustrationProps,
    headingProps
  } = useIllustratedMessage(completeProps);

  // todo replace h2 with rsp heading when it exists
  return (
    <div
      {...filterDOMProps(completeProps, {'aria-level': false})}
      ref={ref}
      className={classNames(styles, 'spectrum-IllustratedMessage', className)}>
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
});
