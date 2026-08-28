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
import {
  AttachFileMenuItem,
  ExecutionTrace,
  ExecutionTraceItem,
  ExecutionTraceItemProps,
  InsertMenuButton,
  PromptField,
  PromptFieldSubmitButton,
  PromptFieldToolbar,
  PromptToken,
  PromptTokenField,
  ResponseStatus,
  ResponseStatusPanel,
  ResponseStatusTitle
} from '@react-spectrum/ai';
import {categorizeArgTypes, getActionArgs} from '../../s2/stories/utils';
import {Content} from '@react-spectrum/s2/Content';
import * as data from '../src/loader/data';
import {InlineAlert} from '@react-spectrum/s2/InlineAlert';
import MagicWand from '@react-spectrum/s2/icons/MagicWand';
import type {Meta, StoryObj} from '@storybook/react';
import Plugin from '@react-spectrum/s2/icons/Plugin';
import PluginGear from '@react-spectrum/s2/icons/PluginGear';
import React from 'react';
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
    status: {
      control: 'radio',
      options: ['pending', 'failed', 'success']
    },
    children: {table: {disable: true}}
  },
  args: {
    status: 'pending',
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
          {args.status === 'pending'
            ? 'Generating response'
            : args.status === 'success'
              ? 'Response generated'
              : 'Response failed'}
        </ResponseStatusTitle>
        <ResponseStatusPanel>
          Here is the generated response content. This area is hidden until the disclosure is
          expanded.
        </ResponseStatusPanel>
      </ResponseStatus>
    </div>
  )
};

export const NoResponseContent: Story = {
  render: args => (
    <div className={style({width: 320, minHeight: 240})}>
      <ResponseStatus {...args}>
        <ResponseStatusTitle>
          {args.status === 'pending'
            ? 'Generating response'
            : args.status === 'success'
              ? 'Response generated'
              : 'Response failed'}
        </ResponseStatusTitle>
      </ResponseStatus>
    </div>
  )
};

export const WithExecutionTrace: Story = {
  args: {
    defaultExpanded: false,
    status: 'success',
    static: false,
    parallelTasks: 1,
    showIcons: false
  } as any,
  argTypes: {
    pixelLoader: {
      control: 'select',
      options: Object.keys(data),
      description: 'Sets the icon to use for the pixel loader.'
    }
  } as any,
  parameters: {
    layout: 'fullscreen'
  },
  render: args => <WithExecutionTraceRender {...args} />
};

const executionTraceSteps: Array<Omit<ExecutionTraceItemProps, 'status'>> = [
  {
    // Rendered detail that doesn't offer user the option to collapse.
    detail:
      "The user wants to 'parse the data' with their existing audiences. This is a bit vague - they want to create a new audience based on/combining their existing audiences. Let me search for their existing audiences first to see what we have to work with, then we can brainstorm something creative.",
    icon: <MagicWand />,
    // isAlwaysOpen: true,
    children: 'Thought'
  },
  {
    // Custom icon and text, complex detail content.
    detail: (
      <div className={style({display: 'flex', flexDirection: 'column', gap: 12})}>
        <div>
          <span className={style({color: 'gray-600'})}>skill_name: </span>
          <span className={style({font: 'code-xs'})}>operational-insights</span>
        </div>
        <div>
          <div className={style({color: 'gray-600', marginBottom: 4})}>RESULT</div>
          <div className={style({font: 'code-xs'})}>Loaded skill: operational-insights</div>
        </div>
      </div>
    ),
    icon: <Plugin />,
    children: 'Loaded skill Operational Insights'
  },
  {
    // No icon, text only (default icon renders).
    children: 'Read file packages/@react-spectrum/ai/stories/ResponseStatus.stories.tsx'
  },
  {
    // Custom icon and text, complex detail content and error.
    detail: (
      <div className={style({display: 'flex', flexDirection: 'column', gap: 12})}>
        <div>
          <span className={style({color: 'gray-600'})}>db_name: </span>
          <span>hkg_db</span>
        </div>
        <div>
          <div className={style({color: 'gray-600', marginBottom: 4})}>sql:</div>
          <div className={style({font: 'code-xs', whiteSpace: 'pre-wrap'})}>
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
          <InlineAlert variant="negative" fillStyle="subtleFill" styles={style({width: 'full'})}>
            <Content>
              It looks like this isn't available for your organization right now, so I wasn't able
              to look that up for you. If you believe your organization should have access, your
              Adobe account team can help get you set up.
              <br />
              <br />
              <span className={style({font: 'code-xs'})}>
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
    ),
    icon: <AlertTriangle />,
    children: 'Attempted running SQL – Querying top 10 largest audiences.'
  },
  {
    // Custom icon and text, no detail.
    icon: <PluginGear />,
    children: 'Attempted to call list items tool'
  },
  {
    icon: <Tools />,
    children: 'Searched the React Spectrum docs'
  }
];

function WithExecutionTraceRender(args) {
  let [visibleCountState, setVisibleCount] = React.useState(1);
  let status = args.status;
  if (!args.static && status === 'pending' && visibleCountState > executionTraceSteps.length) {
    status = 'success';
  }
  let isStreaming = status === 'pending';
  let visibleCount = isStreaming && !args.static ? visibleCountState : executionTraceSteps.length;

  React.useEffect(() => {
    if (args.static) {
      return;
    }
    let timers = [...executionTraceSteps, null].map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), i * 2000 + Math.random() * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, [args.static, args.status]);

  return (
    <div
      className={style({
        maxWidth: 800,
        minHeight: 240,
        marginX: 'auto',
        paddingY: 40,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        boxSizing: 'border-box'
      })}>
      <ResponseStatus {...args} status={status}>
        <ResponseStatusTitle pixelLoader={data[args.pixelLoader]}>
          {isStreaming
            ? executionTraceSteps[Math.min(visibleCount, executionTraceSteps.length - 1)].children
            : status === 'success'
              ? 'Loaded skill, ran SQL query, and 3 more steps'
              : 'Response failed'}
        </ResponseStatusTitle>
        <ResponseStatusPanel>
          <ExecutionTrace>
            {executionTraceSteps.slice(0, visibleCount).map((step, i) => {
              let isLast = i >= visibleCount - args.parallelTasks;
              return (
                <ExecutionTraceItem
                  key={i}
                  {...step}
                  icon={args.showIcons ? step.icon : null}
                  status={isLast ? status : 'success'}>
                  {step.children}
                </ExecutionTraceItem>
              );
            })}
          </ExecutionTrace>
        </ResponseStatusPanel>
      </ResponseStatus>
      <p className={style({font: 'body', flexGrow: 1})}>This is an example response.</p>
      <PromptField isGenerating={isStreaming}>
        <PromptTokenField pixelLoader={data[args.pixelLoader]}>
          {token => <PromptToken token={token}>{token.text}</PromptToken>}
        </PromptTokenField>
        <PromptFieldToolbar>
          <InsertMenuButton>
            <AttachFileMenuItem />
          </InsertMenuButton>
          <PromptFieldSubmitButton />
        </PromptFieldToolbar>
      </PromptField>
    </div>
  );
}
