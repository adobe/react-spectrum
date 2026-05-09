import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {Meter} from './Meter';

describe('Meter', () => {
  it('exposes progressbar role with accessibilityValue', () => {
    let {root} = renderWithProvider(
      <Meter label="Storage" maxValue={100} minValue={0} value={70} />
    );
    let host = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).accessibilityRole === 'progressbar'
    )[0];
    expect(host).toBeDefined();
    expect(host.props.accessibilityValue.now).toBe(70);
  });
});
