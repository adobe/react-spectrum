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

export type Scenario = 'research' | 'context' | 'assets' | 'interrupt' | 'recovery' | 'history';
type Status = 'pending' | 'success' | 'failed';

export interface ScenarioFile {
  id: string;
  name: string;
  mimeType: string;
  image: string;
}

export interface ScenarioSource {
  title: string;
  content: string;
}

export interface ScenarioAsset {
  id: string;
  name: string;
  orientation: 'landscape' | 'portrait';
  people: boolean;
  description: string;
}

export interface ScenarioStep {
  label: string;
  detail: string;
  status: Status;
}

export type ScenarioMessage =
  | {id: number; type: 'user'; text: string; files?: ScenarioFile[]; queued?: boolean}
  | {
      id: number;
      type: 'assistant';
      text: string;
      isStreaming?: boolean;
      stopped?: boolean;
      sources?: ScenarioSource[];
    }
  | {id: number; type: 'status'; text: string; steps: ScenarioStep[]; status: Status}
  | {id: number; type: 'alert'; text: string; retry?: boolean}
  | {id: number; type: 'assets'; text: string; assets: ScenarioAsset[]}
  | {id: number; type: 'suggestions'; text: string; suggestions: string[]};

interface ResponsePlan {
  steps: Omit<ScenarioStep, 'status'>[];
  text: string;
  sources?: ScenarioSource[];
  assets?: ScenarioAsset[];
  suggestions?: string[];
  failure?: string;
}

interface Request {
  text: string;
  files: ScenarioFile[];
  references: string[];
  retry?: boolean;
}

interface ActiveResponse {
  request: Request;
  plan: ResponsePlan;
  statusId: number;
  answerId?: number;
  step: number;
  words: number;
}

export interface ScenarioState {
  scenario: Scenario;
  messages: ScenarioMessage[];
  nextId: number;
  run: number;
  active: ActiveResponse | null;
  queue: Request[];
  files: ScenarioFile[];
  references: string[];
  failedRequest: Request | null;
  recovered: boolean;
  historyCursor: number;
}

export type ScenarioAction =
  | {type: 'send'; text: string; files?: ScenarioFile[]; references?: string[]; queue?: boolean}
  | {type: 'tick'; run: number}
  | {type: 'stop'}
  | {type: 'retry'}
  | {type: 'history'}
  | {type: 'reset'};

export const campaignSources: ScenarioSource[] = [
  {
    title: 'June channel report',
    content:
      'Demo report: May email conversions: 3,500. June email conversions: 4,200 (+20%). June social conversions: 3,100. Attribution window: seven days after click.'
  },
  {
    title: 'Campaign measurement notes',
    content:
      'Demo notes: All channels use the same seven-day click attribution window. The paid-search connector missed its final sync. Do not compare incomplete paid-search totals with finalized email and social totals.'
  }
];

export const campaignAssets: ScenarioAsset[] = [
  {
    id: 'coast',
    name: 'Coastal sunrise',
    orientation: 'landscape',
    people: false,
    description: 'Warm light, open space for a headline.'
  },
  {
    id: 'trail',
    name: 'Trail runners',
    orientation: 'landscape',
    people: true,
    description: 'Two runners on a wooded trail.'
  },
  {
    id: 'studio',
    name: 'Studio portrait',
    orientation: 'portrait',
    people: true,
    description: 'Close-up of the summer collection.'
  },
  {
    id: 'dunes',
    name: 'Quiet dunes',
    orientation: 'landscape',
    people: false,
    description: 'Neutral sand tones and a clear horizon.'
  }
];

export const scenarioDetails: Record<
  Scenario,
  {title: string; description: string; prompt: string; suggestions: string[]}
