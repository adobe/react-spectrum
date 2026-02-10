import {Disclosure, DisclosurePanel, DisclosureTitle} from '@react-spectrum/s2';
import React from 'react';

export function PatternTestingFAQ({patternName}: {patternName: string}) {
  return (
    <>
      <Disclosure isQuiet>
        <DisclosureTitle>When using the test utils, what if a certain interaction errors or doesn't seem to result in the expected state?</DisclosureTitle>
        <DisclosurePanel>
          In cases like this, first double check your test setup and make sure that your test is rendering your {patternName} in its expected
          state before the test util interaction call. If everything looks correct, you can always fall back to simulating interactions manually,
          and using the test util to query your {patternName}'s state post interaction.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure isQuiet>
        <DisclosureTitle>The tester doesn't offer a specific interaction flow, what should I do?</DisclosureTitle>
        <DisclosurePanel>
          Whenever the {patternName} tester queries its elements or triggers a user flow, it does so against the current state of the {patternName}. Therefore the {patternName} tester can be used alongside
          whatever simulated user flow you add.
        </DisclosurePanel>
      </Disclosure>
    </>
  );
}
