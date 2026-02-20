import {TabPanel as RACTabPanel, TabPanelProps, composeRenderProps} from 'react-aria-components';
import {tv} from 'tailwind-variants';
import {focusRing} from 'tailwind-starter/utils';

const tabPanelStyles = tv({
  extend: focusRing,
  base: 'shrink-0 w-full snap-start snap-always box-border px-4 text-sm text-gray-900 dark:text-zinc-100'
});

export function TabPanel(props: TabPanelProps) {
  return (
    <RACTabPanel
      {...props}
      className={composeRenderProps(
        props.className,
        (className, renderProps) => tabPanelStyles({...renderProps, className})
      )} />
  );
}
