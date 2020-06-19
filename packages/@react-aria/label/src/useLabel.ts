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

import {AriaLabelingProps, DOMProps, LabelableProps} from '@react-types/shared';
import {ElementType, HTMLAttributes, LabelHTMLAttributes} from 'react';
import {useId, useLabels} from '@react-aria/utils';

interface LabelAriaProps extends LabelableProps, DOMProps, AriaLabelingProps {
  /**
   * The tag name of the rendered label. Determines if we can use htmlFor.
   */
  labelElementType?: ElementType
}

interface LabelAria {
  /**
   * Props to be spread on the label element.
   */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  /**
   * Props to be spread on the field associated with the label.
   */
  fieldProps: HTMLAttributes<HTMLElement>
}

/**
 * Associates a label with a field.
 */
export function useLabel(props: LabelAriaProps): LabelAria {
  let {
    id,
    label,
    'aria-labelledby': ariaLabelledby,
    'aria-label': ariaLabel,
    labelElementType = 'label'
  } = props;

  id = useId(id);
  let labelId = useId();
  let labelProps = {};
  if (label) {
    ariaLabelledby = ariaLabelledby ? `${ariaLabelledby} ${labelId}` : labelId;
    labelProps = {
      id: labelId,
      htmlFor: labelElementType === 'label' ? id : undefined
    };
  } else if (!ariaLabelledby && !ariaLabel) {
    console.warn('If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility');
  }

  let fieldProps = useLabels({
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby
  });

  return {
    labelProps,
    fieldProps
  };
}
