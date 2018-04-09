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

    it('sets selection on header click', () => {
      const div = global.document.createElement('div');
      global.document.body.appendChild(div);
      const tree = mount(
        <Accordion>
          <AccordionItem header="One" className="one">
            One content.
          </AccordionItem>
          <AccordionItem header="Two" className="two">
            Two content.
          </AccordionItem>
        </Accordion>,
        {appendTo: div}
      );
      const wrapper = tree.find('.spectrum-Accordion');
      assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-selected'), 'false');
      assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-expanded'), 'false');
      findAccordionHeaderAt(wrapper, 0).simulate('click');
      assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-selected'), 'true');
      assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-expanded'), 'true');
      findAccordionHeaderAt(wrapper, 1).simulate('click');
      assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-selected'), 'false');
      assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-expanded'), 'false');
      assert.equal(findAccordionHeaderAt(wrapper, 1).getDOMNode().getAttribute('aria-selected'), 'true');
      assert.equal(findAccordionHeaderAt(wrapper, 1).getDOMNode().getAttribute('aria-expanded'), 'true');
      tree.unmount();
    });
  });

  it('supports multiselectable', () => {
    const div = global.document.createElement('div');
    global.document.body.appendChild(div);
    const tree = mount(
      <Accordion multiselectable>
        <AccordionItem header="One" className="one">
          One content.
        </AccordionItem>
        <AccordionItem header="Two" className="two">
          Two content.
        </AccordionItem>
      </Accordion>,
      {appendTo: div}
    );
    tree.setProps({multiselectable: true});
    const wrapper = tree.find('.spectrum-Accordion');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-selected'), 'false');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-expanded'), 'false');
    findAccordionHeaderAt(wrapper, 0).simulate('click');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-selected'), 'true');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-expanded'), 'true');
    findAccordionHeaderAt(wrapper, 1).simulate('click');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-selected'), 'true');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-expanded'), 'true');
    assert.equal(findAccordionHeaderAt(wrapper, 1).getDOMNode().getAttribute('aria-selected'), 'true');
    assert.equal(findAccordionHeaderAt(wrapper, 1).getDOMNode().getAttribute('aria-expanded'), 'true');
    findAccordionHeaderAt(wrapper, 1).simulate('click');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-selected'), 'true');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-expanded'), 'true');
    assert.equal(findAccordionHeaderAt(wrapper, 1).getDOMNode().getAttribute('aria-selected'), 'false');
    assert.equal(findAccordionHeaderAt(wrapper, 1).getDOMNode().getAttribute('aria-expanded'), 'false');
    tree.unmount();
  });

  it('sets selection with selectedIndex prop', () => {
    const div = global.document.createElement('div');
    global.document.body.appendChild(div);
    const tree = mount(
      <Accordion>
        <AccordionItem header="One" className="one">
          One content.
        </AccordionItem>
        <AccordionItem header="Two" className="two">
          Two content.
        </AccordionItem>
      </Accordion>,
      {appendTo: div}
    );
    const wrapper = tree.find('.spectrum-Accordion');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-selected'), 'false');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-expanded'), 'false');
    tree.setProps({selectedIndex: 0});
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-selected'), 'true');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-expanded'), 'true');
    tree.setProps({selectedIndex: 1});
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-selected'), 'false');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-expanded'), 'false');
    assert.equal(findAccordionHeaderAt(wrapper, 1).getDOMNode().getAttribute('aria-selected'), 'true');
    assert.equal(findAccordionHeaderAt(wrapper, 1).getDOMNode().getAttribute('aria-expanded'), 'true');
    tree.setProps({multiselectable: true});
    tree.setProps({selectedIndex: []});
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-selected'), 'false');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-expanded'), 'false');
    assert.equal(findAccordionHeaderAt(wrapper, 1).getDOMNode().getAttribute('aria-selected'), 'false');
    assert.equal(findAccordionHeaderAt(wrapper, 1).getDOMNode().getAttribute('aria-expanded'), 'false');
    tree.setProps({selectedIndex: [0, 1]});
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-selected'), 'true');
    assert.equal(findAccordionHeaderAt(wrapper, 0).getDOMNode().getAttribute('aria-expanded'), 'true');
    assert.equal(findAccordionHeaderAt(wrapper, 1).getDOMNode().getAttribute('aria-selected'), 'true');
    assert.equal(findAccordionHeaderAt(wrapper, 1).getDOMNode().getAttribute('aria-expanded'), 'true');
    tree.unmount();
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
    tree.unmount();
  });


  describe('Accessibility', () => {
    it('should have role="tablist"', () => {
      const tree = shallow(<Accordion />);
      const wrapper = tree.find('.spectrum-Accordion');

      assert.equal(wrapper.prop('role'), 'tablist');
    });

    it('should have aria-orientation="vertical"', () => {
      const tree = shallow(<Accordion />);
      const wrapper = tree.find('.spectrum-Accordion');

      assert.equal(wrapper.prop('aria-orientation'), 'vertical');
    });

    it('should have aria-multiselectable="false" if multiselectable is false', () => {
      const tree = shallow(<Accordion />);
      const wrapper = tree.find('.spectrum-Accordion');

      assert.equal(wrapper.prop('aria-multiselectable'), false);
    });

    it('should have aria-multiselectable="true" if multiselectable is true', () => {
      const tree = shallow(<Accordion multiselectable />);
      const wrapper = tree.find('.spectrum-Accordion');

      assert.equal(wrapper.prop('aria-multiselectable'), true);
    });

    describe('Keyboard navigation', () => {
      let tree;
      let wrapper;
      let header;
      before(() => {
        tree = mount(<Accordion>
          <AccordionItem header="Zero" disabled>
            Zero content.
          </AccordionItem>
          <AccordionItem header="One">
            One content.
          </AccordionItem>
          <AccordionItem header="Two">
            Two content.
          </AccordionItem>
          <AccordionItem header="Three" disabled>
            Three content.
          </AccordionItem>
          <AccordionItem header="Four">
            Four content.
          </AccordionItem>
          <AccordionItem header="Five" disabled>
            Five content.
          </AccordionItem>
        </Accordion>);
        wrapper = tree.find('.spectrum-Accordion');
      });

      after(() => {
        tree.unmount();
      });

      it('when ArrowDown key is pressed, focus next not disabled item header', () => {
        header = findAccordionHeaderAt(wrapper, 1);
        header.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
        assert.equal(findAccordionHeaderAt(wrapper, 2).prop('id'), document.activeElement.id);
        header = findAccordionHeaderAt(wrapper, 2);
        header.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
        assert.notEqual(findAccordionHeaderAt(wrapper, 3).prop('id'), document.activeElement.id);
        assert.equal(findAccordionHeaderAt(wrapper, 4).prop('id'), document.activeElement.id);
      });

      it('when ArrowDown key is pressed on last item, focus first not disabled item header', () => {
        header = findAccordionHeaderAt(wrapper, 4);
        header.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
        assert.equal(findAccordionHeaderAt(wrapper, 1).prop('id'), document.activeElement.id);
      });

      it('when ArrowUp key is pressed, focus previous not disabled item header', () => {
        header = findAccordionHeaderAt(wrapper, 4);
        header.simulate('keydown', {key: 'ArrowUp', preventDefault: () => {}});
        assert.notEqual(findAccordionHeaderAt(wrapper, 3).prop('id'), document.activeElement.id);
        assert.equal(findAccordionHeaderAt(wrapper, 2).prop('id'), document.activeElement.id);
        header = wrapper.find(AccordionItem).at(2).find('.spectrum-Accordion-header');
        header.simulate('keydown', {key: 'ArrowUp', preventDefault: () => {}});
        assert.equal(findAccordionHeaderAt(wrapper, 1).prop('id'), document.activeElement.id);
      });

      it('when ArrowUp key is pressed on first item, focus last not disabled item header', () => {
        header = findAccordionHeaderAt(wrapper, 1);
        header.simulate('keydown', {key: 'ArrowUp', preventDefault: () => {}});
        assert.equal(findAccordionHeaderAt(wrapper, 4).prop('id'), document.activeElement.id);
      });

      it('when End key is pressed, focus last not disabled item header', () => {
        header = findAccordionHeaderAt(wrapper, 1);
        header.simulate('keydown', {key: 'End', preventDefault: () => {}});
        assert.equal(findAccordionHeaderAt(wrapper, 4).prop('id'), document.activeElement.id);
      });

      it('when Home key is pressed, focus first not disabled item header', () => {
        header = findAccordionHeaderAt(wrapper, 4);
        header.simulate('keydown', {key: 'Home', preventDefault: () => {}});
        assert.equal(findAccordionHeaderAt(wrapper, 1).prop('id'), document.activeElement.id);
      });
    });

  });
});

const findAccordionItemAt = (wrapper, index) => wrapper.find(AccordionItem).at(index);
const findAccordionHeaderAt = (wrapper, index) => findAccordionItemAt(wrapper, index).find('.spectrum-Accordion-header');
