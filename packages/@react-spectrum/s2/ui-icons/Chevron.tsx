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

import Chevron_L from './S2_ChevronSize200.svg';
import Chevron_M from './S2_ChevronSize100.svg';
import Chevron_S from './S2_ChevronSize75.svg';
import Chevron_XL from './S2_ChevronSize300.svg';
import Chevron_XS from './S2_ChevronSize50.svg';
import Chevron_XXL from './S2_ChevronSize400.svg';
import {SVGProps} from 'react';

export default function Chevron(props: SVGProps<SVGSVGElement> & {size?: 'M' | 'L' | 'XL' | 'XXL' | 'XS' | 'S'}) {
  let {size = 'M', ...otherProps} = props;
  switch (size) {
    case 'M':
      return <Chevron_M {...otherProps} />;
    case 'L':
      return <Chevron_L {...otherProps} />;
    case 'XL':
      return <Chevron_XL {...otherProps} />;
    case 'XXL':
      return <Chevron_XXL {...otherProps} />;
    case 'XS':
      return <Chevron_XS {...otherProps} />;
    case 'S':
      return <Chevron_S {...otherProps} />;
  }
}
