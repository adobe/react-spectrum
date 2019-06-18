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

import assert from 'assert';
import classNames from 'classnames';
import focusRing from '../../src/utils/focusRing';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

@focusRing
class TestButton extends React.Component {
  static defaultProps = {
    selected: false,
    wrapped: false
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillUpdate(props, state) {
    this._isUpdated = {props, state};
  }

  componentDidUpdate(props, state) {
    this._isUpdated = {props, state};
  }

  getButton() {
    const {
      children,
      className,
      selected
    } = this.props;

    return (
      <button
        className={
          classNames(
            className,
            {
              'is-selected': selected
            }
          )
        }
        ref={b => this.button = b}>
        {children}
      </button>
    );
  }

  render() {
    const {
      wrapped
    } = this.props;

    if (wrapped) {
      return <div>{this.getButton()}</div>;
    } else {
      return this.getButton();
    }
  }
}

describe('focusRing', function () {
  it('Calls super component lifecycle methods', () => {
    const didMountSpy = sinon.spy(TestButton.prototype, 'componentDidMount');
    const willUnmountSpy = sinon.spy(TestButton.prototype, 'componentWillUnmount');
    const willUpdateSpy = sinon.spy(TestButton.prototype, 'componentWillUpdate');
    const didUpdateSpy = sinon.spy(TestButton.prototype, 'componentDidUpdate');

    const tree = shallow(<TestButton className="foo">bar</TestButton>);
    assert(didMountSpy.calledOnce);

    // set prop to force a render
    tree.setProps({selected: true});

    assert(willUpdateSpy.calledOnce);
    assert(didUpdateSpy.calledOnce);

    tree.unmount();

    assert(willUnmountSpy.calledOnce);
  });

  it('Restores focus-ring class to focused element when rendering after a prop or state change', () => {
    let tree = mount(<TestButton className="foo">bar</TestButton>);
    let button = tree.instance().button;

    assert(!button.classList.contains('focus-ring'));

    // make sure node has focus
    button.focus();
    assert.equal(button, document.activeElement);

    // simulate .focus-ring className being added by focus-ring polyfill
    button.classList.add('focus-ring');
    assert(button.classList.contains('focus-ring'));

    // set prop to force a render
    tree.setProps({selected: true});

    // make sure that the focus-ring is still present
    assert(button.classList.contains('focus-ring'));
    assert(button.classList.contains('is-selected'));

    tree.unmount();
  });

  it('Restores focus-ring class to focused descendant element when rendering after a prop or state change', () => {
    let tree = mount(<TestButton className="foo" wrapped>bar</TestButton>);
    let button = tree.instance().button;

    assert(!button.classList.contains('focus-ring'));

    // make sure node has focus
    button.focus();
    assert.equal(button, document.activeElement);

    // simulate .focus-ring className being added by focus-ring polyfill
    button.classList.add('focus-ring');
    assert(button.classList.contains('focus-ring'));

    // set prop to force a render
    tree.setProps({selected: true});

    // make sure that the focus-ring is still present
    assert(button.classList.contains('focus-ring'));
    assert(button.classList.contains('is-selected'));

    tree.unmount();
  });
});
