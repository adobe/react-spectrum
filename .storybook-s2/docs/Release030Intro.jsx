import {highlight} from './highlight' with {type: 'macro'};
import {H3, P, Pre, Code, Link} from './typography';

export function Release030Intro() {
  return (
    <>
      <P>
        Spectrum 2 now lives in npm, please update your dependencies to <Code>@react-spectrum/s2@^0.3.0</Code> if you were using a previous version.
        You'll need to update your imports to the new package name:
      </P>
      <Pre>{highlight(`import {...} from '@react-spectrum/s2';`)}</Pre>
      <P>and in your package.json:</P>
      <Pre>{highlight(`"@react-spectrum/s2": "^0.3.0"`)}</Pre>

      <P>To help teams kickstart their migrations from v3 to Spectrum 2, we've also added a migration wizard. Please read the <Link href="?path=/docs/migrating--docs">migration documentation</Link> for more information.</P>
    </>
  )
}

export function Release0100Intro() {
  return (
    <>
      <P>
        We have a new option to our icon builder so that users can build a library of icons more easily using the same processing we apply to our own S2 Icon library. 
      </P>
      <P>
        To run the new option, create a new npm project with an appropriate package.json, such as
      </P>
      <Pre>{highlight(`{
  "name": "<<PACKAGE NAME>>",
  "version": "<<VERSION>>",
  "exports": {
    "./*": {
      "types": "./*.d.ts",
      "module": "./*.mjs",
      "import": "./*.mjs",
      "require": "./*.cjs"
    }
  },
  "peerDependencies": {
    "@react-spectrum/s2": ">=0.8.0",
    "react": "^18.0.0 || ^19.0.0-rc.1",
    "react-dom": "^18.0.0 || ^19.0.0-rc.1"
  },
  "devDependencies": {
    "@react-spectrum/s2-icon-builder": ">=0.2.3",
    "@react-spectrum/s2": "latest",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}`)}</Pre>
      <P>Copy your svg icons into a <Code>src</Code> directory in the project.</P>
      <P>Then run:</P>
      <Pre>{
      highlight(`yarn install --no-immutable
yarn transform-icons -i './src/*.svg' -o ./ --isLibrary`)}
      </Pre>
    </>
  )
}

