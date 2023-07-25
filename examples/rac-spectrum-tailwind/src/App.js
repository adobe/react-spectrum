import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { Label, Radio, RadioGroup, Tabs, TabList, TabPanel, Tab } from 'react-aria-components';
import User from '@spectrum-icons/workflow/User';
import UserGroup from '@spectrum-icons/workflow/UserGroup';
import Building from '@spectrum-icons/workflow/Building';


export function App() {
  return (
    <Provider theme={defaultTheme}>
      <div className="grid gap-4 grid-cols-1 auto-rows-fr justify-center">
        <RadioGroupBoxExample />
        <SentimentRatingGroup />
      </div>
    </Provider>
  );
}



function RadioGroupBoxExample() {
  return (
    <RadioGroup className="space-y-2 flex flex-col text-center" defaultValue="Team">
      <Label className="text-xl font-semibold">Radio Group Boxes</Label>
      <div className="flex justify-center">
        <RadioBox name="Free" icon={<User size="XL" />} />
        <RadioBox name="Team" icon={<UserGroup size="XL" />} />
        <RadioBox name="Enterprise" icon={<Building size="XL" />} />
      </div>
    </RadioGroup>
  );
}

function RadioBox({ name, icon }) {
  return (
    <Radio value={name} className={({ isFocusVisible, isSelected, isPressed }) => `
      flex cursor-default rounded-md p-4 m-3 h-40 w-40 focus:outline-none bg-clip-padding border
      ${isFocusVisible ? 'ring-2 ring-blue-800 ring-offset-2' : ''}
      ${isSelected ? 'bg-blue-700 border-blue-700 text-white' : ''}
      ${isPressed && !isSelected ? 'bg-gray-200 border-gray-500' : ''}
      ${!isSelected && !isPressed ? 'bg-white border-gray-500' : ''}
    `}>
      {({ isSelected }) => (
        <div className="flex flex-col w-full h-full items-center justify-center gap-3">
          {icon && <div className={`${isSelected ? 'text-white' : 'text-black'}`}>{icon}</div>}
          <div className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>{name}</div>
        </div>
      )}
    </Radio>
  );
}

function SentimentRatingGroup() {
  let ratings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <RadioGroup className="space-y-2 flex flex-col text-center max-w-lg m-auto" defaultValue="Team">
      <Label className="text-xl font-semibold">Sentiment Rating</Label>
      <div className="flex justify-between">
        <span>Least Likely</span>
        <span>Most Likely</span>
      </div>
      <div className="flex justify-evenly">
        {ratings.map((index) => (
          <SentimentRating key={index} index={index} />
        ))}
      </div>
    </RadioGroup>
  );
}

function SentimentRating({ index }) {
  return (
    <Radio value={index} className={({ isFocusVisible, isSelected, isPressed }) => `
      flex cursor-default rounded-full p-4 m-3 h-4 w-4 focus:outline-none bg-clip-padding border
      ${isFocusVisible ? 'ring-2 ring-blue-800 ring-offset-2' : ''}
      ${isSelected ? 'bg-blue-700 border-blue-700 text-white' : ''}
      ${isPressed && !isSelected ? 'bg-gray-200 border-gray-500' : ''}
      ${!isSelected && !isPressed ? 'bg-white border-gray-500' : ''}
    `}>
      {({ isSelected }) => (
        <div className={`flex flex-col w-full h-full items-center justify-center font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
          {index}
        </div>
      )}
    </Radio>
  );
}

function TabsExample() {
  return (
    <div>
      <div className="text-xl font-semibold text-center">Feature Carousel</div>
      <Tabs>
        <MyTabPanel id="first">
          <img width={200} src="https://images.unsplash.com/photo-1690215711687-777c0e2cb7e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" />
        </MyTabPanel>
        <MyTabPanel id="second">
          <img width={200} src="https://images.unsplash.com/photo-1670459471984-26e534ab2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" />
        </MyTabPanel>
        <MyTabPanel id="third">
          <img width={200} src="https://images.unsplash.com/photo-1690081598908-be45683775f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" />
        </MyTabPanel>
        <TabList aria-label="Feeds" className="flex flex-col justify-center align-middle space-x-1 p-1 w-96">
          <MyTab id="first">
            <div className="font-semibold">Summary 1</div>
            <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
          </MyTab>
          <MyTab id="second">
             <div className="font-semibold">Summary 2</div>
            <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
          </MyTab>
          <MyTab id="third">
             <div className="font-semibold">Summary 3</div>
            <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
          </MyTab>
        </TabList>
      </Tabs>
    </div>
  );
}

function MyTab(props) {
  return (
    <Tab
      {...props}
      className={({ isSelected, isFocusVisible }) => `
        w-full py-2.5 sm:text-sm font-medium leading-5 text-center cursor-default ring-black outline-none transition-colors
        ${isFocusVisible ? 'ring-2' : ''}
        ${isSelected ? 'bg-gray-200 border-gray-600 border-l-4' : ''}
      `} />
  );
}

function MyTabPanel(props) {
  return <TabPanel {...props} className="flex align-middle justify-center bg-transparent" />;
}
