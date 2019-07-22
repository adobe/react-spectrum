import assert from 'assert';
import {Rect, Size} from '../';
import View from '../src/View';

class TestView {
  constructor() {
    this.calls = [];
  }

  getRenderContext() {
    return 'ctx';
  }

  render(backend) {
    return 'test render result';
  }

  flushUpdates(fn) {
    if (fn) {
      fn('flushed');
    }
  }

  forceStyleUpdate() {
  }

  getRect() {
    return new Rect(0, 0, 100, 100);
  }

  getSize() {
    return new Size(100, 100);
  }

  getDOMNode() {
    return 'dom node';
  }
}

class TestBackend {
  createView() {
    return new TestView;
  }
}

describe('View', function () {
  describe('onEvent', function () {
    it('should register an event', function () {
      var view = new View;
      var fn = function () {};
      view.onEvent('click', fn);

      assert.deepEqual(Array.from(view.events.keys()), ['click']);
      assert.deepEqual(Array.from(view.events.get('click')), [fn]);
    });

    it('should not register the same function twice', function () {
      var view = new View;
      var fn = function () {};
      view.onEvent('click', fn);
      view.onEvent('click', fn);

      assert.deepEqual(Array.from(view.events.keys()), ['click']);
      assert.deepEqual(Array.from(view.events.get('click')), [fn]);
    });
  });

  describe('offEvent', function () {
    it('should unregister an event', function () {
      var view = new View;
      var fn = function () {};
      view.onEvent('click', fn);
      view.offEvent('click', fn);

      assert.deepEqual(Array.from(view.events.keys()), []);
    });

    it('should ignore events that are not registered', function () {
      var view = new View;
      var fn = function () {};
      view.offEvent('click', fn);

      assert.deepEqual(Array.from(view.events.keys()), []);
    });
  });

  describe('setAttribute', function () {
    it('should set an attribute', function () {
      var view = new View;
      assert.deepEqual(view.attrs, {});

      view.setAttribute('test', '123');
      assert.deepEqual(view.attrs, {test: '123'});
    });
  });

  describe('css', function () {
    it('should merge the style objects', function () {
      var view = new View;
      view.css({position: 'absolute', top: 0, left: 0});
      view.css({top: '100px', width: '100px', height: '100px'});

      assert.deepEqual(view.style, {
        position: 'absolute',
        top: '100px',
        left: 0,
        width: '100px',
        height: '100px'
      });
    });
  });

  describe('addChild', function () {
    it('should add a child', function () {
      var view = new View;
      var child = new View;

      assert.deepEqual(Array.from(view.children), []);
      view.addChild(child);
      assert.deepEqual(Array.from(view.children), [child]);
    });

    it('should not add the same child twice', function () {
      var view = new View;
      var child = new View;

      view.addChild(child);
      view.addChild(child);

      assert.deepEqual(Array.from(view.children), [child]);
    });
  });

  describe('removeChild', function () {
    it('should remove a child', function () {
      var view = new View;
      var child = new View;

      view.addChild(child);
      view.removeChild(child);

      assert.deepEqual(Array.from(view.children), []);
    });

    it('should ignore views that are not children', function () {
      var view = new View;
      var child = new View;

      view.removeChild(child);
      assert.deepEqual(Array.from(view.children), []);
    });
  });

  describe('replaceChildren', function () {
    it('should remove all children and replace with the given ones', function () {
      var view = new View;

      view.addChild(new View);
      view.addChild(new View);

      var replacement = new View;
      view.replaceChildren(replacement);

      assert.deepEqual(Array.from(view.children), [replacement]);
    });
  });

  describe('addClass', function () {
    it('should add class names', function () {
      var view = new View;
      view.addClass('test');
      view.addClass('foo');

      assert.deepEqual(Array.from(view.classes), ['test', 'foo']);
    });

    it('should add multiple class names at once', function () {
      var view = new View;
      view.addClass('test foo');

      assert.deepEqual(Array.from(view.classes), ['test', 'foo']);
    });
  });

  describe('removeClass', function () {
    it('should remove class names', function () {
      var view = new View;
      view.addClass('test');
      view.addClass('foo');
      view.removeClass('test');

      assert.deepEqual(Array.from(view.classes), ['foo']);
    });

    it('should remove multiple class names at once', function () {
      var view = new View;
      view.addClass('test foo bar baz');
      view.removeClass('foo bar');

      assert.deepEqual(Array.from(view.classes), ['test', 'baz']);
    });
  });

  describe('getClassName', function () {
    it('should get the class name', function () {
      var view = new View;
      view.addClass('test foo bar baz');
      view.removeClass('foo bar');

      assert.equal(view.getClassName(), 'test baz');
    });
  });

  describe('renderBackendView', function () {
    it('should create a backend view and call render', function () {
      var view = new View;
      var result = view.renderBackendView(new TestBackend);

      assert.equal(result, 'test render result');
    });
  });

  describe('flushUpdates', function () {
    it('should call flushUpdates on the backend view', function (done) {
      var view = new View;
      view.renderBackendView(new TestBackend);
      view.addChild(new View);
      view.flushUpdates(function (res) {
        assert.equal(res, 'flushed');
        done();
      });
    });
  });

  describe('getRect', function () {
    it('should return the result from the backend view', function () {
      var view = new View;
      view.renderBackendView(new TestBackend);
      assert.deepEqual(view.getRect(), new Rect(0, 0, 100, 100));
    });
  });

  describe('getSize', function () {
    it('should return the result from the backend view', function () {
      var view = new View;
      view.renderBackendView(new TestBackend);
      assert.deepEqual(view.getSize(), new Size(100, 100));
    });
  });

  describe('getDOMNode', function () {
    it('should return the result from the backend view', function () {
      var view = new View;
      view.renderBackendView(new TestBackend);
      assert.deepEqual(view.getDOMNode(), 'dom node');
    });
  });
});
