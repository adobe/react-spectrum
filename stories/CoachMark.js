import Button from '../src/Button';
import CoachMark from '../src/CoachMark';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('CoachMark', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'default',
    () => (<div>
      <Button id="something">target</Button>
      <CoachMark title="Default" selector="#something" confirmLabel="Confirm">
        This is a Default Coach Mark
      </CoachMark>
    </div>),
    {inline: true}
  )
  .addWithInfo(
    'dismissable',
    () => (<div>
      <Button id="something">target</Button>
      <CoachMark title="Default" selector="#something" confirmLabel="Confirm" dismissable>
        This is a Default Coach Mark
      </CoachMark>
    </div>),
    {inline: true}
  )
  .addWithInfo(
    'quiet',
    () => (<div>
      <Button id="something">target</Button>
      <CoachMark title="Default" selector="#something" confirmLabel="Confirm" quiet>
        This is a Default Coach Mark
      </CoachMark>
    </div>),
    {inline: true}
  )
  .addWithInfo(
    'steps',
    () => (<div>
      <Button id="something">target</Button>
      <CoachMark
        title="Default"
        selector="#something"
        currentStep={1}
        totalSteps={10}
        disableProgress={false}
        confirmLabel="Next"
        cancelLabel="Skip Tour">
        This is a Default Coach Mark
      </CoachMark>
    </div>),
    {inline: true}
  )
  .addWithInfo(
    'image',
    () => (<div>
      <Button id="something">target</Button>
      <CoachMark
        title="Default"
        selector="#something"
        confirmLabel="Confirm"
        image="https://git.corp.adobe.com/pages/govett/photos/photos/DSC06640.jpg">
        This is a Default Coach Mark
      </CoachMark>
    </div>),
    {inline: true}
  );
