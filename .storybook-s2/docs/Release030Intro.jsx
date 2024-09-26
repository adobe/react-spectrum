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
