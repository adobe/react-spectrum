import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
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
import {useRouter, type NextRouter} from 'next/router';
import Script from 'next/script';

declare module '@adobe/react-spectrum' {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<NextRouter['push']>[2]>
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<ColorScheme>("light");

  let router = useRouter();
  let themeIcons = { dark: <Moon />, light: <Light /> };
  let otherTheme: ColorScheme = theme === "light" ? "dark" : "light";
  enableTableNestedRows();

  return (
    <>
      <Script id="font-loading">
        {
          `(function(d) {
            var config = {
              kitId: 'uei1lip',
              scriptTimeout: 3000,
              async: true
            },
            h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
          })(document);`
        }
      </Script>
      <Provider
        theme={lightTheme}
        colorScheme={theme}
        router={{
          navigate: (href, opts) => router.push(href, undefined, opts),
          useHref: (href: string) => router.basePath + href
        }}
        locale="en">
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
    </>
  );
}
export default MyApp;
