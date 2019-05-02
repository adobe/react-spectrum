import assert from 'assert';
import LiveRegionAnnouncer, {LiveRegion, LiveRegionMessage, MessageBlock} from '../../src/utils/LiveRegionAnnouncer';
import {mount, shallow} from 'enzyme';
import React from 'react';
import ReactDOM from 'react-dom';
import sinon from 'sinon';

describe('LiveRegionAnnouncer', () => {
  let wrapper;
  let clock;
  before(() => {
    LiveRegionAnnouncer.clearMessage();
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    LiveRegionAnnouncer.destroyInstance();
    wrapper.unmount();
  });

  after(() => {
    clock.restore();
  });

  it('should set polite messages', async () => {
    wrapper = mount(
      <LiveRegionMessage message="Demo message" aria-live="polite" />
    );

    assert.deepEqual(LiveRegionAnnouncer.getInstance().state, {
      assertiveMessage: '',
      politeMessage: 'Demo message'
    });

    wrapper.setProps({message: 'Demo message changed'});

    assert.deepEqual(LiveRegionAnnouncer.getInstance().state, {
      assertiveMessage: '',
      politeMessage: 'Demo message changed'
    });

    // should clear after delay
    clock.tick(1001);
    // don't need to wait for real time, state is updated immediately
    assert.deepEqual(LiveRegionAnnouncer.getInstance().state, {
      assertiveMessage: '',
      politeMessage: ''
    });
  });

  it('should set assertive messages', async () => {
    wrapper = mount(
      <LiveRegionMessage message="Demo message" aria-live="assertive" />
    );

    assert.deepEqual(LiveRegionAnnouncer.getInstance().state, {
      assertiveMessage: 'Demo message',
      politeMessage: ''
    });

    wrapper.setProps({message: 'Demo message changed'});

    assert.deepEqual(LiveRegionAnnouncer.getInstance().state, {
      assertiveMessage: 'Demo message changed',
      politeMessage: ''
    });

    // should clear after delay
    clock.tick(1001);
    assert.deepEqual(LiveRegionAnnouncer.getInstance().state, {
      assertiveMessage: '',
      politeMessage: ''
    });
  });
});

describe('LiveRegionAnnouncer', () => {
  let node;
  let instance;

  describe('static method getInstance', () => {
    it('should create a LiveRegionAnnouncer instance', (done) => {
      LiveRegionAnnouncer.getInstance(() => {
        instance = LiveRegionAnnouncer.getInstance();
        LiveRegionAnnouncer.getInstance(() => {
          node = ReactDOM.findDOMNode(instance).parentNode;
          assert.equal(node.parentNode, document.body);
          assert.equal(instance, LiveRegionAnnouncer.getInstance());
          done();
        });
      });
    });
  });

  describe('static method destroyInstance', () => {
    it('should destroy a LiveRegionAnnouncer instance', (done) => {
      LiveRegionAnnouncer.destroyInstance(() => {
        assert(!node.parentNode);
        assert(!instance.liveRegionAnnouncer);
        done();
      });
    });
  });
});

