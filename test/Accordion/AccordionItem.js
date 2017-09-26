import AccordionItem from '../../src/Accordion/js/AccordionItem';
import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('AccordionItem', () => {
  it('supports additional classNames', () => {
    const tree = shallow(<AccordionItem className="myClass" />);
    assert.equal(tree.hasClass('myClass'), true);
    assert.equal(tree.hasClass('spectrum-Accordion-item'), true);
  });

  it('supports selected', () => {
    const tree = shallow(<AccordionItem selected />);
    const header = findHeader(tree);
    const content = findContent(tree);

    assert.equal(tree.prop('className'), 'spectrum-Accordion-item is-open');
    assert.equal(header.prop('aria-selected'), true);
    assert.equal(header.prop('aria-expanded'), true);
    assert.equal(content.prop('aria-hidden'), false);
  });

  it('supports header', () => {
    const tree = shallow(<AccordionItem header="foo" />);
    assert.equal(tree.find('.spectrum-Accordion-header').text(), 'foo');
  });

  it('supports children', () => {
    const tree = shallow(<AccordionItem>foo</AccordionItem>);
    assert.equal(findContent(tree).text(), 'foo');
  });

  describe('supports onItemClick', () => {
    let spy;
    let tree;
    let header;

    beforeEach(() => {
      spy = sinon.spy();
      tree = shallow(<AccordionItem onItemClick={spy} />);
      header = findHeader(tree);
    });

    it('when header clicked', () => {
      header.simulate('click');
      assert(spy.called);
    });

    it('when enter key pressed', () => {
      header.simulate('keypress', {key: 'Enter'});
      assert(spy.called);
    });
  });
});

const findHeader = tree => tree.find('.spectrum-Accordion-header');
const findContent = tree => tree.find('.spectrum-Accordion-content');
