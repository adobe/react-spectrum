// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Change variant=overBackground to staticColor=white', `
import {Link} from '@adobe/react-spectrum';
let variant = 'overBackground';
let props = {variant: 'overBackground'};
<div>
  <Link variant="overBackground" href="https://www.imdb.com/title/tt6348138/" target="_blank">
    The missing link.
  </Link>
  <Link variant={"overBackground"} href="https://www.imdb.com/title/tt6348138/" target="_blank">
    The missing link.
  </Link>
  <Link variant={variant} href="https://www.imdb.com/title/tt6348138/" target="_blank">
    The missing link.
  </Link>
  <Link href="https://www.imdb.com/title/tt6348138/" target="_blank" {...props}>
    The missing link.
  </Link>
</div>
`);

test('Remove inner anchor element (deprecated API)', `
import {Link} from '@adobe/react-spectrum';

<div>
  <Link>
    <a href="https://www.imdb.com/title/tt6348138/" target="_blank">
      The missing link.
    </a>
  </Link>
</div>
`);

test('Leaves comment if inner link element is a custom router link (deprecated API)', `
import {Link} from '@adobe/react-spectrum';
import { Link as RouterLink } from "react-router-dom";

<div>
  <Link>
    <RouterLink to="https://www.imdb.com/title/tt6348138/">
      The missing link.
    </RouterLink>
  </Link>
</div>
`);
