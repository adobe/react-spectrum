'use client';
import {
  Button,
  Disclosure as AriaDisclosure,
  DisclosurePanel,
  DisclosureProps as AriaDisclosureProps,
  Heading
} from 'react-aria-components';

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
            <svg viewBox="0 0 24 24">
              <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
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
