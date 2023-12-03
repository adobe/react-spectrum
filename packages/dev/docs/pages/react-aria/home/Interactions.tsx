import React from 'react';
import {Select, SelectItem} from '../../../../../../starters/tailwind/src/Select';

let mouseCard = document.getElementById('mouse-card');

export function Interactions() {
  return (
    <Select label="Ice cream">
      <SelectItem>Chocolate</SelectItem>
      <SelectItem>Mint</SelectItem>
      <SelectItem>Strawberry</SelectItem>
      <SelectItem>Vanilla</SelectItem>
    </Select>
  );
}
