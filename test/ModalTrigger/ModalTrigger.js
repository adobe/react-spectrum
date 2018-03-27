import assert from 'assert';
import ModalTrigger from '../../src/ModalTrigger';
import {mount} from 'enzyme';
import PropTypes from 'prop-types';
import React from 'react';

describe('ModalTrigger', () => {
  it('can pass advanced context to the child of mounted component', () => {
    const RootComponent = () => <ChildComponent />;

    RootComponent.contextTypes = {
      name: PropTypes.string,
      country: PropTypes.string,
      color: PropTypes.string,
    };

    const DivComponent = (props, context) => (
      <div>{context.name} is from {context.country}</div>
    );

    DivComponent.contextTypes = {
      name: PropTypes.string,
      country: PropTypes.string,
    };

    const ChildComponent = () => <ModalTrigger><DivComponent /></ModalTrigger>;


    const context = {name: 'Julia', country: 'Mexico'};
    const wrapper = mount(<RootComponent />, {context});

    assert.equal(wrapper.text(), 'Julia is from Mexico');
  });

  it('should pass context', () => {
    function SimpleComponent(props, context) {
      return <div id="modal-test">{context.name}</div>;
    }
    SimpleComponent.contextTypes = {
      name: PropTypes.string,
    };

    const context = {
      name: 'a context has no name'
    };

    ModalTrigger.contextTypes = {
      name: PropTypes.string,
    };
    const modalTrigger = mount(
      <ModalTrigger>
        <SimpleComponent />
      </ModalTrigger>,
      {context});

    assert.equal(modalTrigger.text(), 'a context has no name');
  });
});
