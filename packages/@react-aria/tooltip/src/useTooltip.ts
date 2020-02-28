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

import {AllHTMLAttributes, useContext} from 'react';
import {DOMProps} from '@react-types/shared';
import {DOMPropsResponderContext} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';

interface TooltipProps extends DOMProps {
  role?: 'tooltip'
  id?: string
}

interface TooltipAria {
  tooltipProps: AllHTMLAttributes<HTMLElement>
}

export function useTooltip(props: TooltipProps): TooltipAria {
  let contextProps = useContext(DOMPropsResponderContext);
  let tooltipId = useId(props.id);

  let {
    role = 'tooltip'
  } = props;

  let tooltipProps: TooltipAria['tooltipProps'] = {
    role,
    id: tooltipId
  };

  if (contextProps) {
    if (contextProps.onPointerLeave && contextProps.onPointerEnter) {
      tooltipProps.onPointerLeave = contextProps.onPointerLeave;
      tooltipProps.onPointerEnter = contextProps.onPointerEnter;
    }
    if (contextProps.onMouseLeave && contextProps.onMouseEnter) {
      tooltipProps.onMouseLeave = contextProps.onMouseLeave;
      tooltipProps.onMouseEnter = contextProps.onMouseEnter;
    }
  }

  return {
    tooltipProps
  };
}
