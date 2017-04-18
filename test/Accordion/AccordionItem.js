import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import AccordionItem from '../../src/Accordion/js/AccordionItem';
import Icon from '../../src/Icon';

describe('AccordionItem', () => {
  it('supports additional classNames', () => {
    const tree = shallow(<AccordionItem className="myClass" />);
    expect(tree.hasClass('myClass')).toBe(true);
    expect(tree.hasClass('coral3-Accordion-item')).toBe(true);
  });

  it('supports selected', () => {
    const tree = shallow(<AccordionItem selected />);
    const header = findHeader(tree);
    const icon = header.find(Icon);
    const content = findContent(tree);

    expect(header.prop('aria-selected')).toBe(true);
    expect(header.prop('aria-expanded')).toBe(true);
    expect(icon.prop('icon')).toBe('chevronDown');
    expect(content.prop('aria-hidden')).toBe(false);
    expect(content.prop('className')).toBe('coral3-Accordion-content is-open');
  });

  it('supports header', () => {
    const tree = shallow(<AccordionItem header="foo" />);
    expect(tree.find('.coral3-Accordion-label').text()).toBe('foo');
  });

  it('supports children', () => {
    const tree = shallow(<AccordionItem>foo</AccordionItem>);
    expect(findContent(tree).text()).toBe('foo');
  });

  describe('supports onItemClick', () => {
    let spy;
    let tree;
    let header;

    beforeEach(() => {
      spy = expect.createSpy();
      tree = shallow(<AccordionItem onItemClick={ spy } />);
      header = findHeader(tree);
    });

    it('when header clicked', () => {
      header.simulate('click');
      expect(spy).toHaveBeenCalled();
    });

    it('when enter key pressed', () => {
      header.simulate('keypress', { key: 'Enter' });
      expect(spy).toHaveBeenCalled();
    });
  });
});

const findHeader = tree => tree.find('.coral3-Accordion-header');
const findContent = tree => tree.find('.coral3-Accordion-content');
