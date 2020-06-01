/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Content} from '@react-spectrum/view';
import Error from '@spectrum-icons/illustrations/src/Error';
import {Heading} from '@react-spectrum/typography';
import {IllustratedMessage} from '../';
import {Link} from '@react-spectrum/link';
import NotFound from '@spectrum-icons/illustrations/src/NotFound';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Timeout from '@spectrum-icons/illustrations/Timeout';
import Upload from '@spectrum-icons/illustrations/Upload';
import Unauthorized from '@spectrum-icons/illustrations/Unauthorized';
import Unavailable from '@spectrum-icons/illustrations/Unavailable';

storiesOf('IllustratedMessage', module)
  .add(
    'Not found',
    () => render({
      heading: 'Error 404: Page not found.',
      description: 'This page isn’t available. Try checking the URL or visit a different page.',
      illustration: <NotFound />
    })
  )
  .add(
    'Unauthorized',
    () => render({
      heading: 'Error 401: Unauthorized',
      description: 'You don’t have access to this page. Try checking the URL or visit a different page.',
      illustration: <Unauthorized />
    })
  )
  .add(
    'Error',
    () => render({
      heading: 'Error 500: Internal Server Error',
      description: 'This page isn’t available right now. Try visiting this page again later.',
      illustration: <Error />
    })
  )
  .add(
    'Unavailable',
    () => render({
      heading: 'Error 503: Service Unavailable',
      description: 'This page isn’t available right now. Try visiting this page again later.',
      illustration: <Unavailable />
    })
  )
  .add(
    'Timeout',
    () => render({
      heading: 'Error 504: Gateway Timeout',
      description: 'This page isn’t available right now. Try visiting this page again later.',
      illustration: <Timeout />
    })
  )
  .add(
    'Upload',
    () => render({
      heading: 'Drag and drop your file',
      description: <><Link>Select a file</Link> from your computer<br />or <Link>search Adobe Stock</Link>.</>,
      illustration: <Upload />
    })
  )
  .add(
    'No heading or description',
    () => render({illustration: <NotFound aria-label="No Results" />})
  );

function render(props: any = {}) {
  let {
    illustration,
    heading,
    description,
    ...otherProps
  } = props;
  return (
    <IllustratedMessage {...otherProps}>
      {description && <Content>{description}</Content>}
      {heading && <Heading>{heading}</Heading>}
      {illustration}
    </IllustratedMessage>
  );
}
