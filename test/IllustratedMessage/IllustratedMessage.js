/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import assert from 'assert';
import Heading from '../../src/Heading';
import IllustratedMessage from '../../src/IllustratedMessage';
import React from 'react';
import {shallow} from 'enzyme';

describe('IllustratedMessage', () => {

  it('should support customization', () => {
    const props = {
      heading: 'Upload a file',
      description: 'Drag a file into the square',
      illustration: <svg><path /></svg>
    };

    const tree = shallow(<IllustratedMessage {...props} />);

    const headingNode = findHeadingNode(tree);
    assert.equal(headingNode.children().text(), props.heading);
    assert.equal(headingNode.prop('className'), 'spectrum-IllustratedMessage-heading');

    assert.equal(findDescriptionNode(tree).text(), props.description);

    assert.equal(findIllustrationNode(tree).prop('aria-hidden'), true);
  });

  it('should treat illustration as decorative by default', () => {
    const props = {
      heading: 'Upload a file',
      description: 'Drag a file into the square',
      illustration: <svg><path /></svg>
    };

    const tree = shallow(<IllustratedMessage {...props} />);
    let illustrationNode = findIllustrationNode(tree);

    assert.equal(illustrationNode.prop('aria-hidden'), true);

    tree.setProps({illustration: <svg aria-label="foo"><path /></svg>});
    illustrationNode = findIllustrationNode(tree);
    assert.equal(illustrationNode.prop('aria-hidden'), null);
    assert.equal(illustrationNode.prop('aria-label'), 'foo');

    tree.setProps({illustration: <svg aria-label="foo" aria-hidden><path /></svg>});
    illustrationNode = findIllustrationNode(tree);
    assert.equal(illustrationNode.prop('aria-hidden'), true);
    assert.equal(illustrationNode.prop('aria-label'), 'foo');
  });

  it('should support ariaLevel prop to set aria-level on Heading', () => {
    const props = {
      heading: 'Upload a file',
      description: 'Drag a file into the square',
      illustration: <svg><path /></svg>,
      ariaLevel: 3
    };

    const tree = shallow(<IllustratedMessage {...props} />);

    const headingNode = findHeadingNode(tree);
    assert.equal(headingNode.prop('aria-level'), props.ariaLevel);
  });
});

const findHeadingNode = tree => tree.find(Heading);
const findDescriptionNode = tree => tree.find('.spectrum-IllustratedMessage-description');
const findIllustrationNode = tree => tree.find('.spectrum-IllustratedMessage-illustration');
