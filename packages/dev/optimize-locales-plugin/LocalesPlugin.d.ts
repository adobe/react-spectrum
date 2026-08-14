import {UnpluginInstance} from 'unplugin';

type Options = {
  locales: readonly string[];
};

type TurbopackConfig = {
  rules: Record<
    string,
    {
      loaders: [{loader: string; options: {locales: string[]}}];
      as: '*.js';
    }
  >;
};

declare const plugin: UnpluginInstance<Options, false> & {
  turbopack(options: Options): TurbopackConfig;
};
export = plugin;
