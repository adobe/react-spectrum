import {Disclosure, DisclosurePanel, DisclosureTitle, Link} from '@react-spectrum/s2';
import React from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export function S2FAQ() {
  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
      <Disclosure isQuiet>
        <DisclosureTitle>I'm getting a "Could not statically evaluate macro argument" error.</DisclosureTitle>
        <DisclosurePanel>
          This indicates that your <code>style</code> macro has a condition that isn't evaluable at build time. This can happen for a variety of reasons such
          as if you've referenced non-constant variables within your <code>style</code> macro or if you've called non-macro functions within your <code>style</code> macro.
          If you are using Typescript, it can be as simple as forgetting to add <code>as const</code> to your own defined reusable macro.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure isQuiet>
        <DisclosureTitle>I'm seeing a ton of duplicate rules being generated and/or my dev tools are very slow.</DisclosureTitle>
        <DisclosurePanel>
          Please make sure you've followed the best practices listed above.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure isQuiet>
        <DisclosureTitle>I tried to pass my style macro to "UNSAFE_className" but it doesn't work.</DisclosureTitle>
        <DisclosurePanel>
          The <code>style</code> macro is not meant to be used with <code>UNSAFE_className</code>. Overrides to the Spectrum styles is highly discouraged,
          consider styling an equivalent React Aria Component instead.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure isQuiet>
        <DisclosureTitle>I'm coming from S1, but where are Flex/Grid/etc?</DisclosureTitle>
        <DisclosurePanel>
          These no longer exist. Please style <code>&lt;div&gt;</code>, <code>&lt;span&gt;</code>, and other standard HTML elements with the <code>style</code> macro instead.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure isQuiet>
        <DisclosureTitle>Where can I find a list of what values are supported by the style macro?</DisclosureTitle>
        <DisclosurePanel>
          See the <Link href="style-macro">following page</Link> for a full list of what values are supported by the <code>style</code> macro.
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
