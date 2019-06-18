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

// import Button from '../src/Button';
import Calendar from '../src/Calendar';
// import OverlayTrigger from '../src/OverlayTrigger';
// import Popover from '../src/Popover';
import Provider from '../src/Provider';
import React from 'react';
import {storiesOf} from '@storybook/react';

/*
const styles = {
  parent: {
    margin: 'auto', height: 300, width: 300, padding: 50, textAlign: 'center'
  },
  child: {
    height: 100, width: 100, margin: 50, padding: 50, textAlign: 'center'
  }
};
*/

storiesOf('Provider', module)
  .add(
    'theme:dark',
    () => render({theme: 'dark'})
  )
  .add(
    'locale:cs-CZ',
    () => render({theme: 'dark', locale: 'cs-CZ'})
  );/*
  .add(
    'nested providers',
    () => renderNested()
  );*/

function render(props = {}) {
  return (
    <Provider {...props} style={{padding: 50, textAlign: 'center'}}>
      <App />
    </Provider>
  );
}

/*
function renderNested() {
  return (
    <Provider theme="lightest" style={styles.parent}>
      <OverlayTrigger trigger="click">
        <Button label="Lightest" variant="primary" />
        <Popover>
            Inside lightest provider
        </Popover>
      </OverlayTrigger>
      <Provider theme="dark" style={styles.child}>
        <OverlayTrigger trigger="click">
          <Button label="Dark" variant="primary" />
          <Popover>
              Inside dark provider
          </Popover>
        </OverlayTrigger>
      </Provider>
    </Provider>
  );
}
*/

function App() {
  return (<div>
  I am part of app component and exists within my provider
    <br />
    <br />
    <Calendar />
  </div>);
}
