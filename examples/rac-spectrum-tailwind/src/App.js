import { useState } from "react";
import { defaultTheme, Provider } from "@adobe/react-spectrum";
import { Label, Radio, RadioGroup } from "react-aria-components";
import User from "@spectrum-icons/workflow/User";
import UserGroup from "@spectrum-icons/workflow/UserGroup";
import Building from "@spectrum-icons/workflow/Building";
import CheckmarkCircle from "@spectrum-icons/workflow/CheckmarkCircle";
import ThemeSwitcher from "./ThemeSwitcher";

export function App() {
  let [colorScheme, setColorScheme] = useState(undefined);

  return (
    <Provider theme={defaultTheme} colorScheme={colorScheme}>
      <ThemeSwitcher setColorScheme={setColorScheme} />
      <div className="grid justify-center grid-cols-1 gap-160 auto-rows-fr">
        <SelectBoxExample />
        <SentimentRatingGroup />
        <div className="flex justify-center">
          <div className="flex flex-col max-w-sm">
            <label for="test-input">Native input</label>
            <input id="test-input" className="border focus:bg-gray-200 focus:outline-none focus:border-blue-600 hover:border-blue-300" />
            <p>For the purpose of ensuring Tailwind's default selectors still work for non-RAC elements when using the plugin.</p>
          </div>
        </div>
      </div>
    </Provider>
  );
}

function SelectBoxExample() {
  return (
    <RadioGroup
      data-rac
      className="flex flex-col space-y-2 text-center"
      defaultValue="Team"
    >
      <Label className="text-xl font-semibold">Select Boxes</Label>
      <div className="flex justify-center">
        <SelectBox
          name="Individual"
          icon={<User size="XL" />}
          description="For 1 person"
        />
        <SelectBox
          name="Team"
          icon={<UserGroup size="XL" />}
          description="For teams of 9 or less"
        />
        <SelectBox
          name="Enterprise"
          icon={<Building size="XL" />}
          description="For of 10 or more"
        />
      </div>
    </RadioGroup>
  );
}

function SelectBox({ name, icon, description }) {
  return (
    <Radio
      data-rac
      value={name}
      className={({ isFocusVisible, isSelected, isPressed }) => `
      flex justify-center p-160 m-160 h-2000 w-2000 focus:outline-none border rounded
      ${isFocusVisible ? "ring-half ring-offset-0" : ""}
      ${isSelected ? "bg-accent-100 border-accent-700" : ""}
      ${isPressed && !isSelected ? "bg-gray-200" : ""}
      ${!isSelected && !isPressed ? "bg-white dark:bg-black" : ""}
    `}
    >
      {({ isSelected }) => (
        <div className="relative flex flex-col items-center justify-center w-full h-full gap-150">
          {isSelected && (
            <div className="absolute top-0 left-0 text-accent-800 -mt-125 -ml-75">
              <CheckmarkCircle size="S" />
            </div>
          )}
          {icon && <div className="text-gray-500">{icon}</div>}
          <div>
            <div className={`font-semibold`}>{name}</div>
            {description && <div className="text-sm">{description}</div>}
          </div>
        </div>
      )}
    </Radio>
  );
}

function SentimentRatingGroup() {
  let ratings = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return (
    <RadioGroup className="flex flex-col m-auto space-y-10 text-center">
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
    <Radio
      data-rac
      value={rating}
      className="flex items-center justify-center bg-white border rounded-full p-160 m-75 h-200 w-200 focus:outline-none focus-visible:ring dark:bg-black selected:bg-accent-800 dark:selected:bg-accent-800 selected:border-accent-800 selected:text-white pressed:bg-gray-200 dark:pressed:bg-gray-200 hover:border-gray-300"
    >
      {rating}
    </Radio>
  );
}
