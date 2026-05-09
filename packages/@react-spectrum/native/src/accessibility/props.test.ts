import {mapAccessibilityProps, mapAccessibilityState} from './props';

describe('mapAccessibilityProps', () => {
  it('maps aria-label to accessibilityLabel', () => {
    let result = mapAccessibilityProps({'aria-label': 'Save button'});
    expect(result.accessibilityLabel).toBe('Save button');
  });

  it('prefers accessibilityLabel over aria-label', () => {
    let result = mapAccessibilityProps({
      accessibilityLabel: 'explicit',
      'aria-label': 'aria'
    });
    expect(result.accessibilityLabel).toBe('explicit');
  });

  it('passes accessibilityHint through', () => {
    let result = mapAccessibilityProps({accessibilityHint: 'Double-tap to activate'});
    expect(result.accessibilityHint).toBe('Double-tap to activate');
  });

  it('builds accessibilityState from flags', () => {
    let result = mapAccessibilityProps({isDisabled: true, isSelected: true});
    expect(result.accessibilityState.disabled).toBe(true);
    expect(result.accessibilityState.selected).toBe(true);
  });

  it('omits false flags (no undefined pollution)', () => {
    let result = mapAccessibilityProps({isDisabled: false});
    expect(result.accessibilityState.disabled).toBeUndefined();
  });
});

describe('mapAccessibilityState', () => {
  it('maps isInvalid', () => {
    expect(mapAccessibilityState({isInvalid: true}).invalid).toBe(true);
  });

  it('all false → all undefined', () => {
    let state = mapAccessibilityState({});
    expect(state.disabled).toBeUndefined();
    expect(state.invalid).toBeUndefined();
    expect(state.selected).toBeUndefined();
  });
});
