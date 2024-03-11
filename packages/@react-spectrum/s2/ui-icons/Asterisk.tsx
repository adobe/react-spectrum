import S2_AsteriskSize100 from './S2_AsteriskSize100.svg';
import S2_AsteriskSize200 from './S2_AsteriskSize200.svg';
import S2_AsteriskSize300 from './S2_AsteriskSize300.svg';
import {SVGProps} from 'react';

export default function Asterisk({size, ...props}: {size: 'S' | 'M' | 'L' | 'XL'} & SVGProps<SVGSVGElement>) {
  switch (size) {
    case 'S':
    case 'M':
      return <S2_AsteriskSize100 {...props} />;
    case 'L':
      return <S2_AsteriskSize200 {...props} />;
    case 'XL':
      return <S2_AsteriskSize300 {...props} />;
  }
}
