import {act, create} from 'react-test-renderer';
import React from 'react';
import {motionTokens} from './tokens';
import {useReducedMotion} from './useReducedMotion';

describe('motionTokens', () => {
  it('has fast < normal < slow durations', () => {
    expect(motionTokens.duration.fast).toBeLessThan(motionTokens.duration.normal);
    expect(motionTokens.duration.normal).toBeLessThan(motionTokens.duration.slow);
  });

  it('exposes easing strings', () => {
    expect(typeof motionTokens.easing.standard).toBe('string');
    expect(typeof motionTokens.easing.emphasized).toBe('string');
  });
});

describe('useReducedMotion', () => {
  it('returns false by default (mock returns false)', () => {
    let result: boolean | null = null;
    function Capture() {
      result = useReducedMotion();
      return null;
    }
    act(() => {
      create(React.createElement(Capture));
    });
    expect(result).toBe(false);
  });
});
