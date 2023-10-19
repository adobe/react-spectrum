import { useState } from "react";
import { defaultTheme, Link, Provider } from "@adobe/react-spectrum";
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
      <h1 className="text-4xl font-bold text-center mb-300 pt-300">
        [RAC + Spectrum + Tailwind] Cookbook
      </h1>
      <section className="max-w-xl m-auto">
        <section className="mb-300">
          <h2 className="text-2xl font-semibold text-center underline underline-offset-2">
            Intro
          </h2>
          <h3 className="text-xl font-semibold">📙 Overview</h3>
          <div className="mb-200">
            This resource is meant to help you get started with creating custom
            components using{" "}
            <Link href="https://react-spectrum.adobe.com/react-aria/react-aria-components.html">
              React Aria Components
            </Link>{" "}
            and <Link href="https://tailwindcss.com/">Tailwind CSS</Link>, with
            a theme that features{" "}
            <Link href="https://spectrum.adobe.com/">Spectrum</Link> styles and
            values. The goal for this is to enable you to deliver accessible
            custom Spectrum components more quickly.
          </div>
          <h3 className="text-xl font-semibold">✅ When to use this</h3>
          <div className="mb-200">
            When you need to implement a component that follows Spectrum
            guidelines, but doesn't exist in React Spectrum.
          </div>
          <h3 className="text-xl font-semibold">❌ When not to use this</h3>
          <div className="mb-200">
            When you want to avoid patterns specifically outlined by Spectrum,
            or when a React Spectrum component already exists for your use case.
          </div>
          <h3 className="text-xl font-semibold">⚠️ Risks</h3>
          <div className="mb-200">
            Since you're taking ownership of the components you build, you still
            need to ensure they follow Spectrum guidelines and accessibility
            guidelines.
          </div>
        </section>
        <section className="mb-300">
          <h2 className="text-2xl font-semibold text-center underline underline-offset-2">
            Setup
          </h2>
          <ol>
            <li>
              <h3 className="text-xl font-semibold">📦 Install dependencies</h3>
              <div className="mb-200">
                We need to install{" "}
                <Link href="https://react-spectrum.adobe.com/react-spectrum/getting-started.html">
                  React Spectrum
                </Link>
                ,{" "}
                <Link href="https://react-spectrum.adobe.com/react-aria/react-aria-components.html#installation">
                  React Aria Components
                </Link>
                , and the{" "}
                <Link href="https://react-spectrum.adobe.com/react-aria/styling.html#plugin">
                  RAC Tailwind plugin
                </Link>
                .
              </div>
              <code className="p-40 bg-gray-200 rounded mb-200">
                yarn add @adobe/react-spectrum react-aria-components
                tailwindcss-react-aria-components
              </code>
              <div className="mb-200 mt-200">
                Note that the reason React Spectrum is needed, is because the
                Provider will provide CSS variables that our theme will
                reference.
              </div>
            </li>
            <li>
              <h3 className="text-xl font-semibold">⚡ Install Tailwind</h3>
              <div className="mb-200">
                Follow the instructions in the{" "}
                <Link href="https://tailwindcss.com/docs/installation">
                  Tailwind Docs
                </Link>{" "}
                based on your build setup.{" "}
              </div>
            </li>
            <li>
              <h3 className="text-xl font-semibold">🛠️ Configure Tailwind</h3>
              <div className="mb-200">
                <div className="mb-200">
                  In your tailwind.config.js, include the preset from this
                  template:
                </div>
                <pre className="block p-40 bg-gray-200 rounded mb-200">{`/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('./src/spectrum-preset.js')
  ],
  plugins: [
    require('tailwindcss-react-aria-components')
  ],
}
`}</pre>
              </div>
            </li>
            <li>
              Then, add a React Spectrum{" "}
              <Link href="https://react-spectrum.adobe.com/react-spectrum/Provider.html">
                Provider
              </Link>{" "}
              to your app if one doesn't already exist. This will ensure that
              your page has access to the proper CSS variables. If you include
              these variables using some other method, that will work too.
            </li>
          </ol>
          <div></div>
        </section>
        <section className="mb-600">
          <h2 className="text-2xl font-semibold text-center underline underline-offset-2">
            Usage
          </h2>
          <div>
            <h3 className="text-xl font-semibold">🎨 Add styles</h3>
            <div className="mb-200">
              You can now use Tailwind classes to style your components.
            </div>
            <div className="mb-100">Here are some examples:</div>
            <ul className="list-disc mb-200">
              <li>
                Using <code className="p-40 bg-gray-200 rounded">ring</code>{" "}
                will give you a focus ring with good default Spectrum styles for
                it's color, width, and offset.
              </li>
              <li>
                Using{" "}
                <code className="p-40 bg-gray-200 rounded">bg-blue-600</code>{" "}
                will give you a background that matches
                --spectrum-global-color-blue-600.
              </li>
              <li>
                Using <code className="p-40 bg-gray-200 rounded">w-25</code>{" "}
                will give you a width of
                var(--spectrum-global-dimension-size-25).
              </li>
              <li>
                Using{" "}
                <code className="p-40 bg-gray-200 rounded">
                  ease-in duration-100
                </code>{" "}
                will give you a transition that matches Spectrum's motion
                values.
              </li>
              <li>
                Using{" "}
                <code className="p-40 bg-gray-200 rounded">sm:text-left</code>{" "}
                will give you left text alignment for small width devices based
                on Spectrum's break points.
              </li>
              <li>
                Using{" "}
                <code className="p-40 bg-gray-200 rounded">dark:bg-black</code>{" "}
                will give you a black background if the user is in dark mode
                based on the React Spectrum provider.
              </li>
            </ul>
            <div>
              <h3 className="text-xl font-semibold">
                🪄 Styling based on state
              </h3>
              To see how to add Tailwind styles based on state, see the{" "}
              <Link href="https://react-spectrum.adobe.com/react-aria/styling.html#tailwind-css">
                RAC Styling docs
              </Link>
              .
            </div>
          </div>
        </section>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-center underline mb-300 underline-offset-2">
          Examples
        </h2>
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
            <span className="text-xl font-semibold mb-200">
              Navigation Boxes
            </span>
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

          <div className="m-auto space-y-200">
            <StarRatingGroup label="Star Rating" />
            <StarRatingGroup isEmphasized label="Star Rating (Emphasized)" />
          </div>

          <PlanSwitcher />

          <div className="w-full m-auto">
            <div className="text-xl font-semibold text-center mb-200">
              GenAI Input
            </div>
            <GenInputField />
          </div>
        </div>
      </section>
    </Provider>
  );
}
