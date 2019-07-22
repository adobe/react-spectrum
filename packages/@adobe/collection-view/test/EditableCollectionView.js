import {ArrayDataSource, EditableCollectionView, GridLayout, IndexPath, ListLayout, Rect, ReusableView, Size} from '../src';
import assert from 'assert';
import {compareView} from '../src/utils';

class ItemView extends ReusableView {
  render(dom) {
    dom.innerHTML = this.content;
  }
}

let data, dataSource, layout;
let size = new Size(450, 450);
let delegate = {
  createView: function () {
    return new ItemView;
  }
};

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
    return new Rect(0, 0, 450, 450);
  }

  getSize() {
    return new Size(450, 450);
  }

  getDOMNode() {
    return 'dom node';
  }
}

class TestBackend {
  createView() {
    return new TestView;
  }

  registerDragEvents() {}
}

let backend = new TestBackend;

describe('EditableCollectionView', function () {
  beforeEach(function () {
    data = [];
    for (var i = 0; i < 10; i++) {
      data[i] = [];
      for (var j = 0; j < 50; j++) {
        data[i][j] = `Item ${i},${j}`;
      }
    }

    dataSource = new ArrayDataSource(data);
    layout = new ListLayout({
      rowHeight: 100
    });
  });

  describe('Accessibility attributes', function () {
    it('should have role=presentation by default', function () {
      var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
      collection.relayoutNow();
      assert.equal(collection.attrs.role, 'presentation');
      assert.equal(collection.inner.attrs.role, 'presentation');
    });

    it('should add appropriate accessibility attributes', function () {
      var collection = new EditableCollectionView({
        delegate,
        layout,
        dataSource,
        size,
        backend,
        id: 'collectionview-id',
        role: 'grid',
        'aria-label': 'CollectionView Table',
        'aria-labelledby': 'foo-id collectionview-id',
        'aria-colcount': 1,
        'aria-rowcount': 510,
        'aria-multiselectable': true
      });
      collection.relayoutNow();
      assert.equal(collection.attrs.tabIndex, -1);
      assert.equal(collection.attrs.role, 'grid');
      assert.equal(collection.attrs.id, 'collectionview-id');
      assert.equal(collection.attrs['aria-label'], 'CollectionView Table');
      assert.equal(collection.attrs['aria-labelledby'], 'foo-id collectionview-id');
      assert.equal(collection.attrs['aria-colcount'], 1);
      assert.equal(collection.attrs['aria-rowcount'], 510);
      assert.equal(collection.attrs['aria-multiselectable'], true);
      assert.equal(collection.inner.attrs.role, 'rowgroup');
    });
  });

  describe('selection', function () {
    describe('API', function () {
      describe('selectItem', function () {
        it('should select an individual item', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});

          collection.selectItem(new IndexPath(0, 1));
          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1)]);
        });

        it('should replace the selection', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});

          collection.selectItem(new IndexPath(0, 1));
          collection.selectItem(new IndexPath(0, 3));

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 3)]);
        });

        it('should toggle an item', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});

          collection.selectItem(new IndexPath(0, 1));
          collection.selectItem(new IndexPath(0, 3), true);

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1), new IndexPath(0, 3)]);

          collection.selectItem(new IndexPath(0, 3), true);
          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1)]);
        });

        it('should extend the selection', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});

          collection.selectItem(new IndexPath(0, 1));
          collection.selectItem(new IndexPath(0, 3), false, true);

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1), new IndexPath(0, 2), new IndexPath(0, 3)]);
        });
      });

      describe('clearSelection', function () {
        it('should remove all items from the selection', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});

          collection.selectItem(new IndexPath(0, 1));
          collection.selectItem(new IndexPath(0, 3), false, true);
          collection.clearSelection();

          assert.deepEqual(Array.from(collection.selectedIndexPaths), []);
        });
      });

      describe('selectAll', function () {
        it('should select all items', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.selectAll();
          assert.deepEqual(Array.from(collection.selectedIndexPaths).length, 500);
        });
      });
    });

    describe('rendering', function () {
      it('should set state when rendering selected items', function () {
        var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
        collection.selectItem(new IndexPath(0, 1));
        collection.relayoutNow();

        let views = collection.visibleViews.sort(compareView);
        assert.deepEqual(views.map(v => v.getClassName()), ['', 'selected', '', '', '']);
      });

      it('should update selection state', function () {
        var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
        collection.relayoutNow();

        collection.selectItem(new IndexPath(0, 1));
        collection.selectItem(new IndexPath(0, 3));

        let views = collection.visibleViews.sort(compareView);
        assert.deepEqual(views.map(v => v.getClassName()), ['', '', '', 'selected', '']);
      });

      it('should set state when rendering focused items', function (done) {
        var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
        collection.focusItem(new IndexPath(0, 1));
        collection.relayoutNow();

        setTimeout(() => {
          let views = collection.visibleViews;
          assert.deepEqual(views.map(v => v.getClassName()), ['', 'focused', '', '', '']);
          done();
        }, 20);
      });

      it('should update focused state', function (done) {
        var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
        collection.relayoutNow();

        collection.focusItem(new IndexPath(0, 1));
        collection.focusItem(new IndexPath(0, 3));

        setTimeout(() => {
          let views = collection.visibleViews;
          assert.deepEqual(views.map(v => v.getClassName()), ['', '', '', 'focused', '']);
          done();
        }, 20);
      });
    });

    describe('mouse events', function () {
      it('should select an item on mousedown', function () {
        var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
        collection.render();
        collection.relayoutNow();

        collection.mouseDown({clientX: 20, clientY: 325});
        assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 3)]);
      });

      it('should toggle a selected item if the command key is pressed', function () {
        var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
        collection.render();
        collection.relayoutNow();

        collection.mouseDown({clientX: 20, clientY: 325});
        collection.mouseDown({clientX: 20, clientY: 125, metaKey: true});

        assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1), new IndexPath(0, 3)]);

        collection.mouseDown({clientX: 20, clientY: 125, metaKey: true});
        assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 3)]);
      });

      it('should extend the selection if the shift key is pressed', function () {
        var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
        collection.render();
        collection.relayoutNow();

        collection.mouseDown({clientX: 20, clientY: 325});
        collection.mouseDown({clientX: 20, clientY: 125, shiftKey: true});

        assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1), new IndexPath(0, 2), new IndexPath(0, 3)]);
      });

      it('should select on mouse up if clicking on an already selected item', function () {
        var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
        collection.render();
        collection.relayoutNow();

        collection.mouseDown({clientX: 20, clientY: 325});
        collection.mouseDown({clientX: 20, clientY: 125, shiftKey: true});
        collection.mouseDown({clientX: 20, clientY: 325});

        assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1), new IndexPath(0, 2), new IndexPath(0, 3)]);

        collection.mouseUp();
        assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 3)]);
      });

      it('should emit events on selection change', function () {
        var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
        collection.render();
        collection.relayoutNow();

        var emitted = false;
        collection.on('selectionChanged', () => emitted = true);

        collection.mouseDown({clientX: 20, clientY: 325});
        assert.ok(emitted);
      });

      it('should emit on mouse up if selectOnMouseUp option is true', function () {
        var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend, selectOnMouseUp: true});
        collection.render();
        collection.relayoutNow();

        var emitted = false;
        collection.on('selectionChanged', () => emitted = true);

        collection.mouseDown({clientX: 20, clientY: 325});
        assert.ok(!emitted);

        collection.mouseUp();
        assert.ok(emitted);
      });

      it('should clear the selection if clicking outside', function () {
        var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
        collection.render();
        collection.relayoutNow();

        collection.mouseDown({clientX: 20, clientY: 325});

        assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 3)]);

        collection.mouseDown({clientX: 500, clientY: 325});
        assert.deepEqual(Array.from(collection.selectedIndexPaths), []);
      });

      it('should toggle the selection when selectionMode = "toggle"', function () {
        var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend, selectionMode: 'toggle'});
        collection.render();
        collection.relayoutNow();

        collection.mouseDown({clientX: 20, clientY: 325});

        assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 3)]);

        collection.mouseDown({clientX: 20, clientY: 325});
        collection.mouseUp();
        assert.deepEqual(Array.from(collection.selectedIndexPaths), []);
      });

      it('should add to the selection by default when selectionMode = "toggle"', function () {
        var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend, selectionMode: 'toggle'});
        collection.render();
        collection.relayoutNow();

        collection.mouseDown({clientX: 20, clientY: 325});
        collection.mouseDown({clientX: 20, clientY: 125});

        assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1), new IndexPath(0, 3)]);
      });
    });

    describe('keyboard events', function () {
      describe('down arrow', function () {
        it('should move down', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 40, preventDefault() {}});

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 2)]);
          assert.deepEqual(collection.focusedIndexPath, new IndexPath(0, 2));
        });

        it('should extend down', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 40, shiftKey: true, preventDefault() {}});

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1), new IndexPath(0, 2)]);
          assert.deepEqual(collection.focusedIndexPath, new IndexPath(0, 2));
        });

        describe('focus management', function () {
          it('should move focus down', function () {
            var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend, keyboardMode: 'focus'});
            collection.relayoutNow();

            collection.focusItem(new IndexPath(0, 1));
            collection.keyDown({keyCode: 40, preventDefault() {}});

            assert.deepEqual(collection.focusedIndexPath, new IndexPath(0, 2));
          });
        });
      });

      describe('up arrow', function () {
        it('should move up', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 38, preventDefault() {}});

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 0)]);
          assert.deepEqual(collection.focusedIndexPath, new IndexPath(0, 0));
        });

        it('should extend up', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 38, shiftKey: true, preventDefault() {}});

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 0), new IndexPath(0, 1)]);
          assert.deepEqual(collection.focusedIndexPath, new IndexPath(0, 0));
        });

        describe('focus management', function () {
          it('should move focus up', function () {
            var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend, keyboardMode: 'focus'});
            collection.relayoutNow();

            collection.focusItem(new IndexPath(0, 1));
            collection.keyDown({keyCode: 38, preventDefault() {}});

            assert.deepEqual(collection.focusedIndexPath, new IndexPath(0, 0));
          });
        });
      });

      describe('left arrow', function () {
        it('should move left', function () {
          layout = new GridLayout;
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 37, preventDefault() {}});

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 0)]);
          assert.deepEqual(collection.focusedIndexPath, new IndexPath(0, 0));
        });

        it('should extend left', function () {
          layout = new GridLayout;
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 37, shiftKey: true, preventDefault() {}});

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 0), new IndexPath(0, 1)]);
          assert.deepEqual(collection.focusedIndexPath, new IndexPath(0, 0));
        });

        describe('focus management', function () {
          it('should move focus left', function () {
            layout = new GridLayout;
            var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend, keyboardMode: 'focus'});
            collection.relayoutNow();

            collection.focusItem(new IndexPath(0, 1));
            collection.keyDown({keyCode: 37, preventDefault() {}});

            assert.deepEqual(collection.focusedIndexPath, new IndexPath(0, 0));
          });
        });
      });

      describe('right arrow', function () {
        it('should move right', function () {
          layout = new GridLayout;
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 39, preventDefault() {}});

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 2)]);
          assert.deepEqual(collection.focusedIndexPath, new IndexPath(0, 2));
        });

        it('should extend right', function () {
          layout = new GridLayout;
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 39, shiftKey: true, preventDefault() {}});

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1), new IndexPath(0, 2)]);
          assert.deepEqual(collection.focusedIndexPath, new IndexPath(0, 2));
        });

        describe('focus management', function () {
          it('should move focus right', function () {
            layout = new GridLayout;
            var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend, keyboardMode: 'focus'});
            collection.relayoutNow();

            collection.focusItem(new IndexPath(0, 1));
            collection.keyDown({keyCode: 39, preventDefault() {}});

            assert.deepEqual(collection.focusedIndexPath, new IndexPath(0, 2));
          });
        });
      });

      describe('escape', function () {
        it('should clear the selection', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 27, preventDefault() {}});

          assert.deepEqual(Array.from(collection.selectedIndexPaths), []);
        });
      });

      describe('command + A', function () {
        it('should select all', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 65, metaKey: true, preventDefault() {}});

          assert.deepEqual(Array.from(collection.selectedIndexPaths).length, 500);
        });
      });

      describe('delete', function () {
        it('should do nothing if canDeleteItems is false', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 46, preventDefault() {}});

          assert.deepEqual(data[0].length, 50);
          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1)]);
        });

        it('should do nothing if delegate.shouldDeleteItems returns false', function () {
          var d = Object.assign({}, delegate, {shouldDeleteItems() { return false; }});
          var collection = new EditableCollectionView({delegate: d, layout, dataSource, size, backend, canDeleteItems: true});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 46, preventDefault() {}});

          assert.deepEqual(data[0].length, 50);
          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1)]);
        });

        it('should delete an item with the delete key', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend, canDeleteItems: true});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 46, preventDefault() {}});

          assert.deepEqual(data[0].length, 49);
          assert.deepEqual(Array.from(collection.selectedIndexPaths), []);
        });

        it('should delete an item with the backspace key', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend, canDeleteItems: true});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 1));
          collection.keyDown({keyCode: 8, preventDefault() {}});

          assert.deepEqual(data[0].length, 49);
          assert.deepEqual(Array.from(collection.selectedIndexPaths), []);
        });
      });
    });

    describe('transactions', function () {
      describe('insert item', function () {
        it('should adjust the selection', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 2));
          dataSource.insertItem(new IndexPath(0, 1), 'Inserted', false);

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 3)]);
        });
      });

      describe('remove item', function () {
        it('should adjust the selection', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 2));
          dataSource.removeItem(new IndexPath(0, 1), false);

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1)]);
        });
      });

      describe('move item', function () {
        it('should adjust the selection', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 2));
          dataSource.moveItem(new IndexPath(0, 1), new IndexPath(0, 3), false);

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 1)]);
        });
      });

      describe('insert section', function () {
        it('should adjust the selection', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 2));
          dataSource.insertSection(0, ['Inserted'], false);

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(1, 2)]);
        });
      });

      describe('remove section', function () {
        it('should adjust the selection', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(1, 2));
          dataSource.removeSection(0, false);

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(0, 2)]);
        });
      });

      describe('move section', function () {
        it('should adjust the selection', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 2));
          dataSource.moveSection(0, 1, false);

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(1, 2)]);
        });
      });

      describe('reload section', function () {
        it('should adjust the selection', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 2));
          dataSource.replaceSection(0, [], false);

          assert.deepEqual(Array.from(collection.selectedIndexPaths), []);
        });

        it('should select the first item if replacing with an empty section and allowsEmptySelection is false', function () {
          var collection = new EditableCollectionView({delegate, layout, dataSource, size, backend, allowsEmptySelection: false});
          collection.relayoutNow();

          collection.selectItem(new IndexPath(0, 2));
          dataSource.replaceSection(0, [], false);

          assert.deepEqual(Array.from(collection.selectedIndexPaths), [new IndexPath(1, 0)]);
        });
      });
    });
  });
});
