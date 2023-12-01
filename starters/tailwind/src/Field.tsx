import { Label as RACLabel, LabelProps, FieldError as RACFieldError, Text, TextProps, FieldErrorProps, GroupProps, Group } from "react-aria-components";
import {twMerge} from 'tailwind-merge';

export function Label(props: LabelProps) {
  return <RACLabel {...props} className={`text-sm text-gray-500 font-medium cursor-default ${props.className || ''}`} />;
}

export function Description(props: TextProps) {
  return <Text {...props} slot="description" className={`text-sm text-gray-600 ${props.className || ''}`} />;
}

export function FieldError(props: FieldErrorProps) {
  return <RACFieldError {...props} className={`text-sm text-red-600 ${props.className || ''}`} />
}

export function FieldGroup(props: GroupProps) {
  return <Group {...props} className={twMerge('group flex items-center h-9 bg-white border-2 border-gray-300 group-invalid:border-red-600 group-disabled:border-gray-200 rounded-lg focus-within:border-gray-600 focus-visible:outline outline-2 outline-blue-600 outline-offset-2', props.className)} />;
}
