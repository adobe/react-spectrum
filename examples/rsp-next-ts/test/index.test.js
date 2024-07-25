import Home from '../pages/index';
import {Provider, defaultTheme} from '@adobe/react-spectrum';
import {render} from '@testing-library/react';

describe('smoke test', () => {
  it('should render', () => {
    render(<Provider theme={defaultTheme}><Home /></Provider>);
  });
});
