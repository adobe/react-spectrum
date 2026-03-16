import { Plant } from './plants';
import { CloudSun, Dessert, Droplet, Droplets, RefreshCw, Sun, SunDim } from 'lucide-react';
import { ReactElement } from 'react';

const labelStyles = {
  gray: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600',
  green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-300/20 dark:text-green-400 dark:border-green-300/10',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-300/20 dark:text-yellow-400 dark:border-yellow-300/10',
  blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-400/20 dark:text-blue-300 dark:border-blue-400/10'
};

function Label({color, icon, children}: {color: keyof typeof labelStyles, icon: React.ReactNode, children: React.ReactNode}) {
  return <span className={`${labelStyles[color]} text-xs rounded-full border px-2 flex items-center max-w-fit gap-1`}>{icon} <span className="truncate capitalize">{children}</span></span>;
}

export const cycleIcon = <RefreshCw aria-hidden="true" className="w-4 h-4 shrink-0" />;
export function CycleLabel({cycle}: {cycle: string}) {
  return <Label color="green" icon={cycleIcon}>{cycle}</Label>;
}

export const sunIcons: Record<string, ReactElement> = {
  'full sun': <Sun aria-hidden="true" className="w-4 h-4 shrink-0" />,
  'part sun': <SunDim aria-hidden="true" className="w-4 h-4 shrink-0" />,
  'part shade': <CloudSun aria-hidden="true" className="w-4 h-4 shrink-0" />
};

export const sunColors: Record<string, keyof typeof labelStyles> = {
  'full sun': 'yellow',
  'part sun': 'yellow',
  'part shade': 'gray'
};

export function SunLabel({sun}: {sun: string}) {
  return <Label color={sunColors[sun]} icon={sunIcons[sun]}>{sun}</Label>;
}

export function getSunlight(item: Plant) {
  return (item.sunlight.find(s => s.startsWith('part')) || item.sunlight[0]).split('/')[0];
}

export const wateringIcons: Record<string, ReactElement> = {
  'Frequent': <Droplets aria-hidden="true" className="w-4 h-4 shrink-0" />,
  'Average': <Droplet aria-hidden="true" className="w-4 h-4 shrink-0" />,
  'Minimum': <Dessert aria-hidden="true" className="w-4 h-4 shrink-0" />
};

const wateringColors: Record<string, keyof typeof labelStyles> = {
  'Frequent': 'blue',
  'Average': 'blue',
  'Minimum': 'gray'
};

export function WateringLabel({watering}: {watering: string}) {
  return <Label color={wateringColors[watering]} icon={wateringIcons[watering]}>{watering}</Label>;
}
