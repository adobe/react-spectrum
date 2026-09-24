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

import {act, render, waitFor} from '@react-spectrum/test-utils-internal';
import {installRangePolyfill} from './utils/promptFieldTestUtils';
import {
  PromptField,
  PromptFieldSubmitButton,
  PromptFieldToolbar,
  PromptFieldValue,
  PromptFieldVoiceButton,
  PromptTokenField
} from '../src/PromptField';
import React, {useEffect, useState} from 'react';
import userEvent from '@testing-library/user-event';

// Suite requires React 19 (matches the rest of the PromptField suite).
const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;

/**
 * Minimal fake of the Web Speech API's SpeechRecognition, matching the shape declared in
 * ../src/speech-recognition.d.ts. `start`/`stop` are synchronous no-ops here — tests
 * manually invoke the `on*` handlers to control the timing that matters (in particular,
 * the async gap between `stop()` being requested and the browser's `onend` actually firing).
 */
class MockSpeechRecognition extends EventTarget implements SpeechRecognition {
  lang = '';
  continuous = false;
  interimResults = false;
  maxAlternatives = 1;
  onaudiostart = null;
  onsoundstart = null;
  onspeechstart = null;
  onspeechend = null;
  onsoundend = null;
  onaudioend = null;
  onresult: SpeechRecognition['onresult'] = null;
  onnomatch = null;
  onerror: SpeechRecognition['onerror'] = null;
  onstart: SpeechRecognition['onstart'] = null;
  onend: SpeechRecognition['onend'] = null;

  start = jest.fn(() => {
    this.onstart?.call(this, new Event('start'));
  });
  stop = jest.fn();
  abort = jest.fn();
}

let instances: MockSpeechRecognition[] = [];

function makeResultEvent(text: string, isFinal = true): SpeechRecognitionEvent {
  let result: any = [{transcript: text}];
  result.isFinal = isFinal;
  return {resultIndex: 0, results: [result]} as unknown as SpeechRecognitionEvent;
}

interface Harness {
  user: ReturnType<typeof userEvent.setup>;
  micButton: () => HTMLElement;
  getText: () => string;
  getInput: () => Element | null;
  /** Async act(): disabling the focused mic button synthesizes a blur as a microtask, so flush it. */
  setDisabled: (v: boolean) => Promise<void>;
  /** Raw setter — compose with a manual on* handler inside a single act() to land in one commit. */
  rawSetDisabled: (v: boolean) => void;
}

function renderVoiceHarness(): Harness {
  let user = userEvent.setup({delay: null});
  let valueRef = {current: new PromptFieldValue([])};
  let setDisabledRef = {current: (() => {}) as (v: boolean) => void};

  function Inner() {
    let [value, setValue] = useState<PromptFieldValue>(new PromptFieldValue([]));
    let [isDisabled, setIsDisabled] = useState(false);
    useEffect(() => {
      valueRef.current = value;
    }, [value]);
    useEffect(() => {
      setDisabledRef.current = setIsDisabled;
    }, [setIsDisabled]);

    return (
      <PromptField value={value} onChange={v => setValue(v as PromptFieldValue)}>
        <PromptTokenField />
        <PromptFieldToolbar>
          <PromptFieldVoiceButton isDisabled={isDisabled} />
        </PromptFieldToolbar>
      </PromptField>
    );
  }

  let tree = render(<Inner />);
  return {
    user,
    micButton: () => tree.getByRole('button', {name: /recording/i}),
    getText: () => valueRef.current.toString(),
    getInput: () => tree.container.querySelector('[contenteditable]'),
    setDisabled: v =>
      act(async () => {
        setDisabledRef.current(v);
        await Promise.resolve();
      }),
    rawSetDisabled: v => setDisabledRef.current(v)
  };
}

async function startListening(harness: {
  user: Harness['user'];
  micButton: () => HTMLElement;
}): Promise<MockSpeechRecognition> {
  await harness.user.click(harness.micButton());
  // start() resolves the requestMicrophone() promise chain before creating the recognizer.
  await waitFor(() => expect(instances.length).toBeGreaterThan(0));
  return instances[instances.length - 1];
}

interface SubmitHarness {
  user: ReturnType<typeof userEvent.setup>;
  onSubmit: jest.Mock;
  micButton: () => HTMLElement;
  submitButton: () => HTMLElement;
  getText: () => string;
  lastSubmitted: () => string | undefined;
}

/**
 * Harness for the submit path: an uncontrolled PromptField (tracks its value via onChange) with a
 * voice button, a submit button, and an onSubmit spy. Deliberately does NOT wire isDisabled, so it
 * exercises the "consumer that never disables the field on submit" case.
 */
function renderSubmitHarness(): SubmitHarness {
  let user = userEvent.setup({delay: null});
  let onSubmit = jest.fn();
  let valueRef = {current: new PromptFieldValue([])};

  function Inner() {
    return (
      <PromptField
        onChange={v => {
          valueRef.current = v as PromptFieldValue;
        }}
        onSubmit={onSubmit}>
        <PromptTokenField />
        <PromptFieldToolbar>
          <PromptFieldVoiceButton />
          <PromptFieldSubmitButton />
        </PromptFieldToolbar>
      </PromptField>
    );
  }

  let tree = render(<Inner />);
  return {
    user,
    onSubmit,
    micButton: () => tree.getByRole('button', {name: /recording/i}),
    submitButton: () => tree.getByRole('button', {name: /send/i}),
    getText: () => valueRef.current.toString(),
    lastSubmitted: () => {
      let call = onSubmit.mock.calls.at(-1);
      return call ? (call[0] as PromptFieldValue).toString() : undefined;
    }
  };
}

