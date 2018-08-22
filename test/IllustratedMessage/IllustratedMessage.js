import assert from 'assert';
import Heading from '../../src/Heading/js/Heading';
import IllustratedMessage from '../../src/IllustratedMessage';
import React from 'react';
import {shallow} from 'enzyme';

describe('IllustratedMessage', () => {

  it('should support customization', () => {
    const headingText = 'Upload a file';
    const descriptionText = 'Drag a file into the square';
    const tree = shallow(<IllustratedMessage heading={headingText} description={descriptionText} illustration={<svg><path /></svg>} />);

    const headingNode = tree.find(Heading);
    assert.equal(headingNode.children().text(), headingText);
    assert.equal(headingNode.prop('className'), 'spectrum-IllustratedMessage-heading');

    const descriptionNode = tree.find('.spectrum-IllustratedMessage-description');
    assert.equal(descriptionNode.text(), descriptionText);
  });
});
