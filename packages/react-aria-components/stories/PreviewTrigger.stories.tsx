/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button} from 'vanilla-starter/Button';
import {Link} from 'vanilla-starter/Link';
import {Meta, StoryObj} from '@storybook/react';
import {Popover} from 'vanilla-starter/Popover';
import {PreviewTrigger} from '../src/PreviewTrigger';
import React, {JSX, ReactNode} from 'react';

export default {
  title: 'React Aria Components/PreviewTrigger',
  component: PreviewTrigger
} as Meta<typeof PreviewTrigger>;

export type PreviewTriggerStory = StoryObj<typeof PreviewTrigger>;

interface PreviewLinkProps {
  href: string;
  title: string;
  description: string;
  children: ReactNode;
  delay?: number;
  closeDelay?: number;
}

function PreviewLink({
  href,
  title,
  description,
  children,
  delay,
  closeDelay
}: PreviewLinkProps): JSX.Element {
  return (
    <PreviewTrigger delay={delay} closeDelay={closeDelay}>
      <Link href={href} target="_blank">
        {children}
      </Link>
      <Popover offset={4} style={{maxWidth: 260}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'start'}}>
          <strong>{title}</strong>
          <span style={{fontSize: 13}}>{description}</span>
          <Button onPress={() => window.open(href, '_blank', 'noopener')}>Open</Button>
        </div>
      </Popover>
    </PreviewTrigger>
  );
}

function Example(props: {delay?: number; closeDelay?: number}): JSX.Element {
  let {delay, closeDelay} = props;
  return (
    <p style={{maxWidth: 500}}>
      The React Spectrum project includes{' '}
      <PreviewLink
        href="https://react-spectrum.adobe.com/react-aria/"
        title="React Aria"
        description="A library of unstyled React components and hooks that provides accessible UI primitives for your design system."
        delay={delay}
        closeDelay={closeDelay}>
        React Aria
      </PreviewLink>
      ,{' '}
      <PreviewLink
        href="https://react-spectrum.adobe.com/react-spectrum/"
        title="React Spectrum"
        description="A React implementation of Spectrum, Adobe's design system."
        delay={delay}
        closeDelay={closeDelay}>
        React Spectrum
      </PreviewLink>
      , and{' '}
      <PreviewLink
        href="https://react-spectrum.adobe.com/internationalized/"
        title="Internationalized"
        description="A collection of framework-agnostic libraries for handling dates, numbers, and strings across locales."
        delay={delay}
        closeDelay={closeDelay}>
        Internationalized
      </PreviewLink>
      . Hover one preview, then quickly hover the next to see the shared warmup timer make
      subsequent previews open instantly.
    </p>
  );
}

export const Default: PreviewTriggerStory = {
  render: () => <Example />
};

export const WithDelays: PreviewTriggerStory = {
  render: args => <Example delay={args.delay} closeDelay={args.closeDelay} />,
  args: {
    delay: 700,
    closeDelay: 500
  }
};
