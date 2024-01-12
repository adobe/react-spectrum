import {style} from '../style-macro/spectrum-theme.ts' with {type: 'macro'};
import {raw} from '../style-macro/style-macro.ts' with {type: 'macro'};

export function Icon() {
  return (<div className={style({display: 'flex', alignItems: 'center', marginStart: '[calc(-2 / 14 * 1em)]'})() + ' ' + raw('&::before { content: "\u00a0"; width: 0; visibility: hidden } &:only-child { margin-inline-start: 0 }')}>
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={style({
      // width: '[round(calc(20 / 14 * 1em), 2px)]',
      // height: '[round(calc(20 / 14 * 1em), 2px)]',
        width: '[calc(20 / 14 * 1em)]',
        height: '[calc(20 / 14 * 1em)]',
        flexShrink: 0
      })()}>
      <path d="M18 4.25V15.75C18 16.9907 16.9907 18 15.75 18H4.25C3.00928 18 2 16.9907 2 15.75V4.25C2 3.00928 3.00928 2 4.25 2H15.75C16.9907 2 18 3.00928 18 4.25ZM16.5 4.25C16.5 3.83643 16.1636 3.5 15.75 3.5H4.25C3.83643 3.5 3.5 3.83643 3.5 4.25V15.75C3.5 16.1636 3.83643 16.5 4.25 16.5H15.75C16.1636 16.5 16.5 16.1636 16.5 15.75V4.25Z" fill="currentColor" />
      <path d="M13.7632 10C13.7632 10.4214 13.4214 10.7632 13 10.7632H10.7632V13C10.7632 13.4214 10.4214 13.7632 10 13.7632C9.57862 13.7632 9.23682 13.4214 9.23682 13V10.7632H7C6.57861 10.7632 6.23682 10.4214 6.23682 10C6.23682 9.57862 6.57862 9.23682 7 9.23682H9.23682V7C9.23682 6.57861 9.57862 6.23682 10 6.23682C10.4214 6.23682 10.7632 6.57862 10.7632 7V9.23682H13C13.4214 9.23682 13.7632 9.57862 13.7632 10Z" fill="currentColor" />
    </svg>
  </div>);
}
