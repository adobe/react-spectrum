import Button from '../src/Button';
import CoachMark from '../src/CoachMark';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('CoachMark', module)
  .add(
    'default',
    () => (<div>
      <Button id="something">target</Button>
      <CoachMark title="Default" selector="#something" confirmLabel="Confirm">
        This is a Default Coach Mark
      </CoachMark>
    </div>)
  )
  .add(
    'dismissible',
    () => (<div>
      <Button id="something">target</Button>
      <CoachMark title="Default" selector="#something" confirmLabel="Confirm" dismissible>
        This is a Default Coach Mark
      </CoachMark>
    </div>)
  )
  .add(
    'quiet',
    () => (<div>
      <Button id="something">target</Button>
      <CoachMark title="Default" selector="#something" confirmLabel="Confirm" quiet>
        This is a Default Coach Mark
      </CoachMark>
    </div>)
  )
  .add(
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
    </div>)
  )
  .add(
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
    </div>)
  );
