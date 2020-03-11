import {Grid} from '@react-spectrum/layout';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {render} from '@testing-library/react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

export function testSlotsAPI(Component) {
  let {getByTestId} = render(
    <Provider theme={theme}>
      <Grid data-testid="grid" slots={{dummySlot: {UNSAFE_className: 'slotClassName'}}}>
        <Component slot="dummySlot" />
      </Grid>
    </Provider>
  );
  let root = getByTestId('grid');
  expect(root.firstChild).toHaveClass('slotClassName');
}
