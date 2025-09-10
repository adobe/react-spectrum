'use client';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};

export function IconSizes() {
  return (
    <div className={style({display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'end'})}>
      <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4})}>
        <CheckmarkCircle styles={iconStyle({size: 'XS'})} />
        <span className={style({font: 'ui-sm'})}>XS (14px)</span>
      </div>
      <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4})}>
        <CheckmarkCircle styles={iconStyle({size: 'S'})} />
        <span className={style({font: 'ui-sm'})}>S (16px)</span>
      </div>
      <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4})}>
        <CheckmarkCircle styles={iconStyle({size: 'M'})} />
        <span className={style({font: 'ui-sm', fontWeight: 'bold'})}>M (20px)</span>
      </div>
      <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4})}>
        <CheckmarkCircle styles={iconStyle({size: 'L'})} />
        <span className={style({font: 'ui-sm'})}>L (22px)</span>
      </div>
      <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4})}>
        <CheckmarkCircle styles={iconStyle({size: 'XL'})} />
        <span className={style({font: 'ui-sm'})}>XL (26px)</span>
      </div>
    </div>
  );
}
