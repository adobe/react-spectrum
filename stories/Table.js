import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { VerticalCenter } from '../.storybook/layout';

import Table from '../src/Table';
import THead from '../src/Table/js/THead';
import TBody from '../src/Table/js/TBody';
import TR from '../src/Table/js/TR';
import TH from '../src/Table/js/TH';
import TD from '../src/Table/js/TD';

storiesOf('Table', module)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none' } }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    { inline: true }
  )
  .addWithInfo(
    'hover: true',
    () => render({ hover: true }),
    { inline: true }
  )
  .addWithInfo(
    'bordered: true',
    () => render({ bordered: true }),
    { inline: true }
  );

function render(props = {}) {
  return (
    <Table { ...props }>
      <THead>
        <TR>
          <TH>Pet Name</TH>
          <TH>Type</TH>
          <TH>Good/Bad</TH>
        </TR>
      </THead>
      <TBody>
        <TR>
          <TD>Mongo</TD>
          <TD>Chihuahua</TD>
          <TD>Bad</TD>
        </TR>
        <TR>
          <TD>Tiny</TD>
          <TD>Great Dane</TD>
          <TD>Bad</TD>
        </TR>
        <TR>
          <TD>Jaws</TD>
          <TD>Pit Bull</TD>
          <TD>Good</TD>
        </TR>
      </TBody>
    </Table>
  );
}
