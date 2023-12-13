import {UnpluginInstance} from 'unplugin';

type Options = {
  locales: string[]
};

declare const plugin: UnpluginInstance<Options, boolean>;
export = plugin;
