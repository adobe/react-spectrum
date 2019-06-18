/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {action} from '@storybook/addon-actions';
import {Asset} from '../src/Asset';
import Button from '../src/Button';
import ButtonGroup from '../src/ButtonGroup';
import {Card, CardBody, CardPreview} from '../src/Card';
import {GalleryLayout, GridLayout, GridView, WaterfallLayout} from '../src/GridView';
import IllustratedMessage from '../src/IllustratedMessage';
import ListDataSource from '../src/ListDataSource';
import React from 'react';
import {storiesOf} from '@storybook/react';
import './GridView.styl';

storiesOf('GridView', module)
  .add(
    'Default (layout: GridLayout)',
    () => render({layout: GridLayout})
  )
  .add(
    'layout: WaterfallLayout',
    () => render({layout: WaterfallLayout})
  )
  .add(
    'layout: GalleryLayout',
    () => render({layout: GalleryLayout, renderItem: (item) => renderItem(item, {variant: 'gallery'})})
  )
  .add(
    'animated layout switching',
    () => <LayoutSwitcher />
  )
  .add(
    'custom layout settings size small',
    () => render({
      layout: GridLayout,
      cardSize: 'S'
    })
  )
  .add(
    'allowsSelection: false',
    () => render({allowsSelection: false})
  )
  .add(
    'allowsMultipleSelection: false',
    () => render({allowsMultipleSelection: false})
  )
  .add(
    'canDragItems: true',
    () => render({canDragItems: true, quiet: true})
  )
  .add(
    'custom drag view',
    () => render({
      canDragItems: true,
      quiet: true,
      renderDragView: () => <div style={{background: 'red', color: 'white'}}>Drag view</div>
    })
  )
  .add(
    'with empty view',
    () => render({
      acceptsDrops: true,
      layout: GalleryLayout,
      dataSource: emptyDs,
      renderEmptyView: () => (
        <IllustratedMessage
          heading="No Items Found"
          description="Drop images here to add"
          illustration={
            <svg width="150" height="103" viewBox="0 0 150 103">
              <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z" />
            </svg>
          } />
      )
    })
  )
  .add(
    'acceptsDrops: true',
    () => render({acceptsDrops: true, layout: GalleryLayout, renderItem: (item) => renderItem(item, {variant: 'gallery'})}),
    {info: 'This example shows how GridView supports drag and drop between items.'}
  )
  .add(
    'dropPosition: "on"',
    () => render({acceptsDrops: true, dropPosition: 'on'}),
    {info: 'This example shows how GridView supports drag and drop over both items and the whole grid using dropPosition="on". In this example, "Active" rows can be dropped over, otherwise the drop goes to the entire table.'}
  )
  .add(
    'canReorderItems',
    () => render({canReorderItems: true, layout: GalleryLayout, renderItem: (item) => renderItem(item, {variant: 'gallery'})}),
    {info: 'This example shows how GridView supports reordering items.'}
  );

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

class TestDS extends ListDataSource {
  constructor(data = TEST_DATA) {
    super();
    this.data = data;
  }

  load() {
    return this.data;
  }

  // loadMore() {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve(this.data.slice());
  //     }, 2000);
  //   });
  // }

  itemsForDrop(dropTarget, dataTransfer) {
    let files = Array.from(dataTransfer.files);
    if (files.length > 0) {
      return files.map(file => ({url: URL.createObjectURL(file)}));
    }
  }

  async performDrop(dropTarget, dropOperation, items) {
    if (dropTarget.dropPosition === 'DROP_ON') {
      alert('Dropped on ' + this.data[dropTarget.indexPath.index].url.split('/').pop());
      return;
    }

    await Promise.all(items.map(item => (
      new Promise(resolve => {
        let img = new Image;
        img.onload = () => {
          item.width = img.naturalWidth;
          item.height = img.naturalHeight;
          resolve();
        };
        img.src = item.url;
      })
    )));

    super.performDrop(dropTarget, dropOperation, items);
  }

  getItemSize(item) {
    return {width: item.width, height: item.height};
  }
}

let emptyDs = new TestDS([]);
let ds = new TestDS;

function renderItem(item) {
  return (
    <Card>
      <CardPreview>
        <Asset type="image" src={item.url} />
      </CardPreview>
      <CardBody title={item.url.split('/').pop()} subtitle="Image" />
    </Card>
  );
}

function render(props = {}) {
  return (
    <GridView
      layout={GridLayout}
      dataSource={ds}
      renderItem={renderItem}
      onSelectionChange={action('selectionChange')}
      {...props} />
  );
}

class LayoutSwitcher extends React.Component {
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
        {render({layout: this.state.layout})}
      </div>
    );
  }
}
