import {UnpluginInstance} from 'unplugin';

type Options = {
  locales: readonly string[]
};

declare const plugin: UnpluginInstance<Options, boolean>;
export = plugin;
