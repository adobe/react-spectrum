import React from 'react';
import {storiesOf} from '@storybook/react';
import {Table, TBody, TD, TH, THead, TR} from '../src/Table';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Table', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'quiet: true',
    () => render({quiet: true}),
    {inline: true}
  )
  .addWithInfo(
    'with dividers',
    () => render({divider: true}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Table {...props}>
      <THead>
        <TH>Pet Name</TH>
        <TH>Type</TH>
        <TH>Good/Bad</TH>
      </THead>
      <TBody>
        <TR>
          <TD>Mongo</TD>
          <TD divider={props.divider}>Chihuahua</TD>
          <TD>Bad</TD>
        </TR>
        <TR>
          <TD>Tiny</TD>
          <TD divider={props.divider}>Great Dane</TD>
          <TD>Bad</TD>
        </TR>
        <TR>
          <TD>Jaws</TD>
          <TD divider={props.divider}>Pit Bull</TD>
          <TD>Good</TD>
        </TR>
      </TBody>
    </Table>
  );
}
