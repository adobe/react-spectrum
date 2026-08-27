import {UnpluginInstance} from 'unplugin';

type Options = {
  locales: readonly string[];
};

type TurbopackCondition =
  | 'browser'
  | 'foreign'
  | 'development'
  | 'production'
  | 'node'
  | 'edge-light'
  | {not: TurbopackCondition}
  | {all: TurbopackCondition[]}
  | {any: TurbopackCondition[]}
  | {path: string | RegExp; content?: RegExp}
  | {path?: string | RegExp; content: RegExp};

type TurbopackOptions = Options & {
  condition?: TurbopackCondition;
};

type TurbopackOptionsList = readonly [TurbopackOptions, ...TurbopackOptions[]];

type TurbopackRule = {
  condition?: TurbopackCondition;
  loaders: [{loader: string; options: {locales: readonly string[]}}];
  as: '*.js';
};

type TurbopackConfig = {
  rules: Record<string, TurbopackRule | TurbopackRule[]>;
};

declare const plugin: UnpluginInstance<Options, false> & {
  turbopack(options: Options | TurbopackOptionsList): TurbopackConfig;
};
export = plugin;
