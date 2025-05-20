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

import Cross_L from './S2_CrossSize200.svg';
import Cross_M from './S2_CrossSize100.svg';
import Cross_S from './S2_CrossSize75.svg';
import Cross_XL from './S2_CrossSize300.svg';
import Cross_XXL from './S2_CrossSize400.svg';
import Cross_XXXL from './S2_CrossSize500.svg';
import Cross_XXXXL from './S2_CrossSize600.svg';
import {ReactNode, SVGProps} from 'react';
import {style} from '../style' with {type: 'macro'};

let styles = style({
  width: {
    size: {
      M: 8,
      L: 10,
      XL: 12,
      XXL: 12,
      XXXL: 14,
      XXXXL: 16,
      S: 8
    }
  },
  height: {
    size: {
      M: 8,
      L: 10,
      XL: 12,
      XXL: 12,
      XXXL: 14,
      XXXXL: 16,
      S: 8
    }
  }
});

export default function Cross(props: SVGProps<SVGSVGElement> & {size?: 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | 'XXXXL' | 'S'}): ReactNode {
  let {size = 'M', ...otherProps} = props;
  switch (size) {
    case 'M':
      return <Cross_M {...otherProps} className={(otherProps.className || '') + styles({size})} />;
    case 'L':
      return <Cross_L {...otherProps} className={(otherProps.className || '') + styles({size})} />;
    case 'XL':
      return <Cross_XL {...otherProps} className={(otherProps.className || '') + styles({size})} />;
    case 'XXL':
      return <Cross_XXL {...otherProps} className={(otherProps.className || '') + styles({size})} />;
    case 'XXXL':
      return <Cross_XXXL {...otherProps} className={(otherProps.className || '') + styles({size})} />;
    case 'XXXXL':
      return <Cross_XXXXL {...otherProps} className={(otherProps.className || '') + styles({size})} />;
    case 'S':
      return <Cross_S {...otherProps} className={(otherProps.className || '') + styles({size})} />;
  }
}
