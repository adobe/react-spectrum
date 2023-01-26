import {testSSR} from '@react-spectrum/test-utils';

describe('SSRProvider', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {SSRProvider, useSSRSafeId} from '../';
      const Test = () => <div id={useSSRSafeId()} />;

      <>
        <SSRProvider>
          <Test />
          <Test />
        </SSRProvider>
        {React.useId !== undefined && (
          <SSRProvider mode="useId" useId={React.useId}>
            <Test />
            <Test />
          </SSRProvider>
        )}
      </>
    `);
  });

  it('should render without errors in strict mode', async function () {
    await testSSR(__filename, `
      import {SSRProvider, useSSRSafeId} from '../';
      const Test = () => <div id={useSSRSafeId()} />;

      <React.StrictMode>
        <SSRProvider strictMode>
          <Test />
          <Test />
        </SSRProvider>
        {React.useId !== undefined && (
          <SSRProvider mode="useId" useId={React.useId}>
            <Test />
            <Test />
          </SSRProvider>
        )}
      </React.StrictMode>
    `);
  });
});
