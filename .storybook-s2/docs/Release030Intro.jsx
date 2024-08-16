import {highlight} from './highlight' with {type: 'macro'};
import {H3, P, Pre, Code, Link} from './typography';

export function Release030Intro() {
  return (
    <>
      <P>
        With this end of summer release we've been busy adding a number of new components such as AlertDialog, AvatarGroup, NumberField, and Tabs.
        If you're using a previous version of Spectrum 2, please update your dependencies to <Code>@react-spectrum/s2@^0.3.0</Code>.
        In your code you'll need to update your imports to the new package name:
      </P>
      <Pre>{highlight(`import {...} from '@react-spectrum/s2';`)}</Pre>
      <P>and in your package.json:</P>
      <Pre>{highlight(`"@react-spectrum/s2": "^0.3.0"`)}</Pre>

      <P>We've added new documentation that shows the included <Link href="?path=/docs/workflow-icons--docs">workflow icons</Link> and <Link href="?path=/docs/illustrations--docs">illustrations</Link>. If your project has custom icons or illustrations, you can use the <Link href="">CLI tool</Link>.</P>

      <P>To help teams migrate their projects to Spectrum 2, we've added a codemod to help update to the new components. Please read the <Link href="?path=/docs/migrating--docs">migration documentation</Link> for more information.</P>
    </>
  )
}
