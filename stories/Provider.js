// import Button from '../src/Button';
import Calendar from '../src/Calendar';
// import OverlayTrigger from '../src/OverlayTrigger';
// import Popover from '../src/Popover';
import Provider from '../src/Provider';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

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
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'theme:dark',
    () => render({theme: 'dark'}),
    {inline: true}
  )
  .addWithInfo(
    'locale:cs-CZ',
    () => render({theme: 'dark', locale: 'cs-CZ'}),
    {inline: true}
  );/*
  .addWithInfo(
    'nested providers',
    () => renderNested(),
    {inline: true}
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
