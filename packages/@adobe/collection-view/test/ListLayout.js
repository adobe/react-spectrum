import assert from 'assert';
import ListLayout from '../src/ListLayout';
import Rect from '../src/Rect';
import Size from '../src/Size';

describe('ListLayout', function () {
  describe('rowHeight', function () {
    it('should set correct y coordinates and heights according to the default rowHeight', function () {
      let layout = new ListLayout();

      layout.collectionView = {
        size: new Size(100, 100),
        getNumberOfSections: () => 1,
        getSectionLength: () => 100,
        delegate: {}
      };

      layout.validate();
      assert.deepEqual(layout.getLayoutInfo('item', 0, 0).rect, new Rect(0, 0, 100, 48));
      assert.deepEqual(layout.getLayoutInfo('item', 0, 1).rect, new Rect(0, 48, 100, 48));
    });

    it('should properly handle overriding of rowHeight', function () {
      let layout = new ListLayout({
        rowHeight: 40
      });

      layout.collectionView = {
        size: new Size(100, 100),
        getNumberOfSections: () => 1,
        getSectionLength: () => 100,
        delegate: {}
      };

      layout.validate();
      assert.deepEqual(layout.getLayoutInfo('item', 0, 0).rect, new Rect(0, 0, 100, 40));
      assert.deepEqual(layout.getLayoutInfo('item', 0, 1).rect, new Rect(0, 40, 100, 40));
    });
  });

  describe('delegate', function () {
    it('should not indent by default', function () {
      let layout = new ListLayout();

      layout.collectionView = {
        size: new Size(100, 100),
        getNumberOfSections: () => 1,
        getSectionLength: () => 100,
        delegate: {}
      };

      layout.validate();
      assert.deepEqual(layout.getLayoutInfo('item', 0, 0).rect, new Rect(0, 0, 100, 48));
      assert.deepEqual(layout.getLayoutInfo('item', 0, 1).rect, new Rect(0, 48, 100, 48));
    });

    it('should use the indentation function', function () {
      let layout = new ListLayout();

      layout.collectionView = {
        size: new Size(100, 100),
        getNumberOfSections: () => 1,
        getSectionLength: () => 100,
        delegate: {
          indentationForItem: (section, index) => 45
        }
      };

      layout.validate();
      assert.deepEqual(layout.getLayoutInfo('item', 0, 0).rect, new Rect(45, 0, 55, 48));
      assert.deepEqual(layout.getLayoutInfo('item', 0, 1).rect, new Rect(45, 48, 55, 48));
    });

    it('should pass the indentation index to indentationForItem', function () {
      let layout = new ListLayout();

      layout.collectionView = {
        size: new Size(100, 100),
        getNumberOfSections: () => 1,
        getSectionLength: () => 100,
        delegate: {
          indentationForItem: (section, index) => index * 45
        }
      };

      layout.validate();
      assert.deepEqual(layout.getLayoutInfo('item', 0, 0).rect, new Rect(0, 0, 100, 48));
      assert.deepEqual(layout.getLayoutInfo('item', 0, 1).rect, new Rect(45, 48, 55, 48));
    });
  });

  describe('layout infos', function () {
    let layout = new ListLayout;
    layout.collectionView = {
      size: new Size(100, 100),
      getNumberOfSections: () => 1,
      getSectionLength: () => 100,
      delegate: {
        indentationForItem: (section, index) => index * 20
      }
    };

    layout.validate();

    it('should get a layout info for a row at the correct offset', function () {
      assert.deepEqual(layout.getLayoutInfo('item', 0, 0).rect, new Rect(0, 0, 100, 48));
      assert.deepEqual(layout.getLayoutInfo('item', 0, 1).rect, new Rect(20, 48, 80, 48));
    });

    it('should get all visible layout infos', function () {
      let layoutInfos = layout.getVisibleLayoutInfos(new Rect(0, 0, 100, 500));
      assert.equal(layoutInfos.length, 6);
      assert.equal(layoutInfos[0].rect.y, 0);
      assert.equal(layoutInfos[0].rect.x, 0);
      assert.equal(layoutInfos[1].rect.y, 48);
      assert.equal(layoutInfos[1].rect.x, 20);

      layoutInfos = layout.getVisibleLayoutInfos(new Rect(0, 500, 100, 500));
      assert.equal(layoutInfos.length, 0);
    });
  });

  describe('content height', function () {
    let layout = new ListLayout;
    layout.collectionView = {
      size: new Size(100, 100),
      getNumberOfSections: () => 1,
      getSectionLength: () => 100,
      delegate: {
        indentationForItem: (section, index) => index * 20
      }
    };
    layout.validate();

    it('should calculate the content height', function () {
      assert.equal(layout.getContentSize().height, 4800);
    });
  });
});
