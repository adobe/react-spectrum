import assert from 'assert';
import ModalTrigger from '../../src/ModalTrigger';
import {mount} from 'enzyme';
import PropTypes from 'prop-types';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';


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

    wrapper.unmount();
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

    modalTrigger.unmount();
  });

  it('adds a wrapping div only when necessary', () => {
    let wrapper = mount(<ModalTrigger><button /><div modalContent>text</div></ModalTrigger>);
    assert.equal(wrapper.find('button').length, 1);
    let hasContainer = !!(wrapper.find('Fragment').length || wrapper.find('div').length);
    assert.equal(hasContainer, false);

    wrapper.unmount();

    wrapper = shallow(<ModalTrigger><button /><button /><div modalContent>text</div></ModalTrigger>);

    assert.equal(wrapper.find('button').length, 2);
    hasContainer = !!(wrapper.find('Fragment').length || wrapper.find('div').length);
    assert.equal(hasContainer, true);
  });

  it('calls chained onClick methods for ModalTrigger and trigger child', () => {
    let onClickSpy = sinon.spy();
    let onButtonClickSpy = sinon.spy();
    let wrapper = shallow(<ModalTrigger onClick={onClickSpy}><button onClick={onButtonClickSpy} /><div modalContent>text</div></ModalTrigger>);

    let component = wrapper.instance();
    sinon.stub(component, 'show').callsFake(sinon.spy());
    component.forceUpdate();

    wrapper.find('button').at(0).simulate('click');
    assert(onClickSpy.called);
    assert(onButtonClickSpy.called);
    assert(component.show.calledOnce);
  });
});
