'use client';
import {
  Button,
  Disclosure as AriaDisclosure,
  DisclosurePanel as AriaDisclosurePanel,
  DisclosureProps,
  DisclosurePanelProps,
  HeadingProps,
} from 'react-aria-components';
import {Heading} from './Content';
import {ChevronRight} from 'lucide-react';
import './Disclosure.css';

export function Disclosure(props: DisclosureProps) {
  return <AriaDisclosure {...props} />;
}

export function DisclosureHeader({children, ...props}: HeadingProps) {
  return (
    <Heading {...props}>
      <Button slot="trigger">
        <ChevronRight size={18} />
        {children}
      </Button>
    </Heading>
  );
}

export function DisclosurePanel(props: DisclosurePanelProps) {
  return (
    <AriaDisclosurePanel {...props}>
      <div>{props.children}</div>
    </AriaDisclosurePanel>
  );
}
