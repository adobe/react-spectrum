import {action, storiesOf} from '@storybook/react';
import Pagination from '../src/Pagination';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Pagination', module)
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
    'button:cta',
    () => render({variant: 'button', mode: 'cta'}),
    {inline: true}
  )
  .addWithInfo(
    'button:secondary',
    () => render({variant: 'button', mode: 'secondary'}),
    {inline: true}
  )
  .addWithInfo(
    'explicit',
    () => render({variant: 'explicit', totalPages: 50, onChange: action('onChange')}),
    {inline: true}
  )
  .addWithInfo(
    'controlled',
    () => render({variant: 'explicit', totalPages: 50, currentPage: 2, onChange: action('onChange')}),
    {inline: true}
  );

function render(props = {}) {
  return (<Pagination {...props} onPrevious={action('onPrevious')} onNext={action('onNext')} />);
}