describe('LiveRegionMessage', () => {
  let wrapper;

  before(() => {
    sinon.stub(LiveRegionAnnouncer, 'announcePolite').callsFake(sinon.spy());
    sinon.stub(LiveRegionAnnouncer, 'announceAssertive').callsFake(sinon.spy());
  });

  afterEach(() => {
    LiveRegionAnnouncer.announcePolite.reset();
    LiveRegionAnnouncer.announceAssertive.reset();
    if (wrapper.exists()) {
      wrapper.unmount();
    }
  });

  after(() => {
    LiveRegionAnnouncer.announcePolite.restore();
    LiveRegionAnnouncer.announceAssertive.restore();
    LiveRegionAnnouncer.destroyInstance();
  });

  it('should announce assertive messages on mount', () => {
    wrapper = mount(<LiveRegionMessage message="Demo message" aria-live="assertive" />);

    assert(!LiveRegionAnnouncer.announcePolite.called);
    assert(LiveRegionAnnouncer.announceAssertive.calledWith('Demo message'));
  });

  it('should announce assertive messages on update', () => {
    wrapper = mount(<LiveRegionMessage message="" aria-live="assertive" />);

    wrapper.setProps({message: 'Demo message changed'});

    wrapper.update();

    assert(!LiveRegionAnnouncer.announcePolite.called);
    assert(LiveRegionAnnouncer.announceAssertive.calledWith('Demo message changed'));
  });

  it('should announce polite messages on mount', () => {
    wrapper = mount(<LiveRegionMessage message="Demo message" aria-live="polite" />);

    assert(!LiveRegionAnnouncer.announceAssertive.called);
    assert(LiveRegionAnnouncer.announcePolite.calledWith('Demo message'));
  });

  it('should announce polite messages on update', () => {
    wrapper = mount(<LiveRegionMessage message="" aria-live="polite" />);

    wrapper.setProps({message: 'Demo message changed'});

    wrapper.update();

    assert(!LiveRegionAnnouncer.announceAssertive.called);
    assert(LiveRegionAnnouncer.announcePolite.calledWith('Demo message changed'));
  });

  it('should broadcast clearall message if clearOnUnmount is set to true', () => {
    wrapper = mount(
      <LiveRegionMessage message="" aria-live="polite" clearOnUnmount />
    );

    wrapper.unmount();

    assert(LiveRegionAnnouncer.announceAssertive.calledWith(''));
    assert(LiveRegionAnnouncer.announcePolite.calledWith(''));
  });

  it('should not broadcast clearall message if clearOnUnmount is set to false', () => {
    wrapper = mount(
      <LiveRegionMessage message="Demo" aria-live="polite" clearOnUnmount={false} />
    );

    wrapper.unmount();

    assert(!LiveRegionAnnouncer.announceAssertive.calledWith(''));
    assert(!LiveRegionAnnouncer.announcePolite.calledWith(''));
  });

  it('should not broadcast clearall message if clearOnUnmount is omitted', () => {
    wrapper = mount(<LiveRegionMessage message="Demo" aria-live="polite" />);

    wrapper.unmount();

    assert(!LiveRegionAnnouncer.announceAssertive.calledWith(''));
    assert(!LiveRegionAnnouncer.announcePolite.calledWith(''));
  });
});

describe('LiveRegion', () => {
  it('should render LiveRegion containing 4 MessageBlocks', () => {
    const wrapper = shallow(<LiveRegion />);
    assert(wrapper.hasClass('u-react-spectrum-screenReaderOnly'));
    assert.equal(findMessageBlock(wrapper).length, 4);
  });

  it('should alternate assertive messages', () => {
    const wrapper = shallow(<LiveRegion />);

    wrapper.setProps({assertiveMessage: 'I am a message'});
    assert.deepEqual(wrapper.state(), {
      assertiveMessage1: 'I am a message',
      assertiveMessage2: '',
      politeMessage1: '',
      politeMessage2: ''
    });
    assert.equal(findMessageBlock(wrapper).get(0).props.message, 'I am a message');
    assert.equal(findMessageBlock(wrapper).get(1).props.message, '');

    wrapper.setProps({assertiveMessage: 'I am a changed message'});
    assert.deepEqual(wrapper.state(), {
      assertiveMessage1: '',
      assertiveMessage2: 'I am a changed message',
      politeMessage1: '',
      politeMessage2: ''
    });
    assert.equal(findMessageBlock(wrapper).get(0).props.message, '');
    assert.equal(findMessageBlock(wrapper).get(1).props.message, 'I am a changed message');
  });

  it('should alternate polite messages', () => {
    const wrapper = shallow(<LiveRegion />);

    wrapper.setProps({politeMessage: 'I am a message'});
    assert.deepEqual(wrapper.state(), {
      assertiveMessage1: '',
      assertiveMessage2: '',
      politeMessage1: 'I am a message',
      politeMessage2: ''
    });
    assert.equal(findMessageBlock(wrapper).get(2).props.message, 'I am a message');
    assert.equal(findMessageBlock(wrapper).get(3).props.message, '');

    wrapper.setProps({politeMessage: 'I am a changed message'});
    assert.deepEqual(wrapper.state(), {
      assertiveMessage1: '',
      assertiveMessage2: '',
      politeMessage1: '',
      politeMessage2: 'I am a changed message'
    });
    assert.equal(findMessageBlock(wrapper).get(2).props.message, '');
    assert.equal(findMessageBlock(wrapper).get(3).props.message, 'I am a changed message');
  });
});

const findMessageBlock = tree => tree.find(MessageBlock);
