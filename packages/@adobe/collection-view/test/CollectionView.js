import {ArrayDataSource, CollectionView, IndexPath, ListLayout, Point, ReusableView, Size, StackLayout} from '../src';
import assert from 'assert';
import {compareView} from '../src/utils';

class ItemView extends ReusableView {
  static count = 0;
  constructor() {
    super();
    ItemView.count++;
  }

  render(dom) {
    dom.innerHTML = this.content;
  }

  getSize() {
    return new Size(this.layoutInfo.rect.height, this.layoutInfo.rect.height + Math.random() * (Math.random() > 0.5 ? 1 : -1) * 50);
  }
}

let delegate = {
  createView: function () {
    return new ItemView;
  },
  getContentForExtraView: function (type, section, index) {
    assert.equal(type, 'header');
    return headers[section];
  }
};

let stackDelegate = {
  createView: function () {
    return new ItemView;
  },
  getContentForExtraView: function (type, section, index) {
    assert(type === 'header' || type === 'footer');
    return headers[section];
  },
  estimateSize: function (item) {
    return new Size(100, 100);
  }
};

let data, headers, dataSource, layout;
let size = new Size(450, 450);
let transitionDuration = 10;

function checkLayout(children, i = 0) {
  let y = i * 100;
  let j = 0;
  for (let child of children) {
    assert.ok(child instanceof ItemView);
    assert.equal(child.style.width, '450px');
    assert.equal(child.style.height, '100px');
    assert.equal(child.style.transform, `translate3d(0px, ${y}px, 0)`);
    assert.equal(child.content, data[j][i++]);
    y += 100;

    if (i >= data[j].length) {
      j++;
      i = 0;
    }
  }
}

