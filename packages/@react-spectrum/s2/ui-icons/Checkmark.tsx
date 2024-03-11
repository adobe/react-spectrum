import S2_CheckmarkSize50 from './S2_CheckmarkSize50.svg';
import S2_CheckmarkSize75 from './S2_CheckmarkSize75.svg';
import S2_CheckmarkSize100 from './S2_CheckmarkSize100.svg';
import S2_CheckmarkSize200 from './S2_CheckmarkSize200.svg';
import S2_CheckmarkSize300 from './S2_CheckmarkSize300.svg';
import {SVGProps} from 'react';

export default function Checkmark({size, ...props}: {size: 'S' | 'M' | 'L' | 'XL' | 'XXL'} & SVGProps<SVGSVGElement>) {
  switch (size) {
    case 'S':
      return <S2_CheckmarkSize50 {...props} />;
    case 'M':
      return <S2_CheckmarkSize75 {...props} />;
    case 'L':
      return <S2_CheckmarkSize100 {...props} />;
    case 'XL':
      return <S2_CheckmarkSize200 {...props} />;
    case 'XXL':
      return <S2_CheckmarkSize300 {...props} />;
  }
}
