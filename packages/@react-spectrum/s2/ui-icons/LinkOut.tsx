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

import LinkOut_L from './S2_LinkOutSize200.svg';
import LinkOut_M from './S2_LinkOutSize100.svg';
import LinkOut_XL from './S2_LinkOutSize300.svg';
import LinkOut_XXL from './S2_LinkOutSize400.svg';
import {SVGProps} from 'react';

export default function LinkOut(props: SVGProps<SVGSVGElement> & {size?: 'M' | 'L' | 'XL' | 'XXL'}) {
  let {size = 'M', ...otherProps} = props;
  switch (size) {
    case 'M':
      return <LinkOut_M {...otherProps} />;
    case 'L':
      return <LinkOut_L {...otherProps} />;
    case 'XL':
      return <LinkOut_XL {...otherProps} />;
    case 'XXL':
      return <LinkOut_XXL {...otherProps} />;
  }
}
