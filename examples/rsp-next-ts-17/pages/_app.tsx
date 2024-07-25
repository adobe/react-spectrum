import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
  SSRProvider,
  Provider,
  lightTheme,
  ActionButton,
  Flex,
  Grid,
  View,
} from "@adobe/react-spectrum";
import { ColorScheme } from "@react-types/provider";
import { useState } from "react";
import Moon from "@spectrum-icons/workflow/Moon";
import Light from "@spectrum-icons/workflow/Light";
import { ToastContainer } from "@react-spectrum/toast";
import {enableTableNestedRows} from '@react-stately/flags';

function MyApp({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<ColorScheme>("light");

  let themeIcons = { dark: <Moon />, light: <Light /> };
  let otherTheme: ColorScheme = theme === "light" ? "dark" : "light";
  enableTableNestedRows();

  return (
    <SSRProvider>
      <Provider theme={lightTheme} colorScheme={theme}>
        <Grid
          areas={["header", "content"]}
          columns={["1fr"]}
          rows={["size-200", "auto"]}
          gap="size-100"
        >
          <Flex
            direction="row"
            gap="size-100"
            justifyContent="end"
            margin="size-100"
          >
            <ActionButton
              aria-label={`Switch to ${otherTheme} mode.`}
              onPress={() => setTheme(otherTheme)}
            >
              {themeIcons[otherTheme]}
            </ActionButton>
          </Flex>
          <View>
            <Component {...pageProps} />
          </View>
        </Grid>
        <ToastContainer />
      </Provider>
    </SSRProvider>
  );
}
export default MyApp;
