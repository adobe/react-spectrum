import {Tabs as RACTabs, TabsProps, composeRenderProps} from 'react-aria-components';
import {tv} from 'tailwind-variants';

const tabsStyles = tv({
  base: 'flex gap-4',
  variants: {
    orientation: {
      horizontal: 'flex-col',
      vertical: 'flex-row'
    }
  }
});

export function Tabs(props: TabsProps) {
  return (
    <RACTabs
      {...props}
      // Define a scroll timeline at the top level of the tabs component
      // so it can be shared between the TabList and TabPanelCarousel.
      style={{timelineScope: '--scroll'} as any}
      className={composeRenderProps(
        props.className,
        (className, renderProps) => tabsStyles({...renderProps, className})
      )} />
  );
}
