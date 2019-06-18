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
import {Card, CardBody, CardCoverPhoto, CardFooter, CardPreview} from '../src/Card';
import DropdownButton from '../src/DropdownButton/js/DropdownButton';
import {MenuItem} from '../src/Menu';
import React from 'react';
import {storiesOf} from '@storybook/react';

importSpectrumCSS('card');

storiesOf('Card', module)
  .add(
    'Default',
    () => (
      <div style={{'width': '208px'}}>
        <Card variant="standard">
          <CardCoverPhoto src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06370.jpg" />
          <CardBody title="Card Title" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Selected',
    () => (
      <div style={{'width': '208px'}}>
        <Card selected variant="standard">
          <CardCoverPhoto src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06370.jpg" />
          <CardBody title="Card Title" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Selection Disabled',
    () => (
      <div style={{'width': '208px'}}>
        <Card variant="standard" allowsSelection={false}>
          <CardCoverPhoto src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06370.jpg" />
          <CardBody title="Card Title" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Explicit onSelectionChange',
    () => (
      <div style={{'width': '208px'}}>
        <Card variant="standard" onSelectionChange={action('onSelectionChange')}>
          <CardCoverPhoto src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06370.jpg" />
          <CardBody title="Card Title" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Explicit onSelectionChange and onClick',
    () => (
      <div style={{'width': '208px'}}>
        <Card variant="standard" onSelectionChange={action('onSelectionChange')} onClick={action('onClick')}>
          <CardCoverPhoto src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06370.jpg" />
          <CardBody title="Card Title" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Footer',
    () => (
      <div style={{'width': '208px'}}>
        <Card variant="standard">
          <CardCoverPhoto src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06370.jpg" />
          <CardBody title="Card Title" subtitle="jpg" />
          <CardFooter>
            Footer
          </CardFooter>
        </Card>
      </div>
    )
  )
  .add(
    'Asset Preview',
    () => (
      <div style={{'width': '208px'}}>
        <Card variant="standard">
          <CardPreview>
            <Asset type="image" src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06369.jpg" />
          </CardPreview>
          <CardBody title="Card Title" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Asset Preview with image cache',
    () => (
      <div style={{'width': '208px'}}>
        <Card variant="standard">
          <CardPreview>
            <Asset type="image" src="https://i.imgur.com/L7zGzu9.jpg" cache />
          </CardPreview>
          <CardBody title="Card Title" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Action button',
    () => (
      <div style={{'width': '208px'}}>
        <Card
          variant="standard"
          actionMenu={
            <DropdownButton>
              <MenuItem>Foo</MenuItem>
              <MenuItem>Bar</MenuItem>
              <MenuItem>Baz</MenuItem>
            </DropdownButton>
          }>
          <CardCoverPhoto src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06370.jpg" />
          <CardBody title="Card Title" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Quiet - Default',
    () => (
      <div style={{'width': '208px', 'height': '264px'}}>
        <Card variant="quiet">
          <CardPreview>
            <Asset type="image" src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC04666.jpg" />
          </CardPreview>
          <CardBody title="Waterfall" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Quiet - Description',
    () => (
      <div style={{'width': '208px', 'height': '264px'}}>
        <Card variant="quiet">
          <CardPreview>
            <Asset type="image" src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC04666.jpg" />
          </CardPreview>
          <CardBody title="Waterfall" subtitle="jpg" description="10/15/18" />
        </Card>
      </div>
    )
  )
  .add(
    'Quiet - Selected',
    () => (
      <div style={{'width': '208px', 'height': '264px'}}>
        <Card selected variant="quiet">
          <CardPreview>
            <Asset type="image" src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC04666.jpg" />
          </CardPreview>
          <CardBody title="Waterfall" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Quiet - Small',
    () => (
      <div style={{'width': '112px', 'height': '136px'}}>
        <Card variant="quiet" size="S">
          <CardPreview>
            <Asset type="image" src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC04666.jpg" />
          </CardPreview>
          <CardBody title="Waterfall" subtitle="folder" />
        </Card>
      </div>
    )
  )
  .add(
    'Quiet - Folder',
    () => (
      <div style={{'width': '208px', 'height': '264px'}}>
        <Card variant="quiet">
          <CardPreview>
            <Asset type="folder" />
          </CardPreview>
          <CardBody title="Folder Name" subtitle="folder" />
        </Card>
      </div>
    )
  )
  .add(
    'Quiet - File',
    () => (
      <div style={{'width': '208px', 'height': '264px'}}>
        <Card variant="quiet">
          <CardPreview>
            <Asset type="file" />
          </CardPreview>
          <CardBody title="File Name" subtitle="pdf" />
        </Card>
      </div>
    )
  )
  .add(
    'Quiet - Action Button',
    () => (
      <div style={{'width': '208px', 'height': '264px'}}>
        <Card
          variant="quiet"
          actionMenu={
            <DropdownButton>
              <MenuItem>Foo</MenuItem>
              <MenuItem>Bar</MenuItem>
              <MenuItem>Baz</MenuItem>
            </DropdownButton>
          }>
          <CardPreview>
            <Asset type="image" src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC04666.jpg" />
          </CardPreview>
          <CardBody title="Name" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Quiet - Small, Action Button',
    () => (
      <div style={{'width': '112px', 'height': '136px'}}>
        <Card
          variant="quiet"
          size="S"
          actionMenu={
            <DropdownButton>
              <MenuItem>Foo</MenuItem>
              <MenuItem>Bar</MenuItem>
              <MenuItem>Baz</MenuItem>
            </DropdownButton>
          }>
          <CardPreview>
            <Asset type="image" src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC04666.jpg" />
          </CardPreview>
          <CardBody title="Name" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Gallery - Default',
    () => (
      <div style={{'width': '532px', 'height': '224px'}}>
        <Card variant="gallery">
          <CardPreview>
            <Asset type="image" src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC01822-Pano.jpeg" />
          </CardPreview>
          <CardBody title="Name" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Gallery - Description',
    () => (
      <div style={{'width': '532px', 'height': '224px'}}>
        <Card variant="gallery">
          <CardPreview>
            <Asset type="image" src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC01822-Pano.jpeg" />
          </CardPreview>
          <CardBody title="Name" subtitle="jpg" description="10/15/18" />
        </Card>
      </div>
    )
  )
  .add(
    'Gallery - Selected',
    () => (
      <div style={{'width': '532px', 'height': '224px'}}>
        <Card selected variant="gallery">
          <CardPreview>
            <Asset type="image" src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC01822-Pano.jpeg" />
          </CardPreview>
          <CardBody title="Waterfall" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Gallery - Small',
    () => (
      <div style={{'width': '252px', 'height': '108px'}}>
        <Card variant="gallery" size="S">
          <CardPreview>
            <Asset type="image" src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC01822-Pano.jpeg" />
          </CardPreview>
          <CardBody title="Waterfall" subtitle="folder" />
        </Card>
      </div>
    )
  )
  .add(
    'Gallery - Action Button',
    () => (
      <div style={{'width': '532px', 'height': '224px'}}>
        <Card
          variant="gallery"
          actionMenu={
            <DropdownButton>
              <MenuItem>Foo</MenuItem>
              <MenuItem>Bar</MenuItem>
              <MenuItem>Baz</MenuItem>
            </DropdownButton>
          }>
          <CardPreview>
            <Asset type="image" src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC01822-Pano.jpeg" />
          </CardPreview>
          <CardBody title="Name" subtitle="jpg" />
        </Card>
      </div>
    )
  )
  .add(
    'Gallery - Small, Action Button',
    () => (
      <div style={{'width': '252px', 'height': '112px'}}>
        <Card
          variant="gallery"
          size="S"
          actionMenu={
            <DropdownButton>
              <MenuItem>Foo</MenuItem>
              <MenuItem>Bar</MenuItem>
              <MenuItem>Baz</MenuItem>
            </DropdownButton>
          }>
          <CardPreview>
            <Asset type="image" src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC01822-Pano.jpeg" />
          </CardPreview>
          <CardBody title="Name" subtitle="jpg" />
        </Card>
      </div>
    )
  );
