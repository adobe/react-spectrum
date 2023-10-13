import { useProvider, ActionButton } from "@adobe/react-spectrum";
import Moon from "@spectrum-icons/workflow/Moon";
import Light from "@spectrum-icons/workflow/Light";

export default function ThemeSwitcher({ setColorScheme }) {
  let { colorScheme } = useProvider();
  let label =
    colorScheme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  let otherScheme = colorScheme === "light" ? "dark" : "light";

  return (
    <div className="float-right m-50">
      <ActionButton
        aria-label={label}
        onPress={() => setColorScheme(otherScheme)}
      >
        {colorScheme === "dark" ? <Light /> : <Moon />}
      </ActionButton>
    </div>
  );
}
