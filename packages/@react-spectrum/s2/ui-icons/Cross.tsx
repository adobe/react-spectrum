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

import S2_CrossSize75 from './S2_CrossSize75.svg';
import S2_CrossSize100 from './S2_CrossSize100.svg';
import S2_CrossSize200 from './S2_CrossSize200.svg';
import S2_CrossSize300 from './S2_CrossSize300.svg';
import S2_CrossSize400 from './S2_CrossSize400.svg';
import S2_CrossSize500 from './S2_CrossSize500.svg';
import {SVGProps} from 'react';

export default function Cross({size, ...props}: {size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL'} & SVGProps<SVGSVGElement>) {
  switch (size) {
    case 'S':
      return <S2_CrossSize75 {...props} />;
    case 'M':
      return <S2_CrossSize100 {...props} />;
    case 'L':
      return <S2_CrossSize200 {...props} />;
    case 'XL':
      return <S2_CrossSize300 {...props} />;
    case 'XXL':
      return <S2_CrossSize400 {...props} />;
    case 'XXXL':
      return <S2_CrossSize500 {...props} />;
  }
}
