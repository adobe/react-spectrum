import {testSSR} from '@react-spectrum/test-utils';

describe('useSSRSafeId', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {useSSRSafeId} from '../';
      const Test = () => <div id={useSSRSafeId()} />;
      <Test />
    `);
  });
});
