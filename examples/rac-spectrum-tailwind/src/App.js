import {defaultTheme, Provider} from '@adobe/react-spectrum';
import { Label,Radio, RadioGroup } from 'react-aria-components';
import User from '@spectrum-icons/workflow/User';
import UserGroup from '@spectrum-icons/workflow/UserGroup';
import Building from '@spectrum-icons/workflow/Building';


export function App() {
  return (
    <Provider theme={defaultTheme}>
      <div className="grid gap-4 grid-cols-1 auto-rows-fr justify-center">
        <RadioGroupExample />
      </div>
    </Provider>
  );
}



function RadioGroupExample() {
  return (
      <RadioGroup className="space-y-2 flex flex-col text-center" defaultValue="Team">
        <Label className="text-xl font-semibold">Radio Group</Label>
        <div className="flex justify-center">
          <MyRadio name="Free" icon={<User size="XL" />} />
          <MyRadio name="Team" icon={<UserGroup size="XL" />} />
          <MyRadio name="Enterprise" icon={<Building size="XL"  />} />
        </div>
      </RadioGroup>
  );
}

function MyRadio({name, icon}) {
  return (
    <Radio value={name} className={({isFocusVisible, isSelected, isPressed}) => `
      flex cursor-default rounded-md p-4 m-3 h-40 w-40 focus:outline-none bg-clip-padding border
      ${isFocusVisible ? 'ring-2 ring-blue-800 ring-offset-2' : ''}
      ${isSelected ? 'bg-blue-900 border-blue-900 text-white' : ''}
      ${isPressed && !isSelected ? 'bg-gray-200 border-gray-500' : ''}
      ${!isSelected && !isPressed ? 'bg-white border-gray-500' : ''}
    `}>
      {({isSelected}) => (
        <div className="flex flex-col w-full h-full items-center justify-center gap-3">
          {icon && <div className={`h-12 w-12 ${isSelected ? 'text-white' : 'text-black'}`}>{icon}</div>}
          <div className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>{name}</div>
        </div>
      )}
    </Radio>
  );
}

