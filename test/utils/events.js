import assert from 'assert';
import {interpretKeyboardEvent} from '../../src/utils/events';
import sinon from 'sinon';

describe('interpretKeyboardEvent', () => {
  const obj = {
    onSelectFocused: sinon.spy(),
    onTab: sinon.spy(),
    onPageUp: sinon.spy(),
    onPageDown: sinon.spy(),
    onFocusFirst: sinon.spy(),
    onFocusLast: sinon.spy(),
    onFocusNext: sinon.spy(),
    onFocusPrevious: sinon.spy(),
    onAltArrowUp: sinon.spy(),
    onAltArrowDown: sinon.spy(),
    onEscape: sinon.spy()
  };

  const event = {
    type: 'keydown',
    altKey: false
  };

  afterEach(() => {
    event.key = undefined;
    event.altKey = false;

    for (let func in obj) {
      if (obj.hasOwnProperty(func)) {
        obj[func].resetHistory();
      }
    }
  });

  describe('keydown', () => {
    describe('Enter', () => {
      it('should call onSelectFocused', () => {
        event.key = 'Enter';
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onSelectFocused.calledOnce);
        assert(obj.onSelectFocused.calledWith(event));
      });
    });

    describe('Space', () => {
      it('should call onSelectFocused', () => {
        event.key = ' ';
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onSelectFocused.calledOnce);
        assert(obj.onSelectFocused.calledWith(event));
      });
    });

    describe('Tab', () => {
      it('should call onTab', () => {
        event.key = 'Tab';
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onTab.calledOnce);
        assert(obj.onTab.calledWith(event));
      });
    });

    describe('PageUp', () => {
      it('should call onPageUp', () => {
        event.key = 'PageUp';
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onPageUp.calledOnce);
        assert(obj.onPageUp.calledWith(event));
      });

      it('or should call onFocusFirst when onPageUp is undefined', () => {
        event.key = 'PageUp';
        obj.onPageUp = undefined;
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onFocusFirst.calledOnce);
        assert(obj.onFocusFirst.calledWith(event));
        obj.onPageUp = sinon.spy();
      });
    });

    describe('PageDown', () => {
      it('should call onPageDown', () => {
        event.key = 'PageDown';
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onPageDown.calledOnce);
        assert(obj.onPageDown.calledWith(event));
      });

      it('or should call onFocusLast when onPageDown is undefined', () => {
        event.key = 'PageDown';
        obj.onPageDown = undefined;
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onFocusLast.calledOnce);
        assert(obj.onFocusLast.calledWith(event));
        obj.onPageDown = sinon.spy();
      });
    });

    describe('Home', () => {
      it('should call onFocusFirst', () => {
        event.key = 'Home';
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onFocusFirst.calledOnce);
        assert(obj.onFocusFirst.calledWith(event));
      });
    });

    describe('End', () => {
      it('should call onFocusLast', () => {
        event.key = 'End';
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onFocusLast.calledOnce);
        assert(obj.onFocusLast.calledWith(event));
      });
    });

    describe('ArrowUp', () => {
      it('should call onFocusPrevious', () => {
        event.key = 'ArrowUp';
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onFocusPrevious.calledOnce);
        assert(obj.onFocusPrevious.calledWith(event));
      });

      describe('with orientation === "both"', () => {
        it('should call onFocusPrevious', () => {
          event.key = 'ArrowUp';
          interpretKeyboardEvent.call(obj, event, 'both');
          assert(obj.onFocusPrevious.calledOnce);
          assert(obj.onFocusPrevious.calledWith(event));
        });
      });

      describe('with orientation === "horizontal"', () => {
        it('should not call onFocusPrevious', () => {
          event.key = 'ArrowUp';
          interpretKeyboardEvent.call(obj, event, 'horizontal');
          assert(!obj.onFocusPrevious.called);
        });
      });

      describe('with altKey', () => {
        it('should call onAltArrowUp', () => {
          event.key = 'ArrowUp';

          event.altKey = true;
          interpretKeyboardEvent.call(obj, event);
          assert(obj.onAltArrowUp.calledOnce);
          assert(obj.onAltArrowUp.calledWith(event));
        });
      });
    });

    describe('Up', () => {
      it('should call onFocusPrevious', () => {
        event.key = 'Up';
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onFocusPrevious.calledOnce);
        assert(obj.onFocusPrevious.calledWith(event));
      });

      describe('with orientation === "both"', () => {
        it('should call onFocusPrevious', () => {
          event.key = 'Up';
          interpretKeyboardEvent.call(obj, event, 'both');
          assert(obj.onFocusPrevious.calledOnce);
          assert(obj.onFocusPrevious.calledWith(event));
        });
      });

      describe('with orientation === "horizontal"', () => {
        it('should not call onFocusPrevious', () => {
          event.key = 'Up';
          interpretKeyboardEvent.call(obj, event, 'horizontal');
          assert(!obj.onFocusPrevious.called);
        });
      });

      describe('with altKey', () => {
        it('should call onAltArrowUp', () => {
          event.key = 'Up';

          event.altKey = true;
          interpretKeyboardEvent.call(obj, event);
          assert(obj.onAltArrowUp.calledOnce);
          assert(obj.onAltArrowUp.calledWith(event));
        });
      });
    });

    describe('ArrowDown', () => {
      it('should call onFocusNext', () => {
        event.key = 'ArrowDown';
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onFocusNext.calledOnce);
        assert(obj.onFocusNext.calledWith(event));
      });

      describe('with orientation === "both"', () => {
        it('should call onFocusNext', () => {
          event.key = 'ArrowDown';
          interpretKeyboardEvent.call(obj, event, 'both');
          assert(obj.onFocusNext.calledOnce);
          assert(obj.onFocusNext.calledWith(event));
        });
      });

      describe('with orientation === "horizontal"', () => {
        it('should not call onFocusNext', () => {
          event.key = 'ArrowDown';
          interpretKeyboardEvent.call(obj, event, 'horizontal');
          assert(!obj.onFocusNext.called);
        });
      });

      describe('with altKey', () => {
        it('should call onAltArrowDown', () => {
          event.key = 'ArrowDown';

          event.altKey = true;
          interpretKeyboardEvent.call(obj, event);
          assert(obj.onAltArrowDown.calledOnce);
          assert(obj.onAltArrowDown.calledWith(event));
        });
      });
    });

    describe('Down', () => {
      it('should call onFocusNext', () => {
        event.key = 'Down';
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onFocusNext.calledOnce);
        assert(obj.onFocusNext.calledWith(event));
      });

      describe('with orientation === "both"', () => {
        it('should call onFocusNext', () => {
          event.key = 'Down';
          interpretKeyboardEvent.call(obj, event, 'both');
          assert(obj.onFocusNext.calledOnce);
          assert(obj.onFocusNext.calledWith(event));
        });
      });

      describe('with orientation === "horizontal"', () => {
        it('should not call onFocusNext', () => {
          event.key = 'Down';
          interpretKeyboardEvent.call(obj, event, 'horizontal');
          assert(!obj.onFocusNext.called);
        });
      });

      describe('with altKey', () => {
        it('should call onAltArrowDown', () => {
          event.key = 'Down';

          event.altKey = true;
          interpretKeyboardEvent.call(obj, event);
          assert(obj.onAltArrowDown.calledOnce);
          assert(obj.onAltArrowDown.calledWith(event));
        });
      });
    });

    describe('ArrowLeft', () => {
      describe('with orientation === "vertical"', () => {
        it('should not call onFocusPrevious', () => {
          event.key = 'ArrowLeft';
          interpretKeyboardEvent.call(obj, event);
          assert(!obj.onFocusPrevious.called);
        });
      });

      describe('with orientation === "both"', () => {
        it('should call onFocusPrevious', () => {
          event.key = 'ArrowLeft';
          interpretKeyboardEvent.call(obj, event, 'both');
          assert(obj.onFocusPrevious.calledOnce);
          assert(obj.onFocusPrevious.calledWith(event));
        });
      });

      describe('with orientation === "horizontal"', () => {
        it('should call onFocusPrevious', () => {
          event.key = 'ArrowLeft';
          interpretKeyboardEvent.call(obj, event, 'horizontal');
          assert(obj.onFocusPrevious.calledOnce);
          assert(obj.onFocusPrevious.calledWith(event));
        });
      });
    });

    describe('Left', () => {
      describe('with orientation === "vertical"', () => {
        it('should not call onFocusPrevious', () => {
          event.key = 'Left';
          interpretKeyboardEvent.call(obj, event);
          assert(!obj.onFocusPrevious.called);
        });
      });

      describe('with orientation === "both"', () => {
        it('should call onFocusPrevious', () => {
          event.key = 'Left';
          interpretKeyboardEvent.call(obj, event, 'both');
          assert(obj.onFocusPrevious.calledOnce);
          assert(obj.onFocusPrevious.calledWith(event));
        });
      });

      describe('with orientation === "horizontal"', () => {
        it('should call onFocusPrevious', () => {
          event.key = 'Left';
          interpretKeyboardEvent.call(obj, event, 'horizontal');
          assert(obj.onFocusPrevious.calledOnce);
          assert(obj.onFocusPrevious.calledWith(event));
        });
      });
    });

    describe('ArrowRight', () => {
      describe('with orientation === "vertical"', () => {
        it('should not call onFocusNext', () => {
          event.key = 'ArrowRight';
          interpretKeyboardEvent.call(obj, event);
          assert(!obj.onFocusNext.called);
        });
      });

      describe('with orientation === "both"', () => {
        it('should call onFocusNext', () => {
          event.key = 'ArrowRight';
          interpretKeyboardEvent.call(obj, event, 'both');
          assert(obj.onFocusNext.calledOnce);
          assert(obj.onFocusNext.calledWith(event));
        });
      });

      describe('with orientation === "horizontal"', () => {
        it('should call onFocusNext', () => {
          event.key = 'ArrowRight';
          interpretKeyboardEvent.call(obj, event, 'horizontal');
          assert(obj.onFocusNext.calledOnce);
          assert(obj.onFocusNext.calledWith(event));
        });
      });
    });

    describe('Right', () => {
      describe('with orientation === "vertical"', () => {
        it('should not call onFocusNext', () => {
          event.key = 'Right';
          interpretKeyboardEvent.call(obj, event);
          assert(!obj.onFocusNext.called);
        });
      });

      describe('with orientation === "both"', () => {
        it('should call onFocusNext', () => {
          event.key = 'Right';
          interpretKeyboardEvent.call(obj, event, 'both');
          assert(obj.onFocusNext.calledOnce);
          assert(obj.onFocusNext.calledWith(event));
        });
      });

      describe('with orientation === "horizontal"', () => {
        it('should call onFocusNext', () => {
          event.key = 'Right';
          interpretKeyboardEvent.call(obj, event, 'horizontal');
          assert(obj.onFocusNext.calledOnce);
          assert(obj.onFocusNext.calledWith(event));
        });
      });
    });

    describe('Escape', () => {
      it('should call onEscape', () => {
        event.key = 'Escape';
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onEscape.calledOnce);
        assert(obj.onEscape.calledWith(event));
      });
    });

    describe('Esc', () => {
      it('should call onEscape', () => {
        event.key = 'Esc';
        interpretKeyboardEvent.call(obj, event);
        assert(obj.onEscape.calledOnce);
        assert(obj.onEscape.calledWith(event));
      });
    });
  });
});
