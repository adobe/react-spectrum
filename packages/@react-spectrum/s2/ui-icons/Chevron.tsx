import S2_ChevronSize75 from './S2_ChevronSize75.svg';
import S2_ChevronSize100 from './S2_ChevronSize100.svg';
import S2_ChevronSize200 from './S2_ChevronSize200.svg';
import S2_ChevronSize300 from './S2_ChevronSize300.svg';
import {SVGProps} from 'react';

export default function Chevron({size, ...props}: {size: 'S' | 'M' | 'L' | 'XL'} & SVGProps<SVGSVGElement>) {
  switch (size) {
    case 'S':
      return <S2_ChevronSize75 {...props} />;
    case 'M':
      return <S2_ChevronSize100 {...props} />;
    case 'L':
      return <S2_ChevronSize200 {...props} />;
    case 'XL':
      return <S2_ChevronSize300 {...props} />;
  }
}
