/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {HTMLAttributes, ReactElement, ReactNode, SVGAttributes} from 'react';
import {DOMProps} from '@react-types/shared';

interface IllustratedMessageAriaProps extends DOMProps {
  heading?: string,
  description?: ReactNode,
  illustration?: ReactElement,
  'ariaLevel'?: number
}

interface IllustratedMessageAria {
  illustrationProps: SVGAttributes<SVGElement>,
  headingProps: HTMLAttributes<HTMLHeadingElement>
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
