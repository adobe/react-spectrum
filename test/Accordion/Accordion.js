import React from 'react';
import expect from 'expect';
import {shallow, mount} from 'enzyme';
import {Accordion, AccordionItem} from '../../src/Accordion';

describe('Accordion', () => {
  it('supports additional classNames', () => {
    const tree = shallow(<Accordion className="myClass" />);
    const wrapper = tree.find('.coral3-Accordion');

    expect(wrapper.hasClass('myClass')).toBe(true);
  });

  it('supports quiet variant', () => {
    const tree = shallow(<Accordion variant="quiet" />);
    const wrapper = tree.find('.coral3-Accordion');

    expect(wrapper.hasClass('coral3-Accordion--quiet')).toBe(true);
  });

  it('supports large variant', () => {
    const tree = shallow(<Accordion variant="large" />);
    const wrapper = tree.find('.coral3-Accordion');

    expect(wrapper.hasClass('coral3-Accordion--large')).toBe(true);
  });

  describe('selectedKey', () => {
    const renderAccordionWithSelectedIndex = index => shallow(
      <Accordion selectedIndex={ index }>
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
      expect(child.length).toBe(1);
      expect(child.node.props.className).toBe(className);
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
      <Accordion defaultSelectedIndex={ 1 }>
        <AccordionItem header="One" className="one">
          One content.
        </AccordionItem>
        <AccordionItem header="Two" className="two">
          Two content.
        </AccordionItem>
      </Accordion>
    );

    const child = tree.find('[selected=true]');

    expect(child.length).toBe(1);
    expect(child.node.props.className).toBe('two');
  });

  it('does not call onChange if descendant input is changed', () => {
    const onChange = expect.createSpy();

    // We need to use mount instead of shallow because we need our simulated change event to
    // bubble to properly test the scenario. Simulated events don't bubble when rendering shallowly.
    const tree = mount(
      <Accordion defaultSelectedIndex={ 0 } onChange={ onChange }>
        <AccordionItem header="One">
          One content. <input type="checkbox" />
        </AccordionItem>
      </Accordion>
    );

    tree.find('input').simulate('change');

    expect(onChange).toNotHaveBeenCalled();
  });
});
