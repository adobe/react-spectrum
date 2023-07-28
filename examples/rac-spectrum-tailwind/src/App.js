import { useState } from 'react';
import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { Label, Radio, RadioGroup, ListBox, Item, Text } from 'react-aria-components';
import User from '@spectrum-icons/workflow/User';
import UserGroup from '@spectrum-icons/workflow/UserGroup';
import Building from '@spectrum-icons/workflow/Building';
import CheckmarkCircle from '@spectrum-icons/workflow/CheckmarkCircle';
import ThemeSwitcher from './ThemeSwitcher';

export function App() {
  let prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  let [colorScheme, setColorScheme] = useState(prefersDark ? 'dark' : 'light');

  return (
    <Provider theme={defaultTheme} colorScheme={colorScheme} UNSAFE_className={colorScheme}>
      <ThemeSwitcher setColorScheme={setColorScheme} />
      <div className="grid gap-160 grid-cols-1 auto-rows-fr justify-center">
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
      flex justify-center p-160 m-160 h-2000 w-2000 focus:outline-none border rounded
      ${isFocusVisible ? 'ring' : ''}
      ${isSelected ? 'bg-blue-100 border-blue-700' : ''}
      ${isPressed && !isSelected ? 'bg-gray-200' : ''}
      ${!isSelected && !isPressed ? 'bg-white dark:bg-black' : ''}
    `}>
      {({ isSelected }) => (
        <div className="flex flex-col relative w-full h-full items-center justify-center gap-150">
          {isSelected && <div className="absolute top-0 left-0 -mt-125 -ml-75 text-blue-800"><CheckmarkCircle size="S" /></div>}
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
  let ratings = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return (
    <RadioGroup className="space-y-10 flex flex-col text-center m-auto">
      <Label className="text-xl font-semibold">Sentiment Rating</Label>
      <div className="flex justify-between">
        <span>Least Likely</span>
        <span>Most Likely</span>
      </div>
      <div className="flex justify-evenly">
        {ratings.map((rating) => (
          <SentimentRating key={rating} rating={rating} />
        ))}
      </div>
    </RadioGroup>
  );
}

function SentimentRating({ rating }) {
  return (
    <Radio value={rating} className="flex justify-center items-center rounded-full p-160 m-75 h-200 w-200 focus:outline-none border focus-visible:ring bg-white dark:bg-black selected:bg-blue-800 selected:border-blue-800 selected:text-white pressed:bg-gray-200 hovered:border-gray-300">
      {rating}
    </Radio>
  );
}

function ListBoxExample() {
  return (
    <ListBox
      className="bg-white rounded grid grid-cols-2 w-64"
      aria-label="Albums"
      layout="grid"
      selectionMode="single">
      <MyItem label="None" image="https://images.unsplash.com/photo-1517520267752-34bfde704a0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" />
      <MyItem label="Photo" image="https://images.unsplash.com/photo-1517520267752-34bfde704a0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" />
      <MyItem label="Graphic" image="https://images.unsplash.com/photo-1517520267752-34bfde704a0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" />
      <MyItem label="Art" image="https://images.unsplash.com/photo-1517520267752-34bfde704a0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" />
    </ListBox>
  )
}

function MyItem({ label, image }) {
  return (
    <Item textValue={label} className="flex align-middle w-32 h-14">
      <img src={image} alt={label} className="w-12 h-12 object-cover" />
      <Text slot="label">{label}</Text>
    </Item>
  );
}