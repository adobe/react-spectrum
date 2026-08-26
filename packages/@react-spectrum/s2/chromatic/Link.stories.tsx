/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {Link} from '../src/Link';
import type {Meta, StoryObj} from '@storybook/react';
import {StaticColorProvider} from '../stories/utils';
import {StaticMatrix, StaticMatrixCell} from './utils';

const meta: Meta<typeof Link> = {
  component: Link,
  parameters: {chromaticProvider: {disableAnimations: true}},
  title: 'S2 Chromatic/Link'
};

export default meta;
type Story = StoryObj<typeof Link>;

export const StaticOptions: Story = {
  render: () => (
    <StaticMatrix minColumnWidth={260}>
      {(['primary', 'secondary'] as const).flatMap(variant =>
        [false, true].flatMap(isQuiet =>
          [false, true].map(isStandalone => (
            <StaticMatrixCell
              key={`${variant}-${isQuiet}-${isStandalone}`}
              label={`${variant} ${isQuiet ? 'quiet' : 'default'} ${isStandalone ? 'standalone' : 'inline'}`}>
              {isStandalone ? (
                <Link href="https://example.com" variant={variant} isQuiet={isQuiet} isStandalone>
                  Project documentation
                </Link>
              ) : (
                <p>
                  Read the{' '}
                  <Link href="https://example.com" variant={variant} isQuiet={isQuiet}>
                    project documentation
                  </Link>{' '}
                  before continuing.
                </p>
              )}
            </StaticMatrixCell>
          ))
        )
      )}
      {(['black', 'white', 'auto'] as const).map(staticColor => (
        <StaticMatrixCell key={staticColor} label={`static ${staticColor}`}>
          <StaticColorProvider staticColor={staticColor} hideColorPicker>
            <Link href="https://example.com" staticColor={staticColor} isStandalone>
              Project documentation
            </Link>
          </StaticColorProvider>
        </StaticMatrixCell>
      ))}
    </StaticMatrix>
  )
};
