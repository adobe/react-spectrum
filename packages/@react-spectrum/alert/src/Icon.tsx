import {classNames} from '@react-spectrum/utils';
import * as React from 'react';
import iconStyles from '@adobe/spectrum-css-temp/components/icon/vars.css';
import {useMessageFormatter} from '@react-aria/i18n';
import {useProvider} from '@react-spectrum/provider';

interface IconProps {
  elementType: any,
  elementName: string,
  className: string,
  alt: string,
}

/**
 * temporary!!!!
 * Also, this only works as long as V2 Provider is on the page as well
 */
export function Icon({alt, elementType: IconElement, className, elementName}: IconProps) {
  let {scale} = useProvider();
  return (
    <IconElement
      size={null}
      className={
        classNames(
          iconStyles,
          'spectrum',
          'spectrum-Icon',
          {
            'spectrum--medium': scale['spectrum--medium'],
            'spectrum--large': scale['spectrum--large'],
            [`spectrum-UIIcon-${elementName}`]: elementName
          },
          className
        )
      }
      pathMediumClassName={classNames(iconStyles, 'spectrum-UIIcon--medium')}
      pathLargeClassName={classNames(iconStyles, 'spectrum-UIIcon--large')}
      alt={alt} />
  );
};
