import {join} from 'path';
import {MemoryFS} from '@parcel/fs';
import Parcel, {createWorkerFarm} from '@parcel/core';

const rootPath = join(__dirname, '..', '..', '..', '..');
const fixtureRoot = join(
  rootPath,
  'packages/dev/parcel-transformer-docs/__tests__/fixtures/parcel-transformer-test-app'
);

const workerFarm = createWorkerFarm();

afterAll(() => {
  workerFarm.end();
});

const outputFS = new MemoryFS(workerFarm);

const getParcelInstance = (workingDir: string) => {
  return new Parcel({
    config: join(rootPath, '.parcelrc'),
    entries: [join(workingDir)],
    targets: ['apiCheck'],
    outputFS,
    workerFarm,
  });
};

it('transforms assets with babel plugin', async () => {
  const parcel = getParcelInstance(fixtureRoot);
  await parcel.run();

  const code = JSON.parse(
    outputFS.readFileSync(join(fixtureRoot, 'dist', 'api.json'), 'utf8')
  );
  expect(code).toMatchSnapshot({
    exports: {
      App: {
        id: expect.stringMatching(/^.*\/packages\/.*:App/)
      },
      App2Real: {
        id: expect.stringMatching(/^.*\/packages\/.*:App2/)
      }
    }
  });
}, 50000);
