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
import Button from '../src/Button';
import CoachMark from '../src/CoachMark';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Tour from '../src/Tour';

storiesOf('Tour', module)
  .add(
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

      <Tour
        onTourEnd={(status) => {
          switch (status) {
            case 'cancel':
              document.body.focus();
              break;
            default:
              document.querySelector('#stepOne').focus();
              break;
          }
        }}>
        <CoachMark title="Step 1" selector="#stepOne" confirmLabel="Next" cancelLabel="Skip" autoFocus>
          This is step 1
        </CoachMark>

        <CoachMark title="Step 2" selector="#stepTwo" placement="bottom" confirmLabel="Next" cancelLabel="Skip" autoFocus>
          This is step 2
        </CoachMark>

        <CoachMark title="Step 3" selector="#stepThree" placement="right top" confirmLabel="Done" autoFocus>
          You did it!
        </CoachMark>
      </Tour>
    </div></div>)
  )
  .add(
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

        <Tour
          disableProgress
          onTourEnd={(status) => {
            switch (status) {
              case 'cancel':
                document.body.focus();
                break;
              default:
                document.querySelector('#stepOne').focus();
                break;
            }
          }}>
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
    </div>)
  )
  .add(
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

        <Tour
          clickOutsideAction="skip"
          onTourEnd={(status) => {
            switch (status) {
              case 'cancel':
                document.body.focus();
                break;
              default:
                document.querySelector('#stepOne').focus();
                break;
            }
          }}>
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
    </div>)
  )
  .add(
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

        <Tour
          clickOutsideAction="next"
          onTourEnd={(status) => {
            switch (status) {
              case 'cancel':
                document.body.focus();
                break;
              default:
                document.querySelector('#stepOne').focus();
                break;
            }
          }}>
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
    </div>)
  );
