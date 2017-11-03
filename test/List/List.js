import assert from 'assert';
import {List} from '../../src/List';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

const render = (props = {}) => shallow(<List {...props} />);

describe('List', () => {
  let tree;
  let instance;

  describe('focus', () => {
    let firstItemFocusSpy;
    let secondItemFocusSpy;

    beforeEach(() => {
      firstItemFocusSpy = sinon.spy();
      secondItemFocusSpy = sinon.spy();
      tree = render();
      instance = tree.instance();
    });

    describe('handleFocusFirst', () => {
      it('focuses first list item', () => {
        instance.getItems = () => [{focus: firstItemFocusSpy}, {focus: secondItemFocusSpy}];
        instance.handleFocusFirst();
        assert(firstItemFocusSpy.called);
        assert(!secondItemFocusSpy.called);
      });

      it('doesn\'t try to focus if there are no list items', () => {
        instance.getItems = () => [];
        assert.doesNotThrow(() => instance.handleFocusFirst());
      });
    });

    describe('handleFocusLast', () => {
      it('focuses last list item', () => {
        instance.getItems = () => [{focus: firstItemFocusSpy}, {focus: secondItemFocusSpy}];
        instance.handleFocusLast();
        assert(!firstItemFocusSpy.called);
        assert(secondItemFocusSpy.called);
      });

      it('doesn\'t try to focus if there are no list items', () => {
        instance.getItems = () => [];
        assert.doesNotThrow(() => instance.handleFocusLast());
      });
    });

    describe('handleFocusPrevious', () => {
      it('focuses the previous list item', () => {
        const items = [{focus: firstItemFocusSpy}, {focus: secondItemFocusSpy}];
        instance.getItems = () => items;
        instance.handleFocusPrevious({target: instance.getItems()[1]});
        assert(firstItemFocusSpy.called);
        assert(!secondItemFocusSpy.called);
      });

      it('wraps focus if the first node is focused', () => {
        const items = [{focus: firstItemFocusSpy}, {focus: secondItemFocusSpy}];
        instance.getItems = () => items;
        instance.handleFocusNext({target: instance.getItems()[0]});
        assert(!firstItemFocusSpy.called);
        assert(secondItemFocusSpy.called);
      });

      it('doesn\'t try to focus if there are no list items', () => {
        instance.getItems = () => [];
        assert.doesNotThrow(() => instance.handleFocusPrevious());
      });
    });

    describe('handleFocusNext', () => {
      it('focuses the next list item', () => {
        const items = [{focus: firstItemFocusSpy}, {focus: secondItemFocusSpy}];
        instance.getItems = () => items;
        instance.handleFocusNext({target: instance.getItems()[0]});
        assert(!firstItemFocusSpy.called);
        assert(secondItemFocusSpy.called);
      });

      it('wraps focus if the last node is focused', () => {
        const items = [{focus: firstItemFocusSpy}, {focus: secondItemFocusSpy}];
        instance.getItems = () => items;
        instance.handleFocusNext({target: instance.getItems()[1]});
        assert(firstItemFocusSpy.called);
        assert(!secondItemFocusSpy.called);
      });

      it('doesn\'t try to focus if there are no list items', () => {
        instance.getItems = () => [];
        assert.doesNotThrow(() => instance.handleFocusNext());
      });
    });
  });
});
