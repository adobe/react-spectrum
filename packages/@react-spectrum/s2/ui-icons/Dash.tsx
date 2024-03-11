import S2_DashSize50 from './S2_DashSize50.svg';
import S2_DashSize100 from './S2_DashSize100.svg';
import S2_DashSize200 from './S2_DashSize200.svg';
import S2_DashSize300 from './S2_DashSize300.svg';
import {SVGProps} from 'react';

export default function Dash({size, ...props}: {size: 'S' | 'M' | 'L' | 'XL'} & SVGProps<SVGSVGElement>) {
  switch (size) {
    case 'S':
      return <S2_DashSize50 {...props} />;
    case 'M':
      return <S2_DashSize100 {...props} />;
    case 'L':
      return <S2_DashSize200 {...props} />;
    case 'XL':
      return <S2_DashSize300 {...props} />;
  }
}
