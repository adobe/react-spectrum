/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import DragHandle_L from './S2_DragHandleSize200.svg';
import DragHandle_M from './S2_DragHandleSize100.svg';
import DragHandle_S from './S2_DragHandleSize75.svg';
import DragHandle_XL from './S2_DragHandleSize300.svg';
import {ReactNode, SVGProps} from 'react';
import {style} from '../style' with {type: 'macro'};

let styles = style({
  width: {
    size: {
      M: 10,
      L: 12,
      XL: 14,
      S: 10
    }
  },
  height: {
    size: {
      M: 10,
      L: 12,
      XL: 14,
      S: 10
    }
  }
});

export default function DragHandle(props: SVGProps<SVGSVGElement> & {size?: 'M' | 'L' | 'XL' | 'S'}): ReactNode {
  let {size = 'M', ...otherProps} = props;
  switch (size) {
    case 'M':
      return <DragHandle_M {...otherProps} className={(otherProps.className || '') + styles({size})} />;
    case 'L':
      return <DragHandle_L {...otherProps} className={(otherProps.className || '') + styles({size})} />;
    case 'XL':
      return <DragHandle_XL {...otherProps} className={(otherProps.className || '') + styles({size})} />;
    case 'S':
      return <DragHandle_S {...otherProps} className={(otherProps.className || '') + styles({size})} />;
  }
}
