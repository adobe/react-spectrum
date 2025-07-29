'use client';
import {
  Button,
  Disclosure as AriaDisclosure,
  DisclosurePanel,
  DisclosureProps as AriaDisclosureProps,
} from 'react-aria-components';
import {Heading} from './Content';
import {ChevronRight} from 'lucide-react';

import './Disclosure.css';

export interface DisclosureProps extends Omit<AriaDisclosureProps, 'children'> {
  title?: string;
  children?: React.ReactNode;
}

export function Disclosure({ title, children, ...props }: DisclosureProps) {
  return (
    (
      <AriaDisclosure {...props}>
        <Heading>
          <Button slot="trigger">
            <ChevronRight size={18} />
            {title}
          </Button>
        </Heading>
        <DisclosurePanel>
          <p>{children}</p>
        </DisclosurePanel>
      </AriaDisclosure>
    )
  );
}
