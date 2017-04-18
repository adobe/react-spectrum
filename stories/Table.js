import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import {Table, THead, TBody, TR, TH, TD} from '../src/Table';

storiesOf('Table', module)
  .addDecorator(story => (
    <VerticalCenter style={ {textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'} }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'hover: true',
    () => render({hover: true}),
    {inline: true}
  )
  .addWithInfo(
    'bordered: true',
    () => render({bordered: true}),
    {inline: true}
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