> = {
  research: {
    title: 'Research with sources',
    description:
      'Compare channel reports, inspect the supporting documents, and question a specific claim.',
    prompt: 'Compare our June campaign results with May.',
    suggestions: ['Where did the 20% increase come from?', 'Give me three takeaways']
  },
  context: {
    title: 'Bring your own context',
    description:
      'Add the sample brief and images, insert a campaign reference, then replace or remove attachments.',
    prompt: 'Use these files to recommend a campaign direction.',
    suggestions: ['Focus on the reference images', 'What context are you using?']
  },
  assets: {
    title: 'Find assets',
    description:
      'Find summer campaign assets, refine by orientation and people, and try a search with no matches.',
    prompt: 'Find assets for our summer campaign.',
    suggestions: [
      'Only landscape images, and no people',
      'Find winter assets',
      'Show all summer assets'
    ]
  },
  interrupt: {
    title: 'Interrupt and redirect',
    description:
      'Start the analysis, then send a new direction or stop it. Option/Alt+Enter queues a follow-up.',
    prompt: 'Give me a detailed launch analysis.',
    suggestions: ['Just give me the three main risks', 'What should we do first?']
  },
  recovery: {
    title: 'Failure recovery',
    description:
      'The paid-search connector fails on the first request. Inspect the failed step and retry.',
    prompt: 'Summarize results across all channels.',
    suggestions: ['Retry the paid-search report', 'What can we conclude without paid search?']
  },
  history: {
    title: 'Long conversation',
    description:
      'Load earlier campaign planning, expand rich content, and send a new message while reviewing history.',
    prompt: 'Remind me what we decided and what is still open.',
    suggestions: ['Which assets did we choose?', 'Give me three takeaways']
  }
};

const historyTurns = [
  [
    'We are launching a summer collection in six weeks. Where should we start?',
    'Start with the audience, the launch goal, and the assets you already have. What is the main outcome you want?'
  ],
  [
    'New customer purchases. Our budget is $15,000.',
    'Let us keep $3,000 in reserve and plan around a $12,000 initial spend. We can move the reserve once early results show which channel works.'
  ],
  [
    'Our audience is people buying their first pair of trail shoes.',
    'That calls for approachable creative: show an easy trail, explain fit, and avoid assuming the customer already knows technical running terms.'
  ],
  [
    'Can we use last month as a baseline?',
    'Yes. Email produced 3,500 conversions in May. We should compare June using the same attribution window, not mix click and view-through totals.'
  ],
  [
    'What changed in June?',
    'Email reached 4,200 conversions, up 20% from May. Social reached 3,100. Paid search is incomplete, so it should not be ranked yet.'
  ],
  [
    'Find images that feel welcoming rather than competitive.',
    'I found a coastal scene, a running group, a studio portrait, and dunes. We can narrow the set once we know the placement dimensions.'
  ],
  [
    'These are for website banners. No people, please.',
    'Coastal sunrise and Quiet dunes are the two landscape options without people. Both leave space for a headline.'
  ],
  [
    'Use Coastal sunrise for the main banner.',
    'Coastal sunrise is selected for the hero. Keep Quiet dunes as the alternate so we can compare warm color against a quieter neutral treatment.'
  ],
  [
    'The headline needs to be less serious.',
    'Try "Your next favorite trail starts here." It invites beginners without promising performance we have not substantiated.'
  ],
  [
    'What should email say?',
    'Lead with the same invitation, show the shoe clearly, and link to the fit guide. Keep one primary call to action: explore the summer collection.'
  ],
  [
    'What could go wrong?',
    'Three risks remain: the mobile landing page may be slow, the paid-search report is incomplete, and the asset usage rights still need review.'
  ],
  [
    'Can you make those into a checklist?',
    'Before launch:\n\n- Check mobile page speed and checkout.\n- Restore the paid-search connector.\n- Confirm image usage rights.\n\nAfter launch: review conversion rate daily before moving the reserve budget.'
  ],
  [
    'Who owns those tasks?',
    'Maya owns the landing page, Jordan owns reporting, and Priya owns asset rights. Those are demo assignments; confirm them with your team before treating them as commitments.'
  ],
  [
    'When should we make the final decision?',
    'Hold a review two days before launch. Bring the mobile results, a complete channel report, and confirmed rights for both shortlisted images.'
  ],
  [
    'What is still open?',
    'Paid-search reporting and asset rights are still open. The audience, budget reserve, hero candidate, and email direction are decided.'
  ]
];

