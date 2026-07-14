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

import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

/**
 * Chromium brands whose Web Speech backend is known to work. Other Chromium
 * forks (Arc, Brave, Edge) expose the API but route to a backend that does not
 * return results, so they are excluded. Safari has no `userAgentData` and is
 * trusted directly. Add a brand here to enable another Chromium fork.
 */
const VOICE_INPUT_CHROMIUM_BROWSERS = new Set<string>(['Google Chrome']);

/** Normalised voice-recognition error. `null` is never surfaced (e.g. aborts). */
export type VoiceInputErrorCode =
  | 'not-allowed'
  | 'network'
  | 'no-speech'
  | 'audio-capture'
  | 'language-not-supported'
  | 'phrases-not-supported'
  | 'unknown';

// doesn't have onStart/onInterim/etc, didn't seem like they were needed since coworker just used
// it to contruct the transcript while still allowing the field be editable by the user and it was quite buggy
export interface VoiceInputProps {
  lang?: string;
}

// TODO: make a accompanying aria hook later, this is more stately like
export interface VoiceInputResult {
  isSupported: boolean;
  isListening: boolean;
  errorCode: VoiceInputErrorCode | null;
  // TODO: this returns the full voice transcript rather than offering a interim and final one like cooworker's does
  // can alway offer that later
  transcript: string;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

/** Resolves the recognizer constructor, applying the Chromium brand allowlist. */
const getRecognitionCtor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
  if (!ctor) {
    return null;
  }
  const brands = navigator.userAgentData?.brands;
  if (brands && !brands.some(b => VOICE_INPUT_CHROMIUM_BROWSERS.has(b.brand))) {
    return null;
  }
  return ctor;
};

/** SpeechRecognition requires a secure context (HTTPS / localhost). */
const isSecureVoiceContext = (): boolean =>
  typeof window !== 'undefined' && window.isSecureContext === true;

/** Maps a raw recognition error to a normalised code, or `null` to ignore it. */
const mapErrorCode = (error: string): VoiceInputErrorCode | null => {
  switch (error) {
    case 'aborted':
      return null;
    case 'not-allowed':
    case 'service-not-allowed':
      return 'not-allowed';
    case 'network':
      return 'network';
    case 'no-speech':
      return 'no-speech';
    case 'audio-capture':
      return 'audio-capture';
    case 'language-not-supported':
      return 'language-not-supported';
    case 'phrases-not-supported':
      return 'phrases-not-supported';
    default:
      return 'unknown';
  }
};

/** Maps a getUserMedia rejection to a normalised error code. */
const mapMediaError = (err: unknown): VoiceInputErrorCode => {
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'not-allowed';
  }
  if (name === 'NotFoundError' || name === 'NotReadableError') {
    return 'audio-capture';
  }
  return 'unknown';
};

/**
 * Requests microphone access so the browser permission prompt reliably opens and
 * a denial is detected before recognition starts. Returns `null` on success (or
 * when getUserMedia is unavailable, deferring to the recognizer's own prompt),
 * or an error code on failure. The granted stream is released immediately —
 * SpeechRecognition opens its own.
 */
const requestMicrophone = async (): Promise<VoiceInputErrorCode | null> => {
  const media = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
  if (!media?.getUserMedia) {
    return null;
  }
  try {
    const stream = await media.getUserMedia({audio: true});
    stream.getTracks().forEach(track => track.stop());
    return null;
  } catch (err) {
    return mapMediaError(err);
  }
};

/** Accumulates interim vs final transcripts from a recognition result event. */
const readTranscript = (event: SpeechRecognitionEvent): {interim: string; final: string} => {
  let interim = '';
  let final = '';
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];
    const alternative = result?.[0];
    if (result && alternative) {
      if (result.isFinal) {
        final += alternative.transcript;
      } else {
        interim += alternative.transcript;
      }
    }
  }
  return {interim, final};
};

interface RecognizerSetup {
  recognitionRef: RefObject<SpeechRecognition | null>;
  setListening: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<VoiceInputErrorCode | null>>;
  setInterim: Dispatch<SetStateAction<string>>;
  appendFinal: (s: string) => void;
}

/**
 * Creates and wires a SpeechRecognition instance. On error/end the ref is cleared,
 * but only when this instance is still the active one, so a late event from a
 * previous session can't wipe out a newly-started recognizer.
 */
const createRecognizer = (
  ctor: SpeechRecognitionConstructor,
  lang: string,
  setup: RecognizerSetup
): SpeechRecognition => {
  const recognition = new ctor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang;

  // Ignore events from a session that is no longer the active recognizer (e.g. a
  // late onend/onerror after a new session started), so they can't flip the
  // listening state, surface a st ale error, or clear a newer recognizer.
  const isActive = () => setup.recognitionRef.current === recognition;

  recognition.onstart = () => {
    setup.setListening(true);
  };
  recognition.onresult = event => {
    if (!isActive()) {
      return;
    }
    const {interim, final} = readTranscript(event);
    if (final) {
      setup.appendFinal(final);
    }
    setup.setInterim(interim);
  };
  recognition.onerror = event => {
    if (!isActive()) {
      return;
    }
    const code = mapErrorCode(event.error);
    if (code) {
      setup.setError(code);
    }
    setup.setListening(false);
    setup.setInterim('');
    // Clear so the next press starts a fresh session instead of calling stop().
    setup.recognitionRef.current = null;
  };
  recognition.onend = () => {
    if (!isActive()) {
      return;
    }
    setup.setListening(false);
    setup.setInterim('');
    setup.recognitionRef.current = null;
  };

  return recognition;
};

export const useVoiceInput = (options: VoiceInputProps): VoiceInputResult => {
  const {lang} = options;

  // Resolve support once — it cannot change for the lifetime of the page.
  const ctor = useMemo(() => (isSecureVoiceContext() ? getRecognitionCtor() : null), []);
  const isSupported = ctor !== null;

  const [isListening, setIsListening] = useState(false);
  const [errorCode, setErrorCode] = useState<VoiceInputErrorCode | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const transcript = finalTranscript + interimTranscript;

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    // Guard against double-start (a started recognizer throws InvalidStateError)
    // and against re-entry while the permission prompt is open.
    if (!ctor || recognitionRef.current || startingRef.current) {
      return;
    }
    startingRef.current = true;
    setErrorCode(null);
    setInterimTranscript('');
    setFinalTranscript('');

    // Request mic access first so the browser permission prompt reliably opens
    // and a denial is reported before recognition starts.
    void requestMicrophone().then(micError => {
      startingRef.current = false;
      if (!mountedRef.current) {
        return;
      }
      if (micError) {
        setErrorCode(micError);
        return;
      }
      // Bail if unmounted or already started while the prompt was open.
      if (recognitionRef.current) {
        return;
      }

      const recognition = createRecognizer(ctor, lang ?? navigator.language ?? 'en-US', {
        recognitionRef,
        setListening: setIsListening,
        setError: setErrorCode,
        setInterim: setInterimTranscript,
        appendFinal: s => setFinalTranscript(prev => prev + s)
      });
      recognitionRef.current = recognition;
      recognition.start();
    });
  }, [ctor, lang]);

  const toggle = useCallback(() => {
    if (recognitionRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  // Abort on unmount so dangling callbacks never fire after teardown.
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  return {isSupported, isListening, errorCode, transcript, start, stop, toggle};
};
