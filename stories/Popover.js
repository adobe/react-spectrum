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

import Heading from '../src/Heading';
import Popover from '../src/Popover';
import React from 'react';
import {storiesOf} from '@storybook/react';
import './Popover.styl';

const info = 'Note: `trapFocus` has been overridden in these examples so the Popover will not create a focus trap when rendered inline.';

storiesOf('Popover', module)
  .addDecorator(story => (
    <div className="popover-story">
      {story()}
    </div>
  ))
  .add(
    'Default',
    () => render('Content'),
    {info}
  )
  .add(
    'Long content, placement: right top',
    () => render(longMarkup, {placement: 'right top'}),
    {info}
  )
  .add(
    'open: false',
    () => render('Content', {open: false})
  )
  .add(
    'variant: error',
    () => render('Content', {variant: 'error'}),
    {info}
  )
  .add(
    'placement: top',
    () => render('Content', {placement: 'top'}),
    {info}
  )
  .add(
    'placement: bottom',
    () => render('Content', {placement: 'bottom'}),
    {info}
  )
  .add(
    'placement: left',
    () => render('Content', {placement: 'left'}),
    {info}
  )
  .add(
    'placement: right',
    () => render('Content', {placement: 'right'}),
    {info}
  )
  .add(
    'no title',
    () => render('Content', {title: null}),
    {info}
  );

function render(content, props = {}) {
  if (props.open !== false) {
    props.trapFocus = false;
  }
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
