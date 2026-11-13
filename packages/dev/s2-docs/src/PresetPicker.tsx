'use client';

import {analyze, cc, type Cell, cxo, dc, exp, mega} from '@react-spectrum/ai/loader';
import {Picker, PickerItem} from '@react-spectrum/s2/Picker';

export const presetNames = new WeakMap<object, string>();

const presets: {[name: string]: Cell[][]} = {cc, dc, exp, cxo, analyze, mega};

const labels: {[name: string]: string} = {
  cc: 'Creative Cloud',
  dc: 'Document Cloud',
  exp: 'Experience Cloud',
  cxo: 'CXO',
  analyze: 'Analyze',
  mega: 'Mega'
};

// Register each preset's identifier so the live example's code panel can print `icon={cxo}`
for (let name in presets) {
  presetNames.set(presets[name], name);
}

interface PresetPickerProps {
  value: Cell[] | Cell[][] | undefined;
  onChange: (value: Cell[] | Cell[][] | undefined) => void;
}

/**
 * A control for PixelLoader's `icon` prop. `icon` accepts a single icon or a themed preset
 * (Cell[][])
 */
export function PresetPicker({value, onChange}: PresetPickerProps) {
  let selectedKey = Object.keys(presets).find(name => presets[name] === value) ?? 'default';

  return (
    <Picker
      aria-label="icon"
      value={selectedKey}
      onChange={key => onChange(key === 'default' ? undefined : presets[key as string])}>
      <PickerItem id="default">AI Logo (default)</PickerItem>
      {Object.keys(presets).map(name => (
        <PickerItem key={name} id={name}>
          {labels[name]}
        </PickerItem>
      ))}
    </Picker>
  );
}
