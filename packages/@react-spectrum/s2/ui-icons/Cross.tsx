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
