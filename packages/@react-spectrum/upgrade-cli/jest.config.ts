/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
import type {Config} from 'jest';

const config: Config = {
  transform: {
    '\\.[jt]sx?$': 'ts-jest'
  },
  moduleNameMapper: {
    '(.+)\\.js': '$1'
  },
  extensionsToTreatAsEsm: ['.ts']
};

export default config;
