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

import Checkmark_L from './S2_CheckmarkSize200.svg';
import Checkmark_M from './S2_CheckmarkSize100.svg';
import Checkmark_S from './S2_CheckmarkSize75.svg';
import Checkmark_XL from './S2_CheckmarkSize300.svg';
import Checkmark_XS from './S2_CheckmarkSize50.svg';
import Checkmark_XXL from './S2_CheckmarkSize400.svg';
import {SVGProps} from 'react';

export default function Checkmark(props: SVGProps<SVGSVGElement> & {size?: 'M' | 'L' | 'XL' | 'XXL' | 'XS' | 'S'}) {
  let {size = 'M', ...otherProps} = props;
  switch (size) {
    case 'M':
      return <Checkmark_M {...otherProps} />;
    case 'L':
      return <Checkmark_L {...otherProps} />;
    case 'XL':
      return <Checkmark_XL {...otherProps} />;
    case 'XXL':
      return <Checkmark_XXL {...otherProps} />;
    case 'XS':
      return <Checkmark_XS {...otherProps} />;
    case 'S':
      return <Checkmark_S {...otherProps} />;
  }
}
