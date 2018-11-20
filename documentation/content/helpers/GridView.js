import {Asset} from '@react/react-spectrum/Asset';
import Button from '@react/react-spectrum/Button';
import ButtonGroup from '@react/react-spectrum/ButtonGroup';
import {Card, CardPreview, CardBody} from '@react/react-spectrum/Card';
import {GalleryLayout, GridLayout, GridView, WaterfallLayout} from '@react/react-spectrum/GridView';
import ListDataSource from '@react/react-spectrum/ListDataSource';
import React from 'react';

const TEST_DATA = [
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC06640.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC06369.jpg', width: 683, height: 1024},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC06370.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC06394.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC02167.jpg', width: 683, height: 1024},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC00527.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC00591.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC01822-Pano.jpeg', width: 1024, height: 367},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC00827.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC01051.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC00888.jpg', width: 683, height: 1024},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC02936.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC01062.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC01817.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC03738.jpg', width: 683, height: 1024},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC03716.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC03438.jpg', width: 841, height: 1024},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC03566.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC03578.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC03643.jpg', width: 1024, height: 683},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC03394-Pano.jpg', width: 1024, height: 258},
  {url: 'https://git.corp.adobe.com/pages/govett/photos/photos/DSC04666.jpg', width: 683, height: 1024}
];

export class TestDS extends ListDataSource {
  constructor(data = TEST_DATA) {
    super();
    this.data = data;
  }

  load() {
    return this.data;
  }

  loadMore() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.data.slice());
      }, 2000);
    });
  }

  itemsForDrop(dropTarget, dataTransfer) {
    let files = Array.from(dataTransfer.files);
    if (files.length > 0) {
      return files.map(file => ({url: URL.createObjectURL(file)}));
    }

    return JSON.parse(dataTransfer.getData('collectionviewdata'));
  }

  async performDrop(dropTarget, dropOperation, items) {
    if (dropTarget.dropPosition === 'DROP_ON') {
      alert('Dropped on ' + this.data[dropTarget.indexPath.index].url.split('/').pop());
      return;
    }

    await Promise.all(items.map(item => {
      return new Promise(resolve => {
        let img = new Image;
        img.onload = () => {
          item.width = img.naturalWidth;
          item.height = img.naturalHeight;
          resolve();
        };
        img.src = item.url;
      })
    }));

    super.performDrop(dropTarget, dropOperation, items);
  }

  getItemSize(item) {
    return {width: item.width, height: item.height};
  }
}

export function renderItem(item) {
  return (
    <Card>
      <CardPreview>
        <Asset type="image" src={item.url} />
      </CardPreview>
      <CardBody title={item.url.split('/').pop()} subtitle="Image" />
    </Card>
  );
}

let ds = new TestDS;
export class LayoutSwitcher extends React.Component {
  state = {
    layout: GridLayout
  };

  render() {
    return (
      <div>
        <ButtonGroup value={this.state.layout} onChange={layout => this.setState({layout})}>
          <Button label="Fixed" value={GridLayout} />
          <Button label="Waterfall" value={WaterfallLayout} />
          <Button label="Gallery" value={GalleryLayout} />
        </ButtonGroup>
        <GridView
          layout={this.state.layout}
          dataSource={ds}
          renderItem={renderItem} />
      </div>
    );
  }
}
