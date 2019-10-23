import {AllHTMLAttributes, ReactElement, ReactNode, SVGAttributes} from 'react';
import {DOMProps} from '@react-types/shared';

interface IllustratedMessageAriaProps extends DOMProps {
  heading?: string,
  description?: ReactNode,
  illustration?: ReactElement,
  'ariaLevel'?: number
}

interface IllustratedMessageAria {
  illustrationProps: SVGAttributes<SVGElement>,
  headingProps: AllHTMLAttributes<HTMLHeadingElement>
}

export function useIllustratedMessage(props: IllustratedMessageAriaProps): IllustratedMessageAria {
  let {
    illustration,
    heading,
    description,
    ariaLevel
  } = props;

  function isDecorative() {
    if (illustration) {
      let {
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby,
        'aria-hidden': ariaHidden
      } = illustration.props;

      // If illustration is explicitly hidden for accessibility return the ariaHidden value.
      if (ariaHidden != null) {
        return ariaHidden;
      }

      // If illustration is explicitly labelled using aria-label or aria-labelledby return null.
      if (ariaLabel || ariaLabelledby) {
        return false;
      }
    }
    return !!(heading || description);
  }

  let decorative = isDecorative();
  return {
    illustrationProps: {
      'aria-hidden': decorative || undefined,
      role: decorative ? 'presentation' : 'img'
    },
    headingProps: {
      'aria-level': ariaLevel
    }
  };
}