describeOrSkip('PromptFieldVoiceButton', () => {
  beforeAll(() => {
    installRangePolyfill();
  });

  beforeEach(() => {
    instances = [];
    Object.defineProperty(window, 'isSecureContext', {value: true, configurable: true});
    (window as any).SpeechRecognition = class extends MockSpeechRecognition {
      constructor() {
        super();
        instances.push(this);
      }
    };
  });

  afterEach(() => {
    delete (window as any).SpeechRecognition;
  });

  describe('dictation', () => {
    it('writes the transcript into the field while recording', async () => {
      let harness = renderVoiceHarness();
      let recognizer = await startListening(harness);

      act(() => {
        recognizer.onresult?.call(recognizer, makeResultEvent('hello'));
      });
      expect(harness.getText()).toBe('hello');
    });

    it('commits the dictated text and focuses the input on a manual stop', async () => {
      let harness = renderVoiceHarness();
      let recognizer = await startListening(harness);

      act(() => {
        recognizer.onresult?.call(recognizer, makeResultEvent('final words'));
      });

      // Toggle the mic off; isVoiceListening only flips once the browser's onend fires.
      await harness.user.click(harness.micButton());
      act(() => {
        recognizer.onend?.call(recognizer, new Event('end'));
      });

      expect(harness.getText()).toBe('final words');
      expect(document.activeElement).toBe(harness.getInput());
    });
  });

  describe('submit while dictating', () => {
    it('submits the displayed text, stops the recognizer, and clears the field', async () => {
      let harness = renderSubmitHarness();
      let recognizer = await startListening(harness);

      act(() => {
        recognizer.onresult?.call(recognizer, makeResultEvent('hello world'));
      });
      expect(harness.getText()).toBe('hello world');

      await harness.user.click(harness.submitButton());

      expect(harness.onSubmit).toHaveBeenCalledTimes(1);
      expect(harness.lastSubmitted()).toBe('hello world');
      expect(recognizer.stop).toHaveBeenCalled();
      expect(harness.getText()).toBe('');
    });

    it('does not repopulate the cleared field from the still-running recognizer', async () => {
      let harness = renderSubmitHarness();
      let recognizer = await startListening(harness);

      act(() => {
        recognizer.onresult?.call(recognizer, makeResultEvent('hello'));
      });

      await harness.user.click(harness.submitButton());
      expect(harness.getText()).toBe('');

      // Still-running recognizer emits more transcript: suppressed, field stays cleared.
      act(() => {
        recognizer.onresult?.call(recognizer, makeResultEvent('hello world'));
      });
      expect(harness.getText()).toBe('');

      // restoreFocus on the eventual onend must not repopulate it either.
      act(() => {
        recognizer.onend?.call(recognizer, new Event('end'));
      });
      expect(harness.getText()).toBe('');
    });

    it('starts a fresh session after submit without repopulating the old prompt', async () => {
      let harness = renderSubmitHarness();
      let recognizer = await startListening(harness);

      act(() => {
        recognizer.onresult?.call(recognizer, makeResultEvent('hello'));
      });
      await harness.user.click(harness.submitButton());
      act(() => {
        recognizer.onend?.call(recognizer, new Event('end'));
      });
      expect(harness.getText()).toBe('');

      // New dictation session builds on the cleared prompt, not the submitted text.
      let next = await startListening(harness);
      act(() => {
        next.onresult?.call(next, makeResultEvent('new prompt'));
      });
      expect(harness.getText()).toBe('new prompt');
    });
  });

  describe('isDisabled stops recording and hands off to the input', () => {
    it('stops the recognizer when disabled while recording', async () => {
      let harness = renderVoiceHarness();
      let recognizer = await startListening(harness);

      await harness.setDisabled(true);
      expect(recognizer.stop).toHaveBeenCalled();
    });

    it('commits the dictated text and focuses the input when disabled while recording', async () => {
      let harness = renderVoiceHarness();
      let recognizer = await startListening(harness);

      act(() => {
        recognizer.onresult?.call(recognizer, makeResultEvent('hello'));
      });

      await harness.setDisabled(true);
      act(() => {
        recognizer.onend?.call(recognizer, new Event('end'));
      });

      // Disabling stops recording but keeps the dictation and returns focus to the input.
      expect(harness.getText()).toBe('hello');
      expect(document.activeElement).toBe(harness.getInput());
    });

    it('pauses live writes while disabled, then commits the full transcript on stop', async () => {
      let harness = renderVoiceHarness();
      let recognizer = await startListening(harness);

      act(() => {
        recognizer.onresult?.call(recognizer, makeResultEvent('hello'));
      });
      expect(harness.getText()).toBe('hello');

      // Disable and a stray transcript in the same commit: the live write is suppressed.
      await act(async () => {
        harness.rawSetDisabled(true);
        recognizer.onresult?.call(recognizer, makeResultEvent(' world'));
        await Promise.resolve();
      });
      expect(harness.getText()).toBe('hello');

      // On stop, the final commit includes everything dictated up to the stop.
      act(() => {
        recognizer.onend?.call(recognizer, new Event('end'));
      });
      expect(harness.getText()).toBe('hello world');
    });
  });
});
