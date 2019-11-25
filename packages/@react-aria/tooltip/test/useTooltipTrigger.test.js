import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useTooltipTrigger} from '../';

describe('useTooltipTrigger', function () {

  let renderTooltipTriggerHook = (tooltipProps, tooltipTriggerProps, isOpen) => {
    let {result} = renderHook(() => useTooltipTrigger(tooltipProps, tooltipTriggerProps, isOpen));
    return result.current;
  };

  it('should return default props for tooltip and tooltip trigger', function () {
    let props = {
      tooltipProps: {},
      triggerProps: {},
      state: {}
    };

    let {tooltipTriggerProps, tooltipProps} = renderTooltipTriggerHook(props);

    expect(tooltipProps['aria-describedby']).toBe(tooltipTriggerProps.id);
    expect(tooltipProps.role).toBe('tooltip');
  });

  it('should return proper aria props for tooltip and tooltip trigger if tooltip is open', function () {
    let props = {
      tooltipProps: {},
      triggerProps: {},
      state: {
        isOpen: true
      }
    };

    let {tooltipTriggerProps, tooltipProps} = renderTooltipTriggerHook(props);

    expect(tooltipTriggerProps.role).toBe('button');
    expect(tooltipProps['aria-describedby']).toBe(tooltipTriggerProps.id);
    expect(tooltipProps.role).toBe('tooltip');
  });

});
