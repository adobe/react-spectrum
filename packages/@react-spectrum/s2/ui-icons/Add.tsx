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

import Add_L from './S2_AddSize200.svg';
import Add_M from './S2_AddSize100.svg';
import Add_S from './S2_AddSize75.svg';
import Add_XL from './S2_AddSize300.svg';
import Add_XS from './S2_AddSize50.svg';
import {SVGProps} from 'react';

export default function Add(props: SVGProps<SVGSVGElement> & {size?: 'M' | 'L' | 'XL' | 'XS' | 'S'}) {
  let {size = 'M', ...otherProps} = props;
  switch (size) {
    case 'M':
      return <Add_M {...otherProps} />;
    case 'L':
      return <Add_L {...otherProps} />;
    case 'XL':
      return <Add_XL {...otherProps} />;
    case 'XS':
      return <Add_XS {...otherProps} />;
    case 'S':
      return <Add_S {...otherProps} />;
  }
}
