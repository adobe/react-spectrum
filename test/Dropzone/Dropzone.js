import assert from 'assert';
import Dropzone from '../../src/Dropzone';
import Heading from '../../src/Heading/js/Heading';
import IllustratedMessage from '../../src/IllustratedMessage';
import React from 'react';
import {shallow} from 'enzyme';
import {sleep} from '../utils';

describe('Dropzone', () => {
  it('should support custom children', () => {
    let headerText = 'This is a dropzone, drop data in it.';

    const tree = shallow(<Dropzone>
      <Heading>{headerText}</Heading>
    </Dropzone>);

    assert.equal(tree.find(IllustratedMessage).length, 0);
    assert.equal(tree.find(Heading).children().text(), headerText);
  });

  it('should animate onDragOver', async () => {
    const tree = shallow(<Dropzone />);

    let dummyEvent = {
      preventDefault: () => {},
      dataTransfer: {
        dropEffect: 'move'
      }
    };

    let dropzone = tree.find('.spectrum-Dropzone');
    assert.equal(dropzone.prop('className'), 'spectrum-Dropzone');

    dropzone.simulate('dragover', dummyEvent);

    let dragDropzone = tree.find('.is-dragged');
    assert.equal(dragDropzone.prop('className'), 'spectrum-Dropzone is-dragged');

    dropzone.simulate('dragleave', dummyEvent);

    await sleep(105);

    dropzone = tree.find('.spectrum-Dropzone');
    assert.equal(dropzone.prop('className'), 'spectrum-Dropzone');
  });

  it('should pass EventListeners', async () => {
    let dragLeave = false;
    let dragOver = false;
    let dropped = false;

    const onDragLeave = () => dragLeave = true;
    const onDragOver = () => dragOver = true;
    const onDrop = () => dropped = true;

    const dropzone = shallow(<Dropzone onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop} />);

    let dummyEvent = {
      preventDefault: () => {},
      dataTransfer: {
        dropEffect: 'move'
      }
    };

    dropzone.simulate('dragover', dummyEvent);
    assert.equal(dragOver, true);
    dropzone.simulate('dragleave', dummyEvent);
    await sleep(105);
    assert.equal(dragLeave, true);
    dropzone.simulate('drop', dummyEvent);
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

    const dropzone = shallow(<Dropzone onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop} shouldAccept={shouldAccept} />);

    let dummyEvent = {
      preventDefault: () => {},
      dataTransfer: {
        dropEffect: 'move',
        file: DROPPED_DATA
      }
    };

    dropzone.prop('onDragOver')(dummyEvent);
    dropzone.simulate('dragleave', dummyEvent);
    await sleep(105);

    dropzone.prop('onDragOver')(dummyEvent);
    dropzone.simulate('drop', dummyEvent);

    dropzone.prop('onDragOver')(dummyEvent);
    dropzone.simulate('drop', dummyEvent);

    assert(dragOver === 2, true);
    assert(dragLeft === 1);
    assert(dropped === 2);
    assert.equal(droppedData, DROPPED_DATA);
  });
});
