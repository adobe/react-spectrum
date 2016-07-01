import React from 'react';

import ShellOrganization from './ShellOrganization';

export default function ShellSubOrganization(props) {
  return <ShellOrganization { ...props } isSubItem />;
}
