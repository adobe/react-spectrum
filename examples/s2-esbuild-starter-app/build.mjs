import * as esbuild from 'esbuild';
import { createBuildSettings } from './settings.mjs';
import fs from 'fs';

const outdirectory = "dist";

//clear out any old JS or CSS
if (fs.existsSync(outdirectory)) {
  fs.rmSync(outdirectory, { recursive: true })
}
fs.mkdirSync(outdirectory);
fs.copyFileSync('index.html', outdirectory + '/index.html');

//defaults to build
let config = "-build";
if (process.argv.length > 2) {
  config = process.argv[2];
}

let settings;
if (config === '-watch') {
  settings = createBuildSettings({
    outdir: outdirectory,
    minify: false
  });
  let ctx = await esbuild.context(settings);

  await ctx.watch()

  let { host, port } = await ctx.serve({
    servedir: outdirectory,
  });
  console.log('serving on', host, port);
} else if (config === '-build') {
  settings = createBuildSettings({
    outdir: outdirectory,
    minify: true
  });
  await esbuild.build(settings);
}


