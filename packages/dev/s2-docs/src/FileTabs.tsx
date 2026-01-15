'use client';

import {CodeLink} from './Link';
import {createContext, ReactElement, ReactNode, useContext, useState} from 'react';
import {Key, Tab, TabList, TabPanel, Tabs} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

interface FileTabsProps {
  children?: ReactNode,
  files: {[name: string]: ReactElement},
  extraFiles?: {[name: string]: ReactElement},
  defaultSelectedKey?: Key
}

const FileTabsContext = createContext<((tab: Key) => void) | null>(null);

export function FileTabs({children, files, extraFiles, defaultSelectedKey}: FileTabsProps) {
  let [tabs, setTabs] = useState(files);
  let [selectedKey, setSelectedKey] = useState<Key>(defaultSelectedKey || Object.keys(files)[0]);
  let onFileClick = (key: Key) => {
    let file: Key | null = null;
    for (let k of [key, key + '.tsx', key + '.ts', key + '.js']) {
      if (k in files || (extraFiles && k in extraFiles)) {
        file = k;
        break;
      }
    }

    if (file) {
      setSelectedKey(file);
      if (!tabs[file] && extraFiles?.[file]) {
        setTabs({...tabs, [file]: extraFiles[file]});
      }
    }
  };

  return (
    <FileTabsContext value={onFileClick}>
      <Tabs
        aria-label="Files"
        selectedKey={selectedKey}
        onSelectionChange={setSelectedKey}
        density="compact"
        data-files>
        <TabList styles={style({marginBottom: 20})}>
          {children && <Tab id="example">Example</Tab>}
          {Object.keys(tabs).map(file => <Tab key={file} id={file}>{file}</Tab>)}
        </TabList>
        {children && <TabPanel id="example" shouldForceMount data-example>{children}</TabPanel>}
        {Object.entries(tabs).map(([name, file]) => <TabPanel key={name} id={name}>{file}</TabPanel>)}
      </Tabs>
    </FileTabsContext>
  );
}

export function TabLink({name, ...props}) {
  let onFileClick = useContext(FileTabsContext);
  if (!onFileClick) {
    return <span {...props} />;
  }

  return (
    <CodeLink
      {...props}
      onPress={() => {
        onFileClick(name);
      }} />
  );
}
