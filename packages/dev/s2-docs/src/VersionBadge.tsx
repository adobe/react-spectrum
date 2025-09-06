import {Badge} from '@react-spectrum/s2';
import React from 'react';

export function VersionBadge({version, size = 'L'}: {version: string, size?: 'S' | 'M' | 'L' | 'XL'}) {
  let versionMap = {
    'alpha': 'informative',
    'beta': 'informative',
    'rc': 'positive'
  };

  let preRelease = version.match(/(alpha)|(beta)|(rc)/);

  if (!preRelease) {
    return null;
  }
  return (
    <Badge size={size} variant={versionMap[preRelease[0]]} UNSAFE_style={{width: 'fit-content', display: 'inline-flex', verticalAlign: 'middle'}}>{preRelease[0]}</Badge>
  );
}