export const conversationHistory: ScenarioMessage[] = historyTurns.flatMap(
  ([user, assistant], i) => [
    {id: i * 2 + 1, type: 'user', text: user},
    {
      id: i * 2 + 2,
      type: 'assistant',
      text: assistant,
      ...(i === 4 ? {sources: campaignSources} : {})
    }
  ]
);
conversationHistory.splice(14, 0, {
  id: 31,
  type: 'assets',
  text: 'Shortlisted banner assets',
  assets: campaignAssets.filter(asset => !asset.people && asset.orientation === 'landscape')
});
conversationHistory.splice(10, 0, {
  id: 32,
  type: 'status',
  text: 'Channel reports retrieved',
  status: 'success',
  steps: [
    {label: 'Read May report', detail: 'Email: 3,500 conversions.', status: 'success'},
    {
      label: 'Read June report',
      detail: 'Email: 4,200 conversions; social: 3,100.',
      status: 'success'
    }
  ]
});
conversationHistory.splice(25, 0, {
  id: 33,
  type: 'alert',
  text: 'Paid-search totals are incomplete. The remaining channel summaries are available.'
});

export function createScenarioState(scenario: Scenario): ScenarioState {
  let historyCursor = scenario === 'history' ? conversationHistory.length - 10 : 0;
  return {
    scenario,
    messages:
      scenario === 'history'
        ? conversationHistory.slice(historyCursor)
        : [
            {id: 1, type: 'user', text: 'I am working on the summer collection launch.'},
            {
              id: 2,
              type: 'assistant',
              text: 'We can use the June campaign and the summer asset library as our starting point. What would you like to work on?'
            },
            {
              id: 3,
              type: 'suggestions',
              text: 'Try a request',
              suggestions: [scenarioDetails[scenario].prompt]
            }
          ],
    nextId: 100,
    run: 0,
    active: null,
    queue: [],
    files: [],
    references: [],
    failedRequest: null,
    recovered: false,
    historyCursor
  };
}

