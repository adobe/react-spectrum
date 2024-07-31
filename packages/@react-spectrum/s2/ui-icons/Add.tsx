import S2_AddSize100 from './S2_AddSize100.svg';
import S2_AddSize200 from './S2_AddSize200.svg';
import S2_AddSize300 from './S2_AddSize300.svg';
import S2_AddSize50 from './S2_AddSize50.svg';
import S2_AddSize75 from './S2_AddSize75.svg';
import {SVGProps} from 'react';

export default function Add({size, ...props}: {size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'} & SVGProps<SVGSVGElement>) {
  switch (size) {
    case 'XS':
      return <S2_AddSize50 {...props} />;
    case 'S':
      return <S2_AddSize75 {...props} />;
    case 'M':
      return <S2_AddSize100 {...props} />;
    case 'L':
      return <S2_AddSize200 {...props} />;
    case 'XL':
      return <S2_AddSize300 {...props} />;
  }
}
