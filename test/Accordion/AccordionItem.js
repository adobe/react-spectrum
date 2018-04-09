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
      header.simulate('keypress', {key: 'Enter', preventDefault: () => {}});
      assert(spy.called);
    });

    it('when space key pressed', () => {
      header.simulate('keypress', {key: ' ', preventDefault: () => {}});
      assert(spy.called);
    });
  });

  describe('Accessibility', () => {
    describe('WAI-ARIA', () => {
      let tree;
      let header;
      let content;

      beforeEach(() => {
        tree = shallow(<AccordionItem header="One">One content</AccordionItem>);
        header = findHeader(tree);
        content = findContent(tree);
      });

      it('item div role equals \'presentation\'', () => {
        assert.equal(tree.prop('role'), 'presentation');
      });

      it('header role equals \'tab\'', () => {
        assert.equal(header.prop('role'), 'tab');
      });

      it('header has tabIndex so that it can receive keyboard focus', () => {
        assert.equal(header.prop('tabIndex'), '0');
      });

      it('relationship between header and content is defined using aria-controls', () => {
        assert.equal(header.prop('aria-controls'), content.prop('id'));
      });

      it('content role equals \'tabpanel\'', () => {
        assert.equal(content.prop('role'), 'tabpanel');
      });

      it('content region is labelled by the header using aria-labelledby', () => {
        assert.equal(content.prop('aria-labelledby'), header.prop('id'));
      });

      it('header has child with role equal to \'heading\' that supports aria-level', () => {
        let heading = header.find('span').first();
        assert.equal(heading.prop('role'), 'heading');
        assert.equal(heading.prop('aria-level'), 3);
      });

      it('supports aria-level', () => {
        tree = shallow(<AccordionItem header="One" ariaLevel={4}>One content</AccordionItem>);
        let heading = tree.find('.spectrum-Accordion-header > span');
        assert.equal(heading.prop('aria-level'), 4);
      });

      describe('default WAI-ARIA state properties', () => {
        it('aria-selected is false', () => {
          assert.equal(header.prop('aria-selected'), false);
        });

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

        it('aria-selected is true', () => {
          assert.equal(header.prop('aria-selected'), true);
        });

        it('aria-expanded is false', () => {
          assert.equal(header.prop('aria-expanded'), true);
        });

        it('aria-hidden on content region is true', () => {
          assert.equal(content.prop('aria-hidden'), false);
        });
      });

      describe('disabled WAI-ARIA state property', () => {
        beforeEach(() => {
          tree = shallow(<AccordionItem disabled />);
          header = findHeader(tree);
        });

        it('aria-disabled is true', () => {
          assert.equal(header.prop('aria-disabled'), true);
        });

        it('header has tabIndex equal to undefined, so that it cannot receive keyboard focus', () => {
          assert.equal(header.prop('tabIndex'), undefined);
        });
      });
    });
  });
});

const findHeader = tree => tree.find('.spectrum-Accordion-header');
const findContent = tree => tree.find('.spectrum-Accordion-content');