function responsePlan(state: ScenarioState, request: Request): ResponsePlan {
  let text = request.text.toLowerCase();
  let steps = [
    {label: 'Reviewing conversation', detail: `Request: ${request.text}`},
    {
      label: 'Preparing response',
      detail: 'Using the local, scripted campaign fixtures. No network request is made.'
    }
  ];
  let suggestions = scenarioDetails[state.scenario].suggestions;
  switch (state.scenario) {
    case 'research':
      return {
        steps: [
          steps[0],
          {label: 'Reading channel reports', detail: campaignSources[0].content},
          steps[1]
        ],
        text: /where|20%|source|number/.test(text)
          ? 'The 20% increase compares email conversions in the two reports:\n\n(4,200 - 3,500) / 3,500 = 20%.\n\nThat is a relative increase in conversions, not a 20 percentage-point change in conversion rate. Both months use a seven-day click attribution window.'
          : /three|takeaway/.test(text)
            ? 'Three takeaways:\n\n- Email conversions grew 20%, from 3,500 to 4,200.\n- Social contributed 3,100 conversions in June.\n- Wait for the paid-search sync before ranking all channels.'
            : 'June email conversions reached 4,200, compared with 3,500 in May: a 20% increase.\n\nSocial contributed 3,100 conversions. Paid-search totals are incomplete, so I would not call email the best channel overall yet.\n\nThe source documents below contain the totals and measurement caveats.',
        sources: campaignSources,
        suggestions
      };
    case 'context': {
      let files = request.files.length ? request.files : state.files;
      let references = request.references.length ? request.references : state.references;
      let names = [...files.map(file => file.name), ...references].join(', ');
      return {
        steps: [
          steps[0],
          {label: 'Reviewing attached context', detail: names || 'No files attached yet.'}
        ],
        text:
          files.length || references.length
            ? /what context/.test(text)
              ? `The current context is: ${names}.\n\nYour request is: "${request.text}". This demo uses file names, object references, and fixture content, not real document or image analysis.`
              : /image|visual/.test(text)
                ? `Using ${names}, I would explore a warm, outdoor visual direction with open space for the headline.\n\nKeep the product easy to see, and compare a landscape hero against a closer detail image. This is a scripted recommendation, not an analysis of the uploaded pixels.`
                : `I am using ${names} for this mock campaign review.\n\nRecommended direction:\n\n- Lead with an approachable first-trail message.\n- Pair the campaign brief with the reference imagery.\n- Keep one clear call to action.\n\nAttach a replacement or additional file to update the context for your next request.`
            : 'Please attach a brief or reference image first. Use "Add sample context" to try the fixture, or attach your own files from the insert menu.',
        suggestions
      };
    }
    case 'assets': {
      let selected = campaignAssets.find(asset => text.includes(asset.name.toLowerCase()));
      if (selected) {
        return {
          steps,
          text: `${selected.name}: ${selected.description}\n\nOrientation: ${selected.orientation}. People: ${selected.people ? 'yes' : 'no'}.\n\nThis is a demo asset. Confirm usage rights before using it in a real campaign.`,
          suggestions
        };
      }
      let assets = /winter|snow|underwater/.test(text)
        ? []
        : campaignAssets.filter(
            asset =>
              (!/landscape/.test(text) || asset.orientation === 'landscape') &&
              (!/portrait/.test(text) || asset.orientation === 'portrait') &&
              (!/no people|without people/.test(text) || !asset.people)
          );
      return {
        steps: [
          steps[0],
          {label: 'Searching summer library', detail: `${assets.length} matching demo assets.`}
        ],
        text: assets.length
          ? `I found ${assets.length} matching assets in the summer library. The cards include orientation and people metadata so you can check the selection. Select an asset to discuss it.`
          : 'There are no matches for that combination in the demo summer library. Try removing a filter or showing all summer assets.',
        assets,
        suggestions
      };
    }
    case 'interrupt':
      return {
        steps,
        text: /risk|three/.test(text)
          ? 'The three main risks:\n\n- Mobile landing-page performance could reduce conversions.\n- Incomplete paid-search reporting could distort budget decisions.\n- Unconfirmed asset rights could delay launch.'
          : /first|next/.test(text)
            ? 'Start with the mobile landing-page check. Then restore the paid-search report and confirm the rights for the shortlisted images before moving the reserve budget.'
            : 'Here is a detailed launch analysis.\n\nAudience: focus on first-time trail-shoe buyers. They need reassurance about fit and an easy entry point, rather than highly technical performance claims.\n\nCreative: use welcoming landscapes with room for a short headline. Keep the product visible and the message consistent between the banner and email.\n\nBudget: start with $12,000 and hold $3,000 in reserve. Do not move the reserve until comparable channel reports and early conversion data are available.\n\nMeasurement: use the same seven-day attribution window across channels. Check mobile performance, the reporting connector, and image rights before the launch review.\n\nYou can stop this response, redirect me to the three risks, or queue a question about the first action.',
        suggestions
      };
    case 'recovery': {
      let partial = /without|partial/.test(text);
      let fails = !request.retry && !state.recovered && !partial;
      return {
        steps: [
          {
            label: 'Reading email and social reports',
            detail: 'Email: 4,200 conversions. Social: 3,100 conversions.'
          },
          ...(!partial
            ? [
                {
                  label: 'Connecting to paid search',
                  detail: fails
                    ? 'Demo connector timed out. Retry is available.'
                    : 'Demo connector restored: 2,600 conversions.'
                }
              ]
            : [])
        ],
        text:
          fails || partial
            ? 'I can summarize the available channels: email had 4,200 conversions and social had 3,100.\n\nPaid search is missing, so this is a partial report. We can discuss these two channels now or retry the connector.'
            : 'The retry succeeded. The complete June report is:\n\n- Email: 4,200 conversions.\n- Social: 3,100 conversions.\n- Paid search: 2,600 conversions.\n\nEmail leads on conversion count. This alone does not establish the best return on spend.',
        failure: fails
          ? 'Paid-search connector timed out. Your conversation and the partial results have been preserved.'
          : undefined,
        sources: [
          campaignSources[0],
          ...(!fails && !partial
            ? [
                {
                  title: 'Restored paid-search report',
                  content:
                    'Demo report: June paid-search conversions: 2,600. Seven-day click attribution window. Connector successfully synced on retry.'
                }
              ]
            : [])
        ],
        suggestions
      };
    }
    case 'history':
      return {
        steps,
        text: /asset|image/.test(text)
          ? 'We chose Coastal sunrise as the hero candidate and Quiet dunes as the alternate. Both are landscape images without people. Usage rights are still awaiting confirmation.'
          : 'Decided:\n\n- Target first-time trail-shoe buyers.\n- Start with $12,000 and keep $3,000 in reserve.\n- Use Coastal sunrise as the hero candidate.\n- Keep one primary email call to action.\n\nStill open: paid-search reporting and asset rights. The final review is two days before launch.',
        sources: campaignSources,
        suggestions
      };
  }
}

