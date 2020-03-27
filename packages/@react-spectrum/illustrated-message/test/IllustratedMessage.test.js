/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {cleanup, render} from '@testing-library/react';
import {Content, SVGIllustration} from '@react-spectrum/view';
import {Heading} from '@react-spectrum/typography';
import {IllustratedMessage} from '../';
import React from 'react';
import V2IllustratedMessage from '@react/react-spectrum/IllustratedMessage';

function Image(props) {
  return (<svg {...props}><path /></svg>);
}

function renderIllustratedMessage(Component, props) {
  let {
    heading,
    description,
    illustration,
    ...otherProps
  } = props;
  if (Component === IllustratedMessage) {
    return render(
      <Component {...otherProps}>
        <Heading>{heading}</Heading>
        <Content>{description}</Content>
        <SVGIllustration>{illustration}</SVGIllustration>
      </Component>
    );
  } else {
    return render(<Component {...props} />);
  }
}

describe('IllustratedMessage', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name                       | Component               | props
    ${'IllustratedMessage'}    | ${IllustratedMessage}   | ${{heading: 'foo', description: 'bar', illustration: <Image />}}
    ${'V2IllustratedMessage'}  | ${V2IllustratedMessage} | ${{heading: 'foo', description: 'bar', illustration: <Image />}}
  `('$Name should treat the illustration as decorative by default', function ({Component, props}) {
    let {getByRole, getByText, container} = renderIllustratedMessage(Component, props);

    let illustration;
    if (Component === IllustratedMessage) {
      illustration = getByRole('presentation');
    } else {
      illustration = container.querySelector('svg');
    }
    expect(illustration).toHaveAttribute('aria-hidden', 'true');
    getByText('foo');
    getByText('bar');
  });

  // this test passes, but needs refactoring along with aria package
  it.each`
    Name                       | Component               | props
    ${'IllustratedMessage'}    | ${IllustratedMessage}   | ${{heading: 'foo', description: 'bar', illustration: <Image aria-label="baz" />}}
    ${'V2IllustratedMessage'}  | ${V2IllustratedMessage} | ${{heading: 'foo', description: 'bar', illustration: <Image aria-label="baz" />}}
  `('$Name should not be decorative if the svg is labelled', function ({Component, props}) {
    let {getByLabelText, getByRole} = renderIllustratedMessage(Component, props);
    let illustration;

    if (Component === IllustratedMessage) {
      illustration = getByRole('presentation');
      expect(illustration).toHaveAttribute('aria-hidden', 'true');
    } else {
      illustration = getByLabelText('baz');
      expect(illustration).not.toHaveAttribute('aria-hidden');
    }
  });

  // this test passes, but needs refactoring along with aria package
  it.each`
    Name                       | Component               | props
    ${'IllustratedMessage'}    | ${IllustratedMessage}   | ${{heading: 'foo', description: 'bar', illustration: <Image aria-hidden aria-label="its hidden" />}}
    ${'V2IllustratedMessage'}  | ${V2IllustratedMessage} | ${{heading: 'foo', description: 'bar', illustration: <Image aria-hidden aria-label="its hidden" />}}
  `('$Name should be hidden if aria-hidden is specifically set on the illustration', function ({Component, props}) {
    let {getByRole, container} = renderIllustratedMessage(Component, props);

    let illustration;
    if (Component === IllustratedMessage) {
      illustration = getByRole('presentation');
    } else {
      illustration = container.querySelector('svg');
    }
    expect(illustration).toHaveAttribute('aria-hidden', 'true');
  });

  it.each`
    Name                       | Component               | props
    ${'IllustratedMessage'}    | ${IllustratedMessage}   | ${{heading: 'foo', description: 'bar', illustration: <Image />, 'ariaLevel': 3}}
    ${'V2IllustratedMessage'}  | ${V2IllustratedMessage} | ${{heading: 'foo', description: 'bar', illustration: <Image />, 'ariaLevel': 3}}
  `('$Name should support aria-level on the header', function ({Component, props}) {
    let {getByText} = renderIllustratedMessage(Component, props);

    let header = getByText('foo');
    expect(header).toHaveAttribute('aria-level', '3');
  });
});
