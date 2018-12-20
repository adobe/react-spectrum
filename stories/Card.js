import {action, storiesOf} from '@storybook/react';
import {Asset} from '../src/Asset';
import {Card, CardBody, CardCoverPhoto, CardFooter, CardPreview} from '../src/Card';
import DropdownButton from '../src/DropdownButton/js/DropdownButton';
import {MenuItem} from '../src/Menu';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

importSpectrumCSS('card');

storiesOf('Card', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <div style={{'width': '208px'}}>
        <Card variant="standard">
          <CardCoverPhoto src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06370.jpg" />
          <CardBody title="Card Title" subtitle="jpg" />
        </Card>
      </div>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Selected',
    () => (
      <div style={{'width': '208px'}}>
        <Card selected variant="standard">
          <CardCoverPhoto src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06370.jpg" />
          <CardBody title="Card Title" subtitle="jpg" />
        </Card>
      </div>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Selection Disabled',
    () => (
      <div style={{'width': '208px'}}>
        <Card variant="standard" allowsSelection={false}>
          <CardCoverPhoto src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06370.jpg" />
          <CardBody title="Card Title" subtitle="jpg" />
        </Card>
      </div>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Explicit onSelectionChange',
    () => (
      <div style={{'width': '208px'}}>
        <Card variant="standard" onSelectionChange={action('onSelectionChange')}>
          <CardCoverPhoto src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06370.jpg" />
          <CardBody title="Card Title" subtitle="jpg" />
        </Card>
      </div>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Explicit onSelectionChange and onClick',
    () => (
      <div style={{'width': '208px'}}>
        <Card variant="standard" onSelectionChange={action('onSelectionChange')} onClick={action('onClick')}>
          <CardCoverPhoto src="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06370.jpg" />
          <CardBody title="Card Title" subtitle="jpg" />
        </Card>
      </div>
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  )
  .addWithInfo(
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
    ),
    {inline: true}
  );
