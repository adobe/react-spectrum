import ArrayDataSource from '../src/ArrayDataSource';
import assert from 'assert';
import CollectionData from '../src/CollectionData';
import IndexPath from '../src/IndexPath';
import Range from '../src/Range';
import Selection from '../src/Selection';

describe('Selection', function () {
  var content = new CollectionData(new ArrayDataSource([[1, 2, 3], [4, 5, 6]]));

  describe('replaceWith', function () {
    it('should replace the selection with an IndexPath', function () {
      var s = new Selection(content);
      s.replaceWith(new IndexPath(0, 1));
      s.replaceWith(new IndexPath(2, 4));

      assert.deepEqual(Array.from(s), [new IndexPath(2, 4)]);
      assert.deepEqual(s.anchor, new IndexPath(2, 4));
      assert.deepEqual(s.current, new IndexPath(2, 4));
    });
  });

  describe('toggleIndexPath', function () {
    it('should remove the IndexPath if it is not in the set', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(0, 1));
      s.toggleIndexPath(new IndexPath(2, 4));

      assert.deepEqual(Array.from(s), [new IndexPath(0, 1), new IndexPath(2, 4)]);
      assert.deepEqual(s.anchor, new IndexPath(2, 4));
      assert.deepEqual(s.current, new IndexPath(2, 4));
    });

    it('should remove the IndexPath if it is already in the set', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(0, 1));
      s.toggleIndexPath(new IndexPath(2, 4));
      s.toggleIndexPath(new IndexPath(2, 4));

      assert.deepEqual(Array.from(s), [new IndexPath(0, 1)]);
      assert.deepEqual(s.anchor, new IndexPath(0, 1));
      assert.deepEqual(s.current, new IndexPath(0, 1));
    });
  });

  describe('extendTo', function () {
    it('should extend the selection down', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(0, 1));
      s.extendTo(new IndexPath(1, 0));

      assert.deepEqual(Array.from(s), [new IndexPath(0, 1), new IndexPath(0, 2), new IndexPath(1, 0)]);
      assert.deepEqual(s.anchor, new IndexPath(0, 1));
      assert.deepEqual(s.current, new IndexPath(1, 0));
    });

    it('should extend the selection up', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(1, 0));
      s.extendTo(new IndexPath(0, 1));

      assert.deepEqual(Array.from(s), [new IndexPath(0, 1), new IndexPath(0, 2), new IndexPath(1, 0)]);
      assert.deepEqual(s.anchor, new IndexPath(1, 0));
      assert.deepEqual(s.current, new IndexPath(0, 1));
    });

    it('should extend the selection down then up', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(0, 1));
      s.extendTo(new IndexPath(1, 0));
      s.extendTo(new IndexPath(0, 0));

      assert.deepEqual(Array.from(s), [new IndexPath(0, 0), new IndexPath(0, 1)]);
      assert.deepEqual(s.anchor, new IndexPath(0, 1));
      assert.deepEqual(s.current, new IndexPath(0, 0));
    });

    it('should extend the selection up then down', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(0, 1));
      s.extendTo(new IndexPath(0, 0));
      s.extendTo(new IndexPath(1, 0));

      assert.deepEqual(Array.from(s), [new IndexPath(0, 1), new IndexPath(0, 2), new IndexPath(1, 0)]);
      assert.deepEqual(s.anchor, new IndexPath(0, 1));
      assert.deepEqual(s.current, new IndexPath(1, 0));
    });
  });

  describe('selectAll', function () {
    it('should select all of the elements in the collection', function () {
      var s = new Selection(content);
      s.selectAll();

      assert.deepEqual(Array.from(s), [
        new IndexPath(0, 0), new IndexPath(0, 1), new IndexPath(0, 2),
        new IndexPath(1, 0), new IndexPath(1, 1), new IndexPath(1, 2)
      ]);

      assert.deepEqual(s.anchor, new IndexPath(0, 0));
      assert.deepEqual(s.current, new IndexPath(1, 2));
    });

    it('should work with empty sections at the beginning', function () {
      var s = new Selection(new CollectionData(new ArrayDataSource([[], [], [1, 2, 3]])));
      s.selectAll();

      assert.deepEqual(Array.from(s), [
        new IndexPath(2, 0), new IndexPath(2, 1), new IndexPath(2, 2)
      ]);

      assert.deepEqual(s.anchor, new IndexPath(2, 0));
      assert.deepEqual(s.current, new IndexPath(2, 2));
    });

    it('should work with empty sections at the end', function () {
      var s = new Selection(new CollectionData(new ArrayDataSource([[1, 2, 3], [], []])));
      s.selectAll();

      assert.deepEqual(Array.from(s), [
        new IndexPath(0, 0), new IndexPath(0, 1), new IndexPath(0, 2)
      ]);

      assert.deepEqual(s.anchor, new IndexPath(0, 0));
      assert.deepEqual(s.current, new IndexPath(0, 2));
    });
  });

  describe('adjustForInsertionInSection', function () {
    it('adjusts the anchor and current index paths', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(0, 1));
      s.adjustForInsertionInSection(0, new Range(0, 0));

      assert.deepEqual(Array.from(s), [new IndexPath(0, 2)]);
      assert.deepEqual(s.anchor, new IndexPath(0, 2));
      assert.deepEqual(s.current, new IndexPath(0, 2));
    });
  });

  describe('adjustForDeletionInSection', function () {
    it('adjusts the anchor and current index paths', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(0, 1));
      s.adjustForDeletionInSection(0, new Range(0, 0));

      assert.deepEqual(Array.from(s), [new IndexPath(0, 0)]);
      assert.deepEqual(s.anchor, new IndexPath(0, 0));
      assert.deepEqual(s.current, new IndexPath(0, 0));
    });

    it('should null anchor and current when they are deleted', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(0, 0));
      s.toggleIndexPath(new IndexPath(0, 1));
      s.adjustForDeletionInSection(0, new Range(1, 1));

      assert.deepEqual(Array.from(s), [new IndexPath(0, 0)]);
      assert.deepEqual(s.anchor, null);
      assert.deepEqual(s.current, null);
    });
  });

  describe('adjustForMove', function () {
    it('adjusts the anchor and current index paths', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(0, 1));
      s.adjustForMove(new IndexPath(0, 1), new IndexPath(0, 2));

      assert.deepEqual(Array.from(s), [new IndexPath(0, 2)]);
      assert.deepEqual(s.anchor, new IndexPath(0, 2));
      assert.deepEqual(s.current, new IndexPath(0, 2));
    });
  });

  describe('adjustForInsertedSection', function () {
    it('adjusts the anchor and current index paths', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(0, 1));
      s.adjustForInsertedSection(0);

      assert.deepEqual(Array.from(s), [new IndexPath(1, 1)]);
      assert.deepEqual(s.anchor, new IndexPath(1, 1));
      assert.deepEqual(s.current, new IndexPath(1, 1));
    });
  });

  describe('adjustForDeletedSection', function () {
    it('adjusts the anchor and current index paths', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(1, 1));
      s.adjustForDeletedSection(0);

      assert.deepEqual(Array.from(s), [new IndexPath(0, 1)]);
      assert.deepEqual(s.anchor, new IndexPath(0, 1));
      assert.deepEqual(s.current, new IndexPath(0, 1));
    });

    it('should null anchor and current when their section is deleted', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(1, 5));
      s.adjustForDeletedSection(1);

      assert.deepEqual(Array.from(s), []);
      assert.equal(s.anchor, null);
      assert.equal(s.current, null);
    });
  });

  describe('adjustForMovedSection', function () {
    it('adjusts the anchor and current index paths', function () {
      var s = new Selection(content);
      s.toggleIndexPath(new IndexPath(0, 1));
      s.adjustForMovedSection(0, 1);

      assert.deepEqual(Array.from(s), [new IndexPath(1, 1)]);
      assert.deepEqual(s.anchor, new IndexPath(1, 1));
      assert.deepEqual(s.current, new IndexPath(1, 1));
    });
  });

  describe('clear', function () {
    it('should clear selections', function () {
      var options = {allowsEmptySelection: true};
      var s = new Selection(content, options);
      s.replaceWith(new IndexPath(0, 1));
      s.clear();

      assert.deepEqual(Array.from(s), []);
      assert.deepEqual(s.anchor, null);
      assert.deepEqual(s.current, null);
    });

    it('should return early if !allowsEmptySelection', function () {
      var options = {allowsEmptySelection: false};
      var s = new Selection(content, options);
      s.replaceWith(new IndexPath(0, 1));
      s.clear();

      assert.deepEqual(Array.from(s), [new IndexPath(0, 1)]);
      assert.deepEqual(s.anchor, new IndexPath(0, 1));
      assert.deepEqual(s.current, new IndexPath(0, 1));
    });
  });
});
