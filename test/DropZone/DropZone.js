import assert from 'assert';
import DropZone from '../../src/DropZone';
import Heading from '../../src/Heading/js/Heading';
import IllustratedMessage from '../../src/IllustratedMessage';
import React from 'react';
import {shallow} from 'enzyme';
import {sleep} from '../utils';

describe('DropZone', () => {
  it('should support custom children', () => {
    let headerText = 'This is a DropZone, drop data in it.';

    const tree = shallow(<DropZone>
      <Heading>{headerText}</Heading>
    </DropZone>);

    assert.equal(tree.find(IllustratedMessage).length, 0);
    assert.equal(tree.find(Heading).children().text(), headerText);
  });

  it('should animate onDragOver', async () => {
    const tree = shallow(<DropZone />);

    let dummyEvent = {
      preventDefault: () => {},
      dataTransfer: {
        dropEffect: 'move'
      }
    };

    let dropZone = tree.find('.spectrum-Dropzone');
    assert.equal(dropZone.prop('className'), 'spectrum-Dropzone');

    dropZone.simulate('dragover', dummyEvent);

    let dragDropZone = tree.find('.is-dragged');
    assert.equal(dragDropZone.prop('className'), 'spectrum-Dropzone is-dragged');

    dropZone.simulate('dragleave', dummyEvent);

    await sleep(105);

    dropZone = tree.find('.spectrum-Dropzone');
    assert.equal(dropZone.prop('className'), 'spectrum-Dropzone');
  });

  it('should pass EventListeners', async () => {
    let dragLeave = false;
    let dragOver = false;
    let dropped = false;

    const onDragLeave = () => dragLeave = true;
    const onDragOver = () => dragOver = true;
    const onDrop = () => dropped = true;

    const dropZone = shallow(<DropZone onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop} />);

    let dummyEvent = {
      preventDefault: () => {},
      dataTransfer: {
        dropEffect: 'move'
      }
    };

    dropZone.simulate('dragover', dummyEvent);
    assert.equal(dragOver, true);
    dropZone.simulate('dragleave', dummyEvent);
    await sleep(105);
    assert.equal(dragLeave, true);
    dropZone.simulate('drop', dummyEvent);
    assert.equal(dropped, true);
  });

  it('should handle shouldAccept properly', async () => {
    const DROPPED_DATA = 'hello world';

    let dragLeft = 0;
    let dragOver = 0;
    let dropped = 0;
    let droppedData = null;

    const onDragLeave = () => dragLeft++;
    const onDragOver = () => dragOver++;
    const onDrop = (e) => {
      dropped++;
      droppedData = e.dataTransfer.file;
    };
    const shouldAccept = () => dropped === 0;

    const dropZone = shallow(<DropZone onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop} shouldAccept={shouldAccept} />);

    let dummyEvent = {
      preventDefault: () => {},
      dataTransfer: {
        dropEffect: 'move',
        file: DROPPED_DATA
      }
    };

    dropZone.prop('onDragOver')(dummyEvent);
    dropZone.simulate('dragleave', dummyEvent);
    await sleep(105);

    dropZone.prop('onDragOver')(dummyEvent);
    dropZone.simulate('drop', dummyEvent);

    dropZone.prop('onDragOver')(dummyEvent);
    dropZone.simulate('drop', dummyEvent);

    assert(dragOver === 2, true);
    assert(dragLeft === 1);
    assert(dropped === 2);
    assert.equal(droppedData, DROPPED_DATA);
  });
});
