/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {Button, FileTrigger, Link} from 'react-aria-components';
import React from 'react';

export default {
  title: 'React Aria Components'
};

export const FileTriggerButton = (props) => (
  <FileTrigger
    onSelect={action('onSelect')}
    data-testid="filetrigger-example"
    {...props} >
    <Button>Upload</Button>
  </FileTrigger>
);

export const FileTriggerDirectories = (props) => {
  let [files, setFiles] = React.useState<string[]>([]);

  return (
    <>
      <FileTrigger
        {...props}
        acceptDirectory
        onSelect={(e) => {
          if (e) {
            let fileList = [...e].map(file => file.webkitRelativePath !== '' ? file.webkitRelativePath : file.name);
            setFiles(fileList);
          }
        }} >
        <Button>Upload</Button>
      </FileTrigger>
      {files && <ul>
        {files.map((file, index) => (
          <li key={index}>{file}</li>
        ))}
      </ul>}
    </>
  );
};

export const FileTriggerLinkAllowsMultiple = (props) => (
  <FileTrigger
    {...props}
    onSelect={action('onSelect')}
    allowsMultiple >
    <Link>Select a file</Link>
  </FileTrigger>
);
