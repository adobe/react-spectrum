import {Accordion, AccordionItem} from '../../src/Accordion';
import assert from 'assert';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';


describe('Accordion', () => {
  it('supports additional classNames', () => {
    const tree = shallow(<Accordion className="myClass" />);
    const wrapper = tree.find('.spectrum-Accordion');

    assert.equal(wrapper.hasClass('myClass'), true);
  });

  describe('selectedKey', () => {
    const renderAccordionWithSelectedIndex = index => shallow(
      <Accordion selectedIndex={index}>
        <AccordionItem header="One" className="one">
          One content.
        </AccordionItem>
        <AccordionItem header="Two" className="two">
          Two content.
        </AccordionItem>
      </Accordion>
    );

    const assertChildWithClassNameSelected = (tree, className) => {
      const child = tree.find('[selected=true]');
      assert.equal(child.length, 1);
      assert.equal(child.prop('className'), className);
    };

    it('supports string index', () => {
      const tree = renderAccordionWithSelectedIndex('1');
      assertChildWithClassNameSelected(tree, 'two');
    });

    it('supports integer index', () => {
      const tree = renderAccordionWithSelectedIndex(1);
      assertChildWithClassNameSelected(tree, 'two');
    });

    // Issue #137
    it('supports integer index of 0', () => {
      const tree = renderAccordionWithSelectedIndex(0);
      assertChildWithClassNameSelected(tree, 'one');
    });
  });


  it('supports defaultSelectedIndex', () => {
    const tree = shallow(
      <Accordion defaultSelectedIndex={1}>
        <AccordionItem header="One" className="one">
          One content.
        </AccordionItem>
        <AccordionItem header="Two" className="two">
          Two content.
        </AccordionItem>
      </Accordion>
    );

    const child = tree.find('[selected=true]');

    assert.equal(child.length, 1);
    assert.equal(child.prop('className'), 'two');
  });

  it('does not call onChange if descendant input is changed', () => {
    const onChange = sinon.spy();

    // We need to use mount instead of shallow because we need our simulated change event to
    // bubble to properly test the scenario. Simulated events don't bubble when rendering shallowly.
    const tree = mount(
      <Accordion defaultSelectedIndex={0} onChange={onChange}>
        <AccordionItem header="One">
          One content. <input type="checkbox" />
        </AccordionItem>
      </Accordion>
    );

    tree.find('input').simulate('change');

    assert(!onChange.called);
  });
});
