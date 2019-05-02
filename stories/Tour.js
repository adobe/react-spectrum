import {action, storiesOf} from '@storybook/react';
import Button from '../src/Button';
import CoachMark from '../src/CoachMark';
import React from 'react';
import Tour from '../src/Tour';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Tour', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'default',
    () => (<div style={{position: 'relative'}}><div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>

        <Button id="stepOne">Step One</Button>

        <Button id="stepTwo">Step Two</Button>

        <Button id="stepThree">Step Three</Button>
      </div>

      <Tour>
        <CoachMark title="Step 1" selector="#stepOne" confirmLabel="Next" cancelLabel="Skip">
          This is step 1
        </CoachMark>

        <CoachMark title="Step 2" selector="#stepTwo" placement="bottom" confirmLabel="Next" cancelLabel="Skip">
          This is step 2
        </CoachMark>

        <CoachMark title="Step 3" selector="#stepThree" placement="right top" confirmLabel="Done">
          You did it!
        </CoachMark>
      </Tour>
    </div></div>),
    {inline: true}
  )
  .addWithInfo(
    'Disable progress',
    () => (<div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>

        <Button id="stepOne">Step One</Button>

        <Button id="stepTwo">Step Two</Button>

        <Button id="stepThree" onClick={action('button clicked')}>Step Three</Button>

        <Tour disableProgress>
          <CoachMark title="Step 1" selector="#stepOne" confirmLabel="Next" cancelLabel="Skip">
            This is step 1
          </CoachMark>

          <CoachMark title="Step 2" selector="#stepTwo" confirmLabel="Next" cancelLabel="Skip">
            This is step 2
          </CoachMark>

          <CoachMark title="Step 3" selector="#stepThree" confirmLabel="Done">
            You did it!
          </CoachMark>
        </Tour>
      </div>
    </div>),
    {inline: true}
  )
  .addWithInfo(
    'clickOutsideAction: skip',
    () => (<div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>

        <Button id="stepOne">Step One</Button>

        <Button id="stepTwo">Step Two</Button>

        <Button id="stepThree">Step Three</Button>

        <Tour clickOutsideAction="skip">
          <CoachMark title="Step 1" selector="#stepOne" confirmLabel="Next" cancelLabel="Skip">
            This is step 1
          </CoachMark>

          <CoachMark title="Step 2" selector="#stepTwo" confirmLabel="Next" cancelLabel="Skip">
            This is step 2
          </CoachMark>

          <CoachMark title="Step 3" selector="#stepThree" confirmLabel="Done">
            You did it!
          </CoachMark>
        </Tour>
      </div>
    </div>),
    {inline: true}
  )
  .addWithInfo(
    'clickOutsideAction: next',
    () => (<div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>

        <Button id="stepOne">Step One</Button>

        <Button id="stepTwo">Step Two</Button>

        <Button id="stepThree">Step Three</Button>

        <Tour clickOutsideAction="next">
          <CoachMark title="Step 1" selector="#stepOne" confirmLabel="Next" cancelLabel="Skip">
            This is step 1
          </CoachMark>

          <CoachMark title="Step 2" selector="#stepTwo" confirmLabel="Next" cancelLabel="Skip">
            This is step 2
          </CoachMark>

          <CoachMark title="Step 3" selector="#stepThree" confirmLabel="Done">
            You did it!
          </CoachMark>
        </Tour>
      </div>
    </div>),
    {inline: true}
  );
