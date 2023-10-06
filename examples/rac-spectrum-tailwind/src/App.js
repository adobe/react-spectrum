import { useState } from "react";
import { defaultTheme, Provider } from "@adobe/react-spectrum";
import User from "@spectrum-icons/workflow/User";
import UserGroup from "@spectrum-icons/workflow/UserGroup";
import Building from "@spectrum-icons/workflow/Building";
import ThemeSwitcher from "./ThemeSwitcher";
import { SelectBoxGroup, SelectBox } from "./components/SelectBoxGroup";
import { SentimentRatingGroup } from "./components/SentimentRatingGroup";
import { NavigationBox } from "./components/NavigationBox";
import { StarRatingGroup } from "./components/StarRatingGroup";
import { GenInputField } from "./components/GenInputField";
import { PlanSwitcher } from "./components/PlanSwitcher";

export function App() {
  let [colorScheme, setColorScheme] = useState(undefined);

  return (
    <Provider theme={defaultTheme} colorScheme={colorScheme}>
      <ThemeSwitcher setColorScheme={setColorScheme} />
      <div className="grid justify-center grid-cols-1 gap-160 auto-rows-fr">
        <SelectBoxGroup label="Select Boxes" defaultValue="Team">
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
        </SelectBoxGroup>

        <SentimentRatingGroup />

        <div className="text-center">
          <span className="text-xl font-semibold">Navigation Boxes</span>
          <div className="flex justify-center">
            <NavigationBox
              href="https://adobe.com"
              src="https://i.imgur.com/DhygPot.jpg"
            >
              Premium
            </NavigationBox>
            <NavigationBox
              href="https://adobe.com"
              src="https://i.imgur.com/Z7AzH2c.png"
            >
              Templates
            </NavigationBox>
          </div>
        </div>

        <div className="m-auto">
          <StarRatingGroup isEmphasized />
          <StarRatingGroup />
        </div>

        <PlanSwitcher />

        <GenInputField />

        <div className="flex justify-center">
          <div className="flex flex-col max-w-sm">
            <label htmlFor="test-input">Native input</label>
            <input
              id="test-input"
              className="border focus:bg-gray-200 focus:outline-none focus:border-blue-600 hover:border-blue-300"
            />
            <p>
              For the purpose of ensuring Tailwind's default selectors still
              work for non-RAC elements when using the plugin.
            </p>
          </div>
        </div>
      </div>
    </Provider>
  );
}