describe('CollectionView', function () {
  beforeEach(function () {
    ItemView.count = 0;

    data = [];
    headers = [];
    for (var i = 0; i < 10; i++) {
      data[i] = [];
      headers[i] = `Header ${i}`;
      for (var j = 0; j < 50; j++) {
        data[i][j] = `Item ${i},${j}`;
      }
    }

    dataSource = new ArrayDataSource(data);
    layout = new ListLayout({
      rowHeight: 100
    });
  });

  describe('rendering', function () {
    it('should do nothing with no datasource', function () {
      var collection = new CollectionView({delegate, layout, size});
      assert.deepEqual(collection.delegate, delegate);
      assert.deepEqual(collection.layout, layout);
      assert.deepEqual(collection.size, size);
      assert.deepEqual(collection.dataSource, null);

      collection.relayoutNow();
      assert.deepEqual(Array.from(collection.inner.children), []);
    });

    it('should do nothing with no layout', function () {
      var collection = new CollectionView({delegate, dataSource, size});
      assert.deepEqual(collection.delegate, delegate);
      assert.deepEqual(collection.layout, null);
      assert.deepEqual(collection.size, size);
      assert.deepEqual(collection.dataSource, dataSource);

      collection.relayoutNow();
      assert.deepEqual(Array.from(collection.inner.children), []);
    });

    it('should create the initial set of visible views', function () {
      var collection = new CollectionView({delegate, layout, dataSource, size});
      collection.relayoutNow();

      let children = Array.from(collection.inner.children).sort(compareView);
      assert.deepEqual(children.length, 5);
      checkLayout(children);
    });

    describe('should update visible views on scroll', function () {
      it('with no changes', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        collection.setContentOffset(new Point(0, 10));

        let children = Array.from(collection.inner.children).sort(compareView);
        assert.deepEqual(children.length, 5);
        assert.deepEqual(ItemView.count, 5);
        checkLayout(children);
      });

      it('with overlapping regions', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        collection.setContentOffset(new Point(0, 246));

        let children = Array.from(collection.inner.children).sort(compareView);
        assert.deepEqual(children.length, 5);
        assert.deepEqual(ItemView.count, 5); // it should reuse views
        checkLayout(children, 2);
      });

      it('with non-overlapping regions', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        collection.setContentOffset(new Point(0, 746));

        let children = Array.from(collection.inner.children).sort(compareView);
        assert.deepEqual(children.length, 5);
        assert.deepEqual(ItemView.count, 5); // it should reuse views
        checkLayout(children, 7);
      });
    });

    describe('should support supplementary views', function () {
      beforeEach(function () {
        layout = new StackLayout({
          showHeaders: true,
          showFooters: true
        });
      });

      it('should render section headers', function () {
        var collection = new CollectionView({delegate: stackDelegate, layout, dataSource, size});
        collection.relayoutNow();

        let children = Array.from(collection.inner.children).sort(compareView);
        assert.deepEqual(children.length, 5);
        assert.equal(children[0].viewType, 'header');
        assert.equal(children[0].content, 'Header 0');
        assert.equal(children[0].style.height, '5115px');
      });

      it('getViewsOfType', function () {
        var collection = new CollectionView({delegate: stackDelegate, layout, dataSource, size});
        collection.relayoutNow();

        assert.equal(collection.getViewsOfType('header').length, 1);
        assert.equal(collection.getViewsOfType('footer').length, 0);
        assert.equal(collection.getViewsOfType('item').length, 4);
      });

      it('reloadSupplementaryView', function () {
        var collection = new CollectionView({delegate: stackDelegate, layout, dataSource, size});
        collection.relayoutNow();

        let children = Array.from(collection.inner.children).sort(compareView);
        assert.equal(children[0].content, 'Header 0');

        headers[0] = 'Updated';
        collection.reloadSupplementaryView('header', 0);

        assert.equal(children[0].content, 'Updated');
      });

      it('reloadSupplementaryViewsOfType', function () {
        dataSource = new ArrayDataSource([['a', 'b', 'c'], ['1', '2', '3']]);
        var collection = new CollectionView({delegate: stackDelegate, layout, dataSource, size});
        collection.relayoutNow();

        let children = Array.from(collection.inner.children).sort(compareView);
        assert.equal(children.length, 5);
        assert.equal(collection.getViewsOfType('header').length, 1);

        headers[0] = 'Updated 1';
        headers[1] = 'Updated 2';
        collection.reloadSupplementaryViewsOfType('header');

        assert.equal(children[0].content, 'Updated 1');
        assert.equal(children[4].content, 'c');
      });
    });

    describe('Accessibility attributes', function () {
      it('should have role=presentation by default', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();
        assert.equal(collection.attrs.role, 'presentation');
        assert.equal(collection.inner.attrs.role, 'presentation');
      });

      it('should add appropriate accessibility attributes', function () {
        var collection = new CollectionView({
          delegate,
          layout,
          dataSource,
          size,
          id: 'collectionview-id',
          role: 'grid',
          'aria-label': 'CollectionView Table',
          'aria-labelledby': 'foo-id collectionview-id',
          'aria-colcount': 1,
          'aria-rowcount': 510,
          'aria-multiselectable': true
        });
        collection.relayoutNow();
        assert.equal(collection.attrs.role, 'grid');
        assert.equal(collection.attrs.id, 'collectionview-id');
        assert.equal(collection.attrs['aria-label'], 'CollectionView Table');
        assert.equal(collection.attrs['aria-labelledby'], 'foo-id collectionview-id');
        assert.equal(collection.attrs['aria-colcount'], 1);
        assert.equal(collection.attrs['aria-rowcount'], 510);
        assert.equal(collection.attrs['aria-multiselectable'], undefined);
        assert.equal(collection.inner.attrs.role, 'rowgroup');
      });
    });
  });

  describe('setting the data source', function () {
    it('should allow replacing the data source', function (done) {
      var collection = new CollectionView({delegate, layout, dataSource, size});
      collection.relayoutNow();

      collection.dataSource = new ArrayDataSource([['a', 'b', 'c']]);

      setTimeout(function () {
        let children = Array.from(collection.inner.children).sort(compareView);
        assert.deepEqual(children.length, 3);
        done();
      }, 10);
    });
  });

  describe('setting the layout', function () {
    it('without animation', function (done) {
      var collection = new CollectionView({delegate, layout, dataSource, size});
      collection.relayoutNow();

      collection.layout = new ListLayout();

      setTimeout(function () {
        let children = Array.from(collection.inner.children).sort(compareView);
        assert.equal(children.length, 10);
        assert.equal(children[0].style.width, '450px');
        assert.equal(children[0].style.height, '48px');
        assert.equal(children[0].style.transform, 'translate3d(0px, 0px, 0)');

        assert.equal(children[1].style.width, '450px');
        assert.equal(children[1].style.height, '48px');
        assert.equal(children[1].style.transform, 'translate3d(0px, 48px, 0)');

        done();
      }, 10);
    });

    it('with an animated transition', function (done) {
      var collection = new CollectionView({delegate, layout, dataSource, size});
      collection.relayoutNow();

      collection.setLayout(new ListLayout(), true);

      let children = Array.from(collection.inner.children).sort(compareView);
      assert.equal(children.length, 10);

      // Check the initial layout (should have all 12 views that will be visible
      // after the transition, but with layout infos from the original layout).
      checkLayout(children);

      setTimeout(function () {
        // Check that the views got layout infos from the new layout
        let children = Array.from(collection.inner.children).sort(compareView);
        assert.equal(children.length, 10);
        assert.equal(children[0].style.width, '450px');
        assert.equal(children[0].style.height, '48px');
        assert.equal(children[0].style.transform, 'translate3d(0px, 0px, 0)');

        assert.equal(children[1].style.width, '450px');
        assert.equal(children[1].style.height, '48px');
        assert.equal(children[1].style.transform, 'translate3d(0px, 48px, 0)');

        done();
      }, 20);
    });
  });

  describe('retrieving content', function () {
    describe('getNumberOfSections', function () {
      it('should return 0 if there is no data source', function () {
        var collection = new CollectionView({delegate, layout, size});
        assert.equal(collection.getNumberOfSections(), 0);
      });

      it('should return the number of sections', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        assert.equal(collection.getNumberOfSections(), 10);
      });
    });

    describe('getSectionLength', function () {
      it('should return 0 if there is no data source', function () {
        var collection = new CollectionView({delegate, layout, size});
        assert.equal(collection.getSectionLength(0), 0);
      });

      it('should return the section length', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        assert.equal(collection.getSectionLength(0), 50);
      });
    });

    describe('getItem', function () {
      it('should return null if there is no data source', function () {
        var collection = new CollectionView({delegate, layout, size});
        assert.equal(collection.getItem(0, 0), null);
      });

      it('should return the item', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        assert.equal(collection.getItem(0, 0), 'Item 0,0');
      });

      it('should support passing an IndexPath', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        assert.equal(collection.getItem(new IndexPath(0, 0)), 'Item 0,0');
      });
    });

    describe('incrementIndexPath', function () {
      it('should return null if there is no data source', function () {
        var collection = new CollectionView({delegate, layout, size});
        assert.equal(collection.incrementIndexPath(new IndexPath(0, 0), 1), null);
      });

      it('should increment the IndexPath', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        assert.deepEqual(collection.incrementIndexPath(new IndexPath(0, 0), 1), new IndexPath(0, 1));
      });
    });
  });

  describe('retrieving views', function () {
    describe('visibleViews', function () {
      it('should return an empty array if there is no data source', function () {
        var collection = new CollectionView({delegate, layout, size});
        assert.deepEqual(collection.visibleViews, []);
      });

      it('should return the visible views', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        assert.equal(collection.visibleViews.length, 5);
      });
    });

    describe('getView', function () {
      it('should return a visible view', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        var view = collection.getView('item', 0, 0);
        assert.equal(view.content, 'Item 0,0');
      });

      it('should support passing an IndexPath', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        var view = collection.getView('item', new IndexPath(0, 0));
        assert.equal(view.content, 'Item 0,0');
      });

      it('should return null for views that are not visible', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        var view = collection.getView('item', 1, 0);
        assert.equal(view, null);
      });

      it('should return null for keys that don\'t exist', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        var view = collection.getView('header', 0);
        assert.equal(view, null);
      });
    });

    describe('getItemView', function () {
      it('should return an item view', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        var view = collection.getItemView(0, 0);
        assert.equal(view.content, 'Item 0,0');
      });

      it('should support passing an IndexPath', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        var view = collection.getItemView(new IndexPath(0, 0));
        assert.equal(view.content, 'Item 0,0');
      });

      it('should return null for views that are not visible', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        var view = collection.getItemView(1, 0);
        assert.equal(view, null);
      });
    });

    describe('indexPathForView', function () {
      it('should return an item view', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        var indexPath = collection.indexPathForView(collection.visibleViews[1]);
        assert.deepEqual(indexPath, new IndexPath(0, 1));
      });
    });

    describe('indexPathAtPoint', function () {
      it('should return an IndexPath for an item view at the given point', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        var indexPath = collection.indexPathAtPoint(new Point(20, 320));
        assert.deepEqual(indexPath, new IndexPath(0, 3));
      });
    });
  });

  describe('estimated sizes', function () {
    beforeEach(function () {
      layout = new StackLayout({
        showHeaders: true,
        showFooters: false
      });
    });

    it('should trigger a relayout after new views become visible for the first time', function (done) {
      var collection = new CollectionView({delegate: stackDelegate, layout, dataSource, size});
      collection.relayoutNow();

      // starts out using the estimated sizes
      let children = Array.from(collection.inner.children).sort(compareView);
      for (let child of children) {
        if (child.viewType === 'item') {
          assert.equal(child.style.width, '398px');
          assert.equal(child.style.height, '100px');
        }
      }

      setTimeout(function () {
        let children = Array.from(collection.inner.children).sort(compareView);

        let y = 70;
        for (let child of children) {
          if (child.viewType === 'item') {
            assert.equal(child.style.width, '398px');
            assert.ok(parseFloat(child.style.height) > 50);
            assert.ok(parseFloat(child.style.height) < 150);
            assert.equal(child.style.transform, `translate3d(26px, ${y}px, 0)`);
            y += parseFloat(child.style.height);
          }
        }

        done();
      }, 10);
    });

    it('should support updateItemSize method to trigger an update to a single item', function (done) {
      var collection = new CollectionView({delegate: stackDelegate, layout, dataSource, size});
      collection.relayoutNow();

      let children = Array.from(collection.inner.children);
      let height = children[1].style.height;

      setTimeout(function () {
        collection.updateItemSize(new IndexPath(0, 1));
      }, 20);

      setTimeout(function () {
        let children = Array.from(collection.inner.children);
        assert.notEqual(children[1].style.height, height);

        let y = 70;
        for (let child of children) {
          if (child.viewType === 'item') {
            assert.equal(child.style.width, '398px');
            assert.ok(parseFloat(child.style.height) > 50);
            assert.ok(parseFloat(child.style.height) < 150);
            assert.equal(child.style.transform, `translate3d(26px, ${y}px, 0)`);
            y += parseFloat(child.style.height);
          }
        }

        done();
      }, 150);
    });
  });

  describe('transactions', function () {
    describe('insert item', function () {
      it('should perform an animated insertion', function (done) {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        // children and visible views should start out the same
        let children = Array.from(collection.inner.children);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.deepEqual(children, visibleViews);

        dataSource.insertItem(new IndexPath(0, 1), 'Inserted');

        // children should still have the removed view, but visible views should not
        children = Array.from(collection.inner.children).sort(compareView);
        visibleViews = collection.visibleViews.sort(compareView);
        assert.notDeepEqual(children, visibleViews);
        assert.deepEqual(children.slice(0, -1), visibleViews);
        assert.equal(children[1].content, 'Inserted');
        assert.equal(visibleViews[1].content, 'Inserted');

        // assert that the inserted child got the initial layout info applied
        assert.equal(children[1].style.opacity, 0);
        assert.equal(children[1].style.transform, 'translate3d(0px, 100px, 0) scale3d(0.8, 0.8, 0.8)');

        // Wait until the final layout infos are applied (in the next animation frame), and check layout,
        setTimeout(function () {
          checkLayout(children);
        }, 5);

        setTimeout(function () {
          // removed view should have been removed from children after the transition
          children = Array.from(collection.inner.children);
          visibleViews = collection.visibleViews.sort(compareView);
          assert.deepEqual(children, visibleViews);
          checkLayout(children);
          done();
        }, 12);
      });

      it('should perform a non-animated insertion', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.insertItem(new IndexPath(0, 1), 'Inserted', false);

        // children and visible views should be equal since this was a non-animated transaction
        let children = Array.from(collection.inner.children);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.deepEqual(children, visibleViews);
        assert.equal(children[1].content, 'Inserted');
        assert.equal(visibleViews[1].content, 'Inserted');
        checkLayout(children);
      });
    });

    describe('remove item', function () {
      it('should perform an animated removal', function (done) {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.removeItem(new IndexPath(0, 1));

        // children should still have the removed view, but visible views should not
        let children = Array.from(collection.inner.children).sort(compareView);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.notDeepEqual(children, visibleViews);
        assert.deepEqual([children[0], ...children.slice(2)], visibleViews);

        // Wait until the final layout infos are applied (in the next animation frame), and check layout,
        setTimeout(function () {
          // assert that the removed child got the final layout info applied
          assert.equal(children[1].style.opacity, 0);
          assert.equal(children[1].style.transform, 'translate3d(0px, 100px, 0) scale3d(0.8, 0.8, 0.8)');
        }, 5);

        setTimeout(function () {
          // removed view should have been removed from children after the transition
          children = Array.from(collection.inner.children);
          visibleViews = collection.visibleViews.sort(compareView);
          assert.deepEqual(children, visibleViews);
          checkLayout(children);
          done();
        }, 12);
      });

      it('should perform a non-animated removal', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.removeItem(new IndexPath(0, 1), false);

        // children and visible views should be equal since this was a non-animated transaction
        let children = Array.from(collection.inner.children);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.deepEqual(children, visibleViews);
        checkLayout(children);
      });
    });

    describe('move item', function () {
      it('should perform an animated move', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.moveItem(new IndexPath(0, 1), new IndexPath(0, 3));

        // children and visible views should still be equal
        let children = Array.from(collection.inner.children).sort(compareView);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.deepEqual(children, visibleViews);
        checkLayout(children);
      });

      it('should perform a non-animated move', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.moveItem(new IndexPath(0, 1), new IndexPath(0, 3), false);

        // children and visible views should be equal since this was a non-animated transaction
        let children = Array.from(collection.inner.children).sort(compareView);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.deepEqual(children, visibleViews);
        checkLayout(children);
      });
    });

    describe('replace item', function () {
      it('should perform an animated replace', function (done) {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.replaceItem(new IndexPath(0, 1), 'Replaced');

        // children should still have the removed view, but visible views should not
        let children = Array.from(collection.inner.children).sort(compareView);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.notDeepEqual(children, visibleViews);
        assert.deepEqual(children.map(c => c.content), ['Item 0,0', 'Item 0,1', 'Replaced', 'Item 0,2', 'Item 0,3', 'Item 0,4']);
        assert.deepEqual(visibleViews.map(c => c.content), ['Item 0,0', 'Replaced', 'Item 0,2', 'Item 0,3', 'Item 0,4']);

        // assert that the inserted child got the initial layout info applied
        assert.equal(children[2].style.opacity, 0);
        assert.equal(children[2].style.transform, 'translate3d(0px, 100px, 0) scale3d(0.8, 0.8, 0.8)');

        // Wait until the final layout infos are applied (in the next animation frame), and check layout,
        setTimeout(function () {
          // assert that the removed child got the final layout info applied
          assert.equal(children[1].style.opacity, 0);
          assert.equal(children[1].style.transform, 'translate3d(0px, 100px, 0) scale3d(0.8, 0.8, 0.8)');

          // assert that the inserted child got the final layout info applied
          assert.equal(children[2].style.opacity, 1);
          assert.equal(children[2].style.transform, 'translate3d(0px, 100px, 0)');
        }, 5);

        setTimeout(function () {
          // removed view should have been removed from children after the transition
          children = Array.from(collection.inner.children);
          visibleViews = collection.visibleViews.sort(compareView);
          assert.deepEqual(children, visibleViews);
          checkLayout(children);
          done();
        }, 12);
      });

      it('should perform a non-animated replace', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.replaceItem(new IndexPath(0, 1), 'Replaced', false);

        // children and visible views should be equal since this was a non-animated transaction
        let children = Array.from(collection.inner.children);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.deepEqual(children, visibleViews);
        checkLayout(children);
      });
    });

    describe('insert section', function () {
      it('should perform an animated insertion', function (done) {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        // children and visible views should start out the same
        let children = Array.from(collection.inner.children).sort(compareView);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.deepEqual(children, visibleViews);

        dataSource.insertSection(0, ['Inserted 1', 'Inserted 2', 'Inserted 3']);

        // children should still have the removed views, but visible views should not
        children = Array.from(collection.inner.children).sort(compareView);
        visibleViews = collection.visibleViews.sort(compareView);
        assert.deepEqual(children.map(c => c.content), ['Inserted 1', 'Inserted 2', 'Inserted 3', 'Item 0,0', 'Item 0,1', 'Item 0,2', 'Item 0,3', 'Item 0,4']);
        assert.deepEqual(visibleViews.map(c => c.content), ['Inserted 1', 'Inserted 2', 'Inserted 3', 'Item 0,0', 'Item 0,1']);

        // assert that the inserted children got the initial layout info applied
        let y = 0;
        for (var child of children.slice(0, 3)) {
          assert.equal(child.style.opacity, 0);
          assert.equal(child.style.transform, `translate3d(0px, ${y}px, 0) scale3d(0.8, 0.8, 0.8)`);
          y += 100;
        }

        // Wait until the final layout infos are applied (in the next animation frame), and check layout,
        setTimeout(function () {
          checkLayout(children);
        }, 5);

        setTimeout(function () {
          // removed views should have been removed from children after the transition
          children = Array.from(collection.inner.children);
          visibleViews = collection.visibleViews.sort(compareView);
          assert.deepEqual(children, visibleViews);
          checkLayout(children);
          done();
        }, 12);
      });

      it('should perform a non-animated insertion', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.insertSection(0, ['Inserted 1', 'Inserted 2', 'Inserted 3'], false);

        // children and visible views should be equal since this was a non-animated transaction
        let children = Array.from(collection.inner.children);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.deepEqual(children, visibleViews);
        assert.deepEqual(children.map(c => c.content), ['Inserted 1', 'Inserted 2', 'Inserted 3', 'Item 0,0', 'Item 0,1']);
        assert.deepEqual(visibleViews.map(c => c.content), ['Inserted 1', 'Inserted 2', 'Inserted 3', 'Item 0,0', 'Item 0,1']);
        checkLayout(children);
      });
    });

    describe('remove section', function () {
      it('should perform an animated removal', function (done) {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.removeSection(0);

        // children should still have the removed view, but visible views should not
        let children = Array.from(collection.inner.children).sort(compareView);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.notDeepEqual(children, visibleViews);
        assert.equal(children.length, visibleViews.length * 2);

        // Wait until the final layout infos are applied (in the next animation frame), and check layout
        setTimeout(function () {
          // assert that the removed children got the final layout info applied, and children coming in
          // have normal layout infos. They will be interleaved because of the way they were sorted (above).
          let y = 0;
          for (var i = 0; i < children.length; i++) {
            if (i % 2 === 0) {
              assert.equal(children[i].style.opacity, 0);
              assert.equal(children[i].style.transform, `translate3d(0px, ${y}px, 0) scale3d(0.8, 0.8, 0.8)`);
            } else {
              assert.equal(children[i].style.opacity, 1);
              assert.equal(children[i].style.transform, `translate3d(0px, ${y}px, 0)`);
              y += 100;
            }
          }
        }, 5);

        setTimeout(function () {
          // removed view should have been removed from children after the transition
          children = Array.from(collection.inner.children);
          visibleViews = collection.visibleViews.sort(compareView);
          assert.deepEqual(children, visibleViews);
          checkLayout(children);
          done();
        }, 12);
      });

      it('should perform a non-animated removal', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.removeSection(0, false);

        // children and visible views should be equal since this was a non-animated transaction
        let children = Array.from(collection.inner.children);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.deepEqual(children, visibleViews);
        checkLayout(children);
      });
    });

    describe('move section', function () {
      it('should perform an animated move', function (done) {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.moveSection(0, 1);

        // children and visible views should still be equal
        let children = Array.from(collection.inner.children);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.notDeepEqual(children, visibleViews);
        assert.equal(children.length, visibleViews.length * 2);

        setTimeout(function () {
          // removed views should have been removed from children after the transition
          children = Array.from(collection.inner.children);
          visibleViews = collection.visibleViews.sort(compareView);
          assert.deepEqual(children, visibleViews);
          checkLayout(children);
          done();
        }, 12);
      });

      it('should perform a non-animated move', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.moveSection(0, 1, false);

        // children and visible views should be equal since this was a non-animated transaction
        let children = Array.from(collection.inner.children);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.deepEqual(children, visibleViews);
        checkLayout(children);
      });
    });

    describe('replace section', function () {
      it('should perform an animated replace', function (done) {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.replaceSection(0, ['Replaced 1', 'Replaced 2', 'Replaced 3']);

        // children should still have the removed view, but visible views should not
        let children = Array.from(collection.inner.children).sort(compareView);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.notDeepEqual(children, visibleViews);
        assert.deepEqual(children.map(c => c.content), ['Item 0,0', 'Replaced 1', 'Item 0,1', 'Replaced 2', 'Item 0,2', 'Replaced 3', 'Item 0,3', 'Item 0,4', 'Item 1,0', 'Item 1,1']);
        assert.deepEqual(visibleViews.map(c => c.content), ['Replaced 1', 'Replaced 2', 'Replaced 3', 'Item 1,0', 'Item 1,1']);

        // assert that the inserted children got the initial layout infos applied
        let y = 0;
        for (var i of [1, 3, 5]) {
          assert.equal(children[i].style.opacity, 0);
          assert.equal(children[i].style.transform, `translate3d(0px, ${y}px, 0) scale3d(0.8, 0.8, 0.8)`);
          y += 100;
        }

        // Wait until the final layout infos are applied (in the next animation frame), and check layout,
        setTimeout(function () {
          // assert that the removed children got the final layout infos applied
          let y = 0;
          for (let i of [0, 2, 4, 6, 7]) {
            assert.equal(children[i].style.opacity, 0);
            assert.equal(children[i].style.transform, `translate3d(0px, ${y}px, 0) scale3d(0.8, 0.8, 0.8)`);
            y += 100;
          }

          // assert that the inserted children got the final layout infos applied
          y = 0;
          for (let i of [1, 3, 5]) {
            assert.equal(children[i].style.opacity, 1);
            assert.equal(children[i].style.transform, `translate3d(0px, ${y}px, 0)`);
            y += 100;
          }
        }, 5);

        setTimeout(function () {
          // removed views should have been removed from children after the transition
          children = Array.from(collection.inner.children);
          visibleViews = collection.visibleViews.sort(compareView);
          assert.deepEqual(children, visibleViews);
          checkLayout(children);
          done();
        }, 12);
      });

      it('should perform a non-animated replace', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size, transitionDuration});
        collection.relayoutNow();

        dataSource.replaceSection(0, ['Replaced 1', 'Replaced 2', 'Replaced 3'], false);

        // children and visible views should be equal since this was a non-animated transaction
        let children = Array.from(collection.inner.children);
        let visibleViews = collection.visibleViews.sort(compareView);
        assert.deepEqual(children, visibleViews);
        checkLayout(children);
      });
    });
  });

  describe('scrolling', function () {
    describe('scrollTo', function () {
      it('should animate the scroll position', function (done) {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        collection.scrollTo(new Point(0, 1000), 100);

        setTimeout(function () {
          assert.ok(collection.contentOffset.y > 10);
          assert.ok(collection.contentOffset.y < 900);
        }, 50);

        setTimeout(function () {
          assert.equal(collection.contentOffset.x, 0);
          assert.equal(collection.contentOffset.y, 1000);
          done();
        }, 120);
      });

      it('should return a promise that resolves when the animation is complete', function (done) {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        collection.scrollTo(new Point(0, 1000), 100).then(function () {
          assert.equal(collection.contentOffset.y, 1000);
          assert.deepEqual(Array.from(collection.inner.children), collection.visibleViews.sort(compareView));
          done();
        });
      });

      it('should set the scroll position synchronously if the duration is zero', function (done) {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        collection.scrollTo(new Point(200, 1000), 0).then(function () {
          assert.equal(collection.contentOffset.y, 1000);
          assert.deepEqual(Array.from(collection.inner.children), collection.visibleViews.sort(compareView));
          done();
        });

        assert.equal(collection.contentOffset.y, 1000);
      });

      it('should cancel the running scroll animation if another one starts before it is done', function (done) {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        collection.scrollTo(new Point(0, 1000), 100);

        setTimeout(function () {
          collection.scrollTo(new Point(0, 100), 100);
        }, 50);

        setTimeout(function () {
          assert.equal(collection.contentOffset.y, 100);
          assert.deepEqual(Array.from(collection.inner.children), collection.visibleViews.sort(compareView));
          done();
        }, 180);
      });

      it('defers size updates until after the scroll animation is complete', function (done) {
        layout = new StackLayout({
          showHeaders: true,
          showFooters: false
        });

        var collection = new CollectionView({delegate: stackDelegate, layout, dataSource, size});
        collection.relayoutNow();

        collection.scrollTo(new Point(0, 1000), 100);

        // in the middle of the animation, trigger a size update for a view that
        // will be visible at the end of the transition
        setTimeout(function () {
          collection.updateItemSize(new IndexPath(0, 12));
        }, 50);

        // at the end, assert that the size update was processed
        setTimeout(function () {
          assert.notEqual(collection.visibleViews[3].style.height, '100px');
          assert.deepEqual(Array.from(collection.inner.children), collection.visibleViews.sort(compareView));
          done();
        }, 150);
      });
    });

    describe('scrollToItem', function () {
      it('should scroll down to an item', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        collection.scrollToItem(new IndexPath(5, 1), 0);
        assert.equal(collection.contentOffset.y, 24750);
        assert.deepEqual(Array.from(collection.inner.children), collection.visibleViews.sort(compareView));
      });

      it('should scroll up to an item', function () {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        collection.setContentOffset(new Point(0, 2500));
        collection.scrollToItem(new IndexPath(0, 2), 0);
        assert.equal(collection.contentOffset.y, 200);
        assert.deepEqual(Array.from(collection.inner.children), collection.visibleViews.sort(compareView));
      });

      it('should support animated scrolling', function (done) {
        var collection = new CollectionView({delegate, layout, dataSource, size});
        collection.relayoutNow();

        collection.scrollToItem(new IndexPath(5, 1), 100);

        setTimeout(function () {
          assert.ok(collection.contentOffset.y > 10);
          assert.ok(collection.contentOffset.y < 24000);
        }, 50);

        setTimeout(function () {
          assert.equal(collection.contentOffset.y, 24750);
          assert.deepEqual(Array.from(collection.inner.children), collection.visibleViews.sort(compareView));
          done();
        }, 120);
      });
    });
  });
});
