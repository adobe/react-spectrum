import Heading from '../src/Heading';
import Popover from '../src/Popover';
import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Popover', module)
  .addDecorator(story => (
    <VerticalCenter
      className="popover-story"
      style={{
        textAlign: 'left',
        margin: '0 100px 50px',
        position: 'static',
        transform: 'none'
      }}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render('Content'),
    {inline: true}
  )
  .addWithInfo(
    'Long content, placement: right top',
    () => render(longMarkup, {placement: 'right top'}),
    {inline: true}
  )
  .addWithInfo(
    'open: false',
    () => render('Content', {open: false}),
    {inline: true}
  )
  .addWithInfo(
    'variant: error',
    () => render('Content', {variant: 'error'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: warning',
    () => render('Content', {variant: 'warning'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: success',
    () => render('Content', {variant: 'success'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: help',
    () => render('Content', {variant: 'help'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: info',
    () => render('Content', {variant: 'info'}),
    {inline: true}
  )
  .addWithInfo(
    'placement: top',
    () => render('Content', {placement: 'top'}),
    {inline: true}
  )
  .addWithInfo(
    'placement: bottom',
    () => render('Content', {placement: 'bottom'}),
    {inline: true}
  )
  .addWithInfo(
    'placement: left',
    () => render('Content', {placement: 'left'}),
    {inline: true}
  )
  .addWithInfo(
    'placement: right',
    () => render('Content', {placement: 'right'}),
    {inline: true}
  )
  .addWithInfo(
    'no title',
    () => render('Content', {title: null}),
    {inline: true}
  );

function render(content, props = {}) {
  return (
    <Popover
      title="Title"
      open
      {...props}>
      {content}
    </Popover>
  );
}

const longMarkup = (
  <div>
    <Heading size={2}>Really long content...</Heading>
    <p>
      Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor
      quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean
      ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
      Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt
      condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar
      facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna
      eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus
    </p>
    <p>
      Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor
      quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean
      ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
      Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt
      condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar
      facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna
      eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus
    </p>
    <p>
      Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor
      quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean
      ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
      Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt
      condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar
      facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna
      eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus
    </p>
  </div>
);