function beginResponse(state: ScenarioState, request: Request): ScenarioState {
  let plan = responsePlan(state, request);
  return {
    ...state,
    run: state.run + 1,
    files: request.files.length ? request.files : state.files,
    references: request.references.length ? request.references : state.references,
    nextId: state.nextId + 1,
    messages: [
      ...state.messages,
      {
        id: state.nextId,
        type: 'status',
        text: plan.steps[0].label,
        status: 'pending',
        steps: plan.steps.map(step => ({...step, status: 'pending'}))
      }
    ],
    active: {request, plan, statusId: state.nextId, step: 0, words: 0}
  };
}

function stopResponse(state: ScenarioState): ScenarioState {
  if (!state.active) {
    return state;
  }
  let {statusId, answerId} = state.active;
  return {
    ...state,
    run: state.run + 1,
    active: null,
    messages: state.messages.map(message => {
      if (message.id === statusId && message.type === 'status' && message.status === 'pending') {
        return {
          ...message,
          text: 'Stopped by you',
          status: 'failed',
          steps: message.steps.map(step =>
            step.status === 'pending'
              ? {...step, status: 'failed', detail: 'Cancelled by the user, not a tool error.'}
              : step
          )
        };
      }
      if (message.id === answerId && message.type === 'assistant') {
        return {...message, isStreaming: false, stopped: true};
      }
      return message;
    })
  };
}

