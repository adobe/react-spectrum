import { Checkbox, defaultTheme, Provider } from '@adobe/react-spectrum';
import { Label, Radio, RadioGroup, Tabs, TabList, TabPanel, Tab } from 'react-aria-components';
import User from '@spectrum-icons/workflow/User';
import UserGroup from '@spectrum-icons/workflow/UserGroup';
import Building from '@spectrum-icons/workflow/Building';


export function App() {
  return (
    <Provider theme={defaultTheme}>
      <div className="grid gap-4 grid-cols-1 auto-rows-fr justify-center">
        <SelectBoxExample />
        <SentimentRatingGroup />
      </div>
    </Provider>
  );
}



function SelectBoxExample() {
  return (
    <RadioGroup className="space-y-2 flex flex-col text-center" defaultValue="Team">
      <Label className="text-xl font-semibold">Select Boxes</Label>
      <div className="flex justify-center">
        <SelectBox name="Individual" icon={<User size="XL" />} description="For 1 person" />
        <SelectBox name="Team" icon={<UserGroup size="XL" />} description="For teams of 9 or less" />
        <SelectBox name="Enterprise" icon={<Building size="XL" />} description="For of 10 or more" />
      </div>
    </RadioGroup>
  );
}

function SelectBox({ name, icon, description }) {
  return (
    <Radio value={name} className={({ isFocusVisible, isSelected, isPressed }) => `
      flex rounded p-4 m-3 h-40 w-40 focus:outline-none border
      ${isFocusVisible ? 'ring' : ''}
      ${isSelected ? 'bg-blue-100 border-blue-700' : ''}
      ${isPressed && !isSelected ? 'bg-gray-200' : ''}
      ${!isSelected && !isPressed ? 'bg-white' : ''}
    `}>
      {({ isSelected }) => (
        <div className="flex flex-col relative w-full h-full items-center justify-center gap-3 text-black">
          {isSelected && <div className="absolute top-0 left-0 -mt-3"><Checkbox isReadOnly isEmphasized isSelected={true} /></div>}
          {icon && <div className="text-gray-500">{icon}</div>}
          <div>
            <div className={`font-semibold`}>{name}</div>
            {description && <div className="text-gray-800 text-sm">{description}</div>}
          </div>
        </div>
      )}
    </Radio>
  );
}

function SentimentRatingGroup() {
  let ratings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <RadioGroup className="space-y-2 flex flex-col text-center max-w-xl m-auto" defaultValue="5">
      <Label className="text-xl font-semibold">Sentiment Rating</Label>
      <div className="flex justify-between">
        <span>Least Likely</span>
        <span>Most Likely</span>
      </div>
      <div className="flex justify-evenly">
        {ratings.map((rating) => (
          <SentimentRating key={rating} rating={rating.toString()} />
        ))}
      </div>
    </RadioGroup>
  );
}

function SentimentRating({ rating }) {
  return (
    <Radio value={rating} className={({ isFocusVisible, isSelected, isPressed }) => `
      flex rounded-full p-4 m-3 h-4 w-4 focus:outline-none border
      ${isFocusVisible ? 'ring' : ''}
      ${isSelected ? 'bg-blue-800 border-blue-800 text-white' : ''}
      ${isPressed && !isSelected ? 'bg-gray-200' : ''}
      ${!isSelected && !isPressed ? 'bg-white' : ''}
    `}>
      {({ isSelected }) => (
        <div className={`flex flex-col w-full h-full items-center justify-center font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
          {rating}
        </div>
      )}
    </Radio>
  );
}