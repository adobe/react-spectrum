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
    let tree = shallow(<AccordionItem selected />);
    assert.equal(tree.hasClass('is-open'), true);
    tree = shallow(<AccordionItem />);
    assert.equal(tree.hasClass('is-open'), false);
  });

  it('supports header', () => {
    const tree = shallow(<AccordionItem header="foo" />);
    assert.equal(tree.find('.spectrum-Accordion-itemHeader').text(), 'foo');
  });

  it('renders children when selected', () => {
    const tree = shallow(<AccordionItem selected>foo</AccordionItem>);
    assert.equal(findContent(tree).text(), 'foo');
  });

  it('doesn\'t render children when not selected', () => {
    const tree = shallow(<AccordionItem>foo</AccordionItem>);
    assert.equal(findContent(tree).text(), '');
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
  });

  describe('Accessibility', () => {
    describe('WAI-ARIA', () => {
      let tree;
      let heading;
      let header;
      let content;

      beforeEach(() => {
        tree = shallow(<AccordionItem header="One">One content</AccordionItem>);
        heading = findHeading(tree);
        header = findHeader(tree);
        content = findContent(tree);
      });

      it('item container div role equals \'presentation\'', () => {
        assert.equal(tree.prop('role'), 'presentation');
      });

      it('header is a \'button\' element', () => {
        assert.equal(header.type(), 'button');
      });

      it('relationship between header and content is defined using aria-controls', () => {
        assert.equal(header.prop('aria-controls'), content.prop('id'));
      });

      it('content role equals \'region\'', () => {
        assert.equal(content.prop('role'), 'region');
      });

      it('content region is labelled by the header using aria-labelledby', () => {
        assert.equal(content.prop('aria-labelledby'), header.prop('id'));
      });

      it('header has parent with role equal to \'heading\' that supports aria-level', () => {
        assert.equal(heading.type(), 'h3');
        assert.equal(heading.prop('aria-level'), undefined);
      });

      it('supports aria-level', () => {
        tree = shallow(<AccordionItem header="One" ariaLevel={4}>One content</AccordionItem>);
        let heading = findHeading(tree);
        assert.equal(heading.prop('aria-level'), 4);
      });

      describe('default WAI-ARIA state properties', () => {
        it('aria-expanded is false', () => {
          assert.equal(header.prop('aria-expanded'), false);
        });

        it('aria-hidden on content region is true', () => {
          assert.equal(content.prop('aria-hidden'), true);
        });
      });

      describe('selected WAI-ARIA state properties', () => {
        beforeEach(() => {
          tree = shallow(<AccordionItem selected />);
          header = findHeader(tree);
          content = findContent(tree);
        });

        it('aria-expanded is false', () => {
          assert.equal(header.prop('aria-expanded'), true);
        });

        it('aria-hidden on content region is true', () => {
          assert.equal(content.prop('aria-hidden'), false);
        });
      });

      describe('disabled state', () => {
        beforeEach(() => {
          tree = shallow(<AccordionItem disabled />);
          header = findHeader(tree);
        });

        it('disabled is true', () => {
          assert.equal(header.prop('disabled'), true);
        });
      });
    });
  });
});
const findHeading = tree => tree.find('.spectrum-Accordion-itemHeading');
const findHeader = tree => tree.find('.spectrum-Accordion-itemHeader');
const findContent = tree => tree.find('.spectrum-Accordion-itemContent');
