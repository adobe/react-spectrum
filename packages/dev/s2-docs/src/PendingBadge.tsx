import {Badge} from '@react-spectrum/s2';
import React from 'react';

export function PendingBadge() {
  return (
    <Badge variant="informative" UNSAFE_style={{width: 'fit-content', display: 'inline-flex', verticalAlign: 'middle'}}>Pending</Badge>
  );
}
