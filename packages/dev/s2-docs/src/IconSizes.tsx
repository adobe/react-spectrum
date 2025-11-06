'use client';

import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};

type SizeInfo = {
  size: string,
  pixels: string
};

const labelStyle = style({
  font: 'ui-sm',
  fontWeight: {
    size: {
      'M': 'bold',
      default: 'normal'
    }
  }
});

let renderCheckMark = (size: string) => {
  if (size === 'XS') {
    return <CheckmarkCircle styles={iconStyle({size: 'XS'})} />;
  } else if (size === 'S') {
    return <CheckmarkCircle styles={iconStyle({size: 'S'})} />;
  } else if (size === 'M') {
    return <CheckmarkCircle styles={iconStyle({size: 'M'})} />;
  } else if (size === 'L') {
    return <CheckmarkCircle styles={iconStyle({size: 'L'})} />;
  } else if (size === 'XL') {
    return <CheckmarkCircle styles={iconStyle({size: 'XL'})} />;
  }
  return null;
};

export function IconSizes({sizes}: {sizes: SizeInfo[]}) {
  return (
    <div className={style({display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'end'})}>
      {sizes.map(({size, pixels}) => (
        <div key={size} className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4})}>
          {renderCheckMark(size)}
          <span className={labelStyle({size})}>{size} ({pixels})</span>
        </div>
      ))}
    </div>
  );
}
