import {UnpluginInstance} from 'unplugin';

type Options = {
  locales: readonly string[]
};

declare const plugin: UnpluginInstance<Options, false>;
export = plugin;
