import S2_LinkOutSize100 from './S2_LinkOutSize100.svg';
import S2_LinkOutSize200 from './S2_LinkOutSize200.svg';
import S2_LinkOutSize300 from './S2_LinkOutSize300.svg';
import {SVGProps} from 'react';

export default function LinkOut({size, ...props}: {size: 'S' | 'M' | 'L' | 'XL'} & SVGProps<SVGSVGElement>) {
  switch (size) {
    case 'S':
      return <S2_LinkOutSize100 {...props} />;
    case 'M':
      return <S2_LinkOutSize200 {...props} />;
    case 'L':
    case 'XL': // these are the same according to menu tokens
      return <S2_LinkOutSize300 {...props} />;
  }
}
