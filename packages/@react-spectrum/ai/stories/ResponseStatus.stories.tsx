/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import AlertTriangle from '@react-spectrum/s2/icons/AlertTriangle';
import {categorizeArgTypes, getActionArgs} from '../../s2/stories/utils';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import {Content} from '@react-spectrum/s2/Content';
import {InlineAlert} from '@react-spectrum/s2/InlineAlert';
import {Link} from '@react-spectrum/s2/Link';
import MagicWand from '@react-spectrum/s2/icons/MagicWand';
import type {Meta, StoryObj} from '@storybook/react';
import Plugin from '@react-spectrum/s2/icons/Plugin';
import PluginGear from '@react-spectrum/s2/icons/PluginGear';
import React from 'react';
import {
  ResponseStatus,
  ResponseStatusAction,
  ResponseStatusActionList,
  ResponseStatusPanel,
  ResponseStatusTitle
} from '@react-spectrum/ai';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import Tools from '@react-spectrum/s2/icons/Tools';

const events = ['onExpandedChange'];

const meta: Meta<typeof ResponseStatus> = {
  component: ResponseStatus,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', events),
    size: {
      control: 'radio',
      options: ['S', 'M', 'L', 'XL']
    },
    density: {
      control: 'radio',
      options: ['compact', 'regular', 'spacious']
    },
    isLoading: {
      control: {type: 'boolean'}
    },
    children: {table: {disable: true}}
  },
  args: {
    isLoading: true,
    ...getActionArgs(events)
  },
  title: 'AI/ResponseStatus'
};

export default meta;
type Story = StoryObj<typeof ResponseStatus>;

export const Example: Story = {
  render: args => (
    <div className={style({width: 320, minHeight: 240})}>
      <ResponseStatus {...args}>
        <ResponseStatusTitle>
          {args.isLoading ? 'Generating response' : 'Response generated'}
        </ResponseStatusTitle>
        <ResponseStatusPanel>
          Here is the generated response content. This area is hidden until the disclosure is
          expanded, and cannot be expanded while loading.
        </ResponseStatusPanel>
      </ResponseStatus>
    </div>
  )
};

export const WithActions: Story = {
  args: {
    defaultExpanded: true,
    isLoading: false,
    size: 'M'
  },
  render: args => (
    <div className={style({width: 800, minHeight: 240})}>
      <ResponseStatus {...args}>
        <ResponseStatusTitle>Used 6 tools</ResponseStatusTitle>
        <ResponseStatusPanel>
          <ResponseStatusActionList>
            <ResponseStatusAction
              icon={<MagicWand />}
              detail="The user wants to 'parse the data' with their existing audiences. This is a bit vague - they want to create a new audience based on/combining their existing audiences. Let me search for their existing audiences first to see what we have to work with, then we can brainstorm something creative.">
              Thought
            </ResponseStatusAction>
            <ResponseStatusAction
              icon={<Plugin />}
              detail={
                <div className={style({display: 'flex', flexDirection: 'column', gap: 12})}>
                  <div>
                    <span className={style({color: 'gray-600'})}>skill_name: </span>
                    <span className={style({font: 'code-sm'})}>operational-insights</span>
                  </div>
                  <div>
                    <div className={style({color: 'gray-600', marginBottom: 4})}>RESULT</div>
                    <div className={style({font: 'code-sm'})}>
                      Loaded skill: operational-insights
                    </div>
                  </div>
                </div>
              }>
              Loaded skill Operational Insights
            </ResponseStatusAction>
            <ResponseStatusAction icon={<Tools />}>
              Read file packages/@react-spectrum/ai/stories/ResponseStatus.stories.tsx
            </ResponseStatusAction>
            <ResponseStatusAction
              icon={<AlertTriangle />}
              detail={
                <div className={style({display: 'flex', flexDirection: 'column', gap: 12})}>
                  <div>
                    <span className={style({color: 'gray-600'})}>db_name: </span>
                    <span>hkg_db</span>
                  </div>
                  <div>
                    <div className={style({color: 'gray-600', marginBottom: 4})}>sql:</div>
                    <div className={style({font: 'code-sm', whiteSpace: 'pre-wrap'})}>
                      {'SELECT DISTINCT a.audienceId AS audience_id, a.name AS audience_name, CASE WHEN a.isEdge = true ' +
                        "THEN 'Edge' WHEN a.isStreaming = true THEN 'Streaming' WHEN a.isBatch = true THEN 'Batch' ELSE " +
                        "'Unknown' END AS evaluation_type, a.totalProfiles AS profile_count, ARRAY_AGG(DISTINCT d.name) A" +
                        'S activation_destinations FROM hkg_dim_audience a LEFT JOIN hkg_br_audience_destination ad ON a.' +
                        'audienceId = ad.audienceId LEFT JOIN hkg_dim_destination d ON ad.destinationId = d.destinationId' +
                        ' WHERE a.totalProfiles IS NOT NULL GROUP BY a.audienceId, a.name, a.isEdge, a.isStreaming, a.isBa' +
                        'tch, a.totalProfiles ORDER BY a.totalProfiles DESC LIMIT 10'}
                    </div>
                  </div>
                  <div>
                    <div className={style({color: 'gray-600', marginBottom: 4})}>RESULT</div>
                    <InlineAlert
                      variant="negative"
                      fillStyle="subtleFill"
                      styles={style({width: 'full'})}>
                      <Content>
                        It looks like this isn't available for your organization right now, so I
                        wasn't able to look that up for you. If you believe your organization should
                        have access, your Adobe account team can help get you set up.
                        <br />
                        <br />
                        <span className={style({font: 'code-sm'})}>
                          {'<system-reminder>\n' +
                            'The underlying response was HTTP 403 (access denied) — usually because the organization is not ' +
                            'entitled to this Adobe Experience Platform capability. Reply to the user with the message above ' +
                            'as your complete response for this turn and then stop. Do not show the status code or raw error ' +
                            'text, do not invent fixes such as refreshing the session or changing region or profile settings, and...'}
                        </span>
                      </Content>
                    </InlineAlert>
                  </div>
                </div>
              }>
              Attempted running SQL – Querying top 10 largest audiences.
            </ResponseStatusAction>

            <ResponseStatusAction icon={<PluginGear />}>
              Attempted to call list items tool
            </ResponseStatusAction>
            <ResponseStatusAction icon={<CheckmarkCircle />}>
              Searched the{' '}
              <Link variant="secondary" href="https://react-spectrum.adobe.com" target="_blank">
                React Spectrum
              </Link>{' '}
              docs
            </ResponseStatusAction>
          </ResponseStatusActionList>
          <div>
            This example has isOpen hard coded, so only the inner disclosures are collapsable
          </div>
        </ResponseStatusPanel>
      </ResponseStatus>
    </div>
  )
};