export function scenarioReducer(state: ScenarioState, action: ScenarioAction): ScenarioState {
  switch (action.type) {
    case 'reset':
      return {...createScenarioState(state.scenario), run: state.run + 1};
    case 'history': {
      let cursor = Math.max(0, state.historyCursor - 8);
      return {
        ...state,
        historyCursor: cursor,
        messages: [...conversationHistory.slice(cursor, state.historyCursor), ...state.messages]
      };
    }
    case 'send': {
      let request: Request = {
        text: action.text,
        files: action.files || [],
        references: action.references || []
      };
      if (state.scenario === 'recovery' && /retry/i.test(action.text)) {
        request.retry = true;
      }
      if (state.active && action.queue) {
        return {
          ...state,
          nextId: state.nextId + 1,
          queue: [...state.queue, request],
          messages: [
            ...state.messages,
            {id: state.nextId, type: 'user', text: request.text, files: request.files, queued: true}
          ]
        };
      }
      state = stopResponse(state);
      state = {
        ...state,
        nextId: state.nextId + 1,
        messages: [
          ...state.messages,
          {id: state.nextId, type: 'user', text: request.text, files: request.files}
        ]
      };
      return beginResponse(state, request);
    }
    case 'stop': {
      state = stopResponse(state);
      return {
        ...state,
        queue: [],
        nextId: state.nextId + 1,
        messages: [
          ...state.messages.map(message =>
            message.type === 'user' && message.queued ? {...message, queued: false} : message
          ),
          {
            id: state.nextId,
            type: 'alert',
            text: 'Response stopped. Queued follow-ups were cancelled; send a new request when ready.'
          }
        ]
      };
    }
    case 'retry':
      return state.failedRequest && !state.active
        ? beginResponse({...state, failedRequest: null}, {...state.failedRequest, retry: true})
        : state;
    case 'tick': {
      let active = state.active;
      if (!active || action.run !== state.run) {
        return state;
      }
      let {plan, statusId} = active;
      if (active.answerId === undefined) {
        let step = active.step + 1;
        let done = step === plan.steps.length;
        let failed = done && !!plan.failure;
        let messages = state.messages.map(message =>
          message.id === statusId && message.type === 'status'
            ? {
                ...message,
                text: done
                  ? failed
                    ? 'One tool failed'
                    : `Completed ${plan.steps.length} steps`
                  : plan.steps[step].label,
                status: done
                  ? failed
                    ? ('failed' as const)
                    : ('success' as const)
                  : ('pending' as const),
                steps: message.steps.map((item, i) => ({
                  ...item,
                  status:
                    i < step
                      ? failed && i === step - 1
                        ? ('failed' as const)
                        : ('success' as const)
                      : ('pending' as const)
                }))
              }
            : message
        );
        return {
          ...state,
          messages: done
            ? [...messages, {id: state.nextId, type: 'assistant', text: '', isStreaming: true}]
            : messages,
          nextId: done ? state.nextId + 1 : state.nextId,
          active: {...active, step, ...(done ? {answerId: state.nextId} : {})}
        };
      }
      // Preserve paragraph boundaries while revealing deterministic five-word chunks.
      let tokens = plan.text.match(/\S+\s*/g) || [];
      let words = Math.min(tokens.length, active.words + 5);
      let done = words === tokens.length;
      let messages = state.messages.map(message =>
        message.id === active.answerId && message.type === 'assistant'
          ? {
              ...message,
              text: tokens.slice(0, words).join(''),
              isStreaming: !done,
              ...(done ? {sources: plan.sources} : {})
            }
          : message
      );
      if (!done) {
        return {...state, messages, active: {...active, words}};
      }
      let nextId = state.nextId;
      if (plan.failure) {
        messages.push({id: nextId++, type: 'alert', text: plan.failure, retry: true});
      }
      if (plan.assets?.length) {
        messages.push({id: nextId++, type: 'assets', text: 'Matching assets', assets: plan.assets});
      }
      if (plan.suggestions) {
        messages.push({
          id: nextId++,
          type: 'suggestions',
          text: 'Continue the conversation',
          suggestions: plan.suggestions
        });
      }
      state = {
        ...state,
        messages,
        nextId,
        active: null,
        failedRequest: plan.failure
          ? active.request
          : active.request.retry
            ? null
            : state.failedRequest,
        recovered: state.recovered || !!active.request.retry
      };
      if (state.queue.length) {
        let [request, ...queue] = state.queue;
        let queuedMessage = state.messages.find(
          message => message.type === 'user' && message.queued
        );
        return beginResponse(
          {
            ...state,
            queue,
            messages: state.messages.map(message =>
              message.id === queuedMessage?.id && message.type === 'user'
                ? {...message, queued: false}
                : message
            )
          },
          request
        );
      }
      return state;
    }
  }
}
