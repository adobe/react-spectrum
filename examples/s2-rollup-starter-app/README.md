# rollup-starter-app

This repo contains a bare-bones example of how to create an application using Rollup, including importing a module from `node_modules` and converting it from CommonJS.

*See also https://github.com/rollup/rollup-starter-lib*


## Getting started

Clone this repository and install its dependencies:

```bash
git clone https://github.com/rollup/rollup-starter-app
cd rollup-starter-app
npm install

# or
npx degit "rollup/rollup-starter-app" my-app
cd my-app
npm install
```

The `public/index.html` file contains a `<script src='bundle.js'>` tag, which means we need to create `public/bundle.js`. The `rollup.config.js` file tells Rollup how to create this bundle, starting with `src/main.js` and including all its dependencies, including [date-fns](https://date-fns.org).

`npm run build` builds the application to `public/bundle.js`, along with a sourcemap file for debugging.

`npm start` launches a server, using [serve](https://github.com/zeit/serve). Navigate to [localhost:3000](http://localhost:3000).

`npm run watch` will continually rebuild the application as your source files change.

`npm run dev` will run `npm start` and `npm run watch` in parallel.

## License

[MIT](LICENSE).
