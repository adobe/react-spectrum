import assert from 'assert';
import Link from '../../src/Link';
import {ListItem} from '../../src/List';
import React from 'react';
import {shallow} from 'enzyme';
import {ShellHelp} from '../../src/Shell';
import sinon from 'sinon';

const defaultResults = [
  {href: 'http://foo.com', label: 'Foo'},
  {href: 'http://bar.com', label: 'Bar'},
  {href: 'http://baz.com', label: 'Baz'},
];

const render = (props = {}) => {
  const defaultProps = {
    defaultResults,
    moreSearchResultsUrl: '#'
  };

  return <ShellHelp {...defaultProps} {...props} />;
};

const findResultListItem = (tree) => tree.find(ListItem).first();
const findResultLink = (tree) => tree.find(Link).first();

describe('ShellHelp', () => {
  let spy;
  let tree;

  describe('Displays search results', () => {

    beforeEach(() => {
      spy = sinon.spy();
      tree = shallow(render({onResultClick: spy}));
    });

    it('displays a link to click', () => {
      tree.update();
      assert.equal(findResultLink(tree).exists(), true);
    });

    it('supports onResultClick', () => {
      tree.update();
      let listItem = findResultListItem(tree);
      listItem.simulate('click');
      assert(spy.calledWith(defaultResults[0]));
    });

  });
});
