import { lightDark, size, style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { getColorScale } from "@react-spectrum/s2-docs/src//color.macro" with {type: 'macro'};
import { Code } from "@react-spectrum/s2-docs/src//Code";
import { Pre } from "@react-spectrum/s2-docs/src/CodePlatter";
import { ObjectStyles } from "./ObjectStyles";
import { DarkMode } from "./DarkMode";
import { AppFrame, ExampleApp } from "./ExampleApp";
import { Button, Divider, Provider } from "@react-spectrum/s2";
import {Link, LinkButton} from '@react-spectrum/s2-docs/src/Link';
import { Mobile } from "./Mobile";
import { Rems } from "./Rems";
// import { PressAnimation } from "./Press";
import { HCM } from "./HCM";
import Lightbulb from '@react-spectrum/s2/illustrations/gradient/generic2/Lightbulb';
import Phone from '@react-spectrum/s2/illustrations/gradient/generic2/Phone';
import Translate from '@react-spectrum/s2/illustrations/gradient/generic2/Translate';
import Animation from '@react-spectrum/s2/illustrations/gradient/generic2/Animation';
import Accessibility from '@react-spectrum/s2/illustrations/gradient/generic2/Accessibility';
import TextIcon from '@react-spectrum/s2/illustrations/gradient/generic2/Text';
import Interaction from '@react-spectrum/s2/illustrations/gradient/generic2/Interaction';
// import Ruler from '@react-spectrum/s2/illustrations/gradient/generic2/Ruler';
import Shapes from '@react-spectrum/s2/illustrations/gradient/generic2/Shapes';
import Color from '@react-spectrum/s2/illustrations/gradient/generic2/Color';
import CodeBrackets from '@react-spectrum/s2/illustrations/gradient/generic2/CodeBrackets';
// import Cursor from '@react-spectrum/s2/illustrations/gradient/generic2/Cursor';
import IllustrationIcon from '@react-spectrum/s2/illustrations/gradient/generic2/Illustration';
import Sparkles from '@react-spectrum/s2/illustrations/gradient/generic2/Sparkles';
import Server from '@react-spectrum/s2/illustrations/gradient/generic2/Server';
import SpeedFast from '@react-spectrum/s2/illustrations/gradient/generic2/SpeedFast';
import VectorDraw from '@react-spectrum/s2/illustrations/gradient/generic2/VectorDraw';
import Layers from '@react-spectrum/s2/illustrations/gradient/generic2/Layers';
import { Icons, Illustrations } from "./Icons";
import { Typography } from "./Typography";
import { States } from "./States";
import { useId } from "react";
import { Responsive } from "./Responsive";
// @ts-ignore
import { mergeStyles } from "../../../../../@react-spectrum/s2/style/runtime";
import { ReduceMotion } from "./ReduceMotion";
import { Colors } from "./Colors";
import '@react-spectrum/s2-docs/src/footer.css';
// @ts-ignore
import bg from 'data-url:./bg.svg';
// import { SubmenuAnimation } from "./SubmenuAnimation";
// @ts-ignore
import { keyframes } from "../../../../../@react-spectrum/s2/style/style-macro" with {type: 'macro'};
import SearchMenuWrapperServer from "@react-spectrum/s2-docs/src/SearchMenuWrapperServer";
import type {Page} from "@parcel/rsc";
// @ts-ignore
import { fontSizeToken } from "../../../../../@react-spectrum/s2/style/tokens" with {type: 'macro'};
// @ts-ignore
import { letters } from "../../../src/textWidth";
import HomeHeader from "./Header";
import {ReleaseLink} from "./ReleaseLink";

const container = style({
  backgroundColor: 'layer-2/80',
  boxShadow: 'elevated',
  borderRadius: 'xl',
  padding: {
    default: 16,
    sm: 32
  },
  position: 'relative',
  overflow: 'clip',
  display: 'flex',
  flexDirection: 'column',
  rowGap: 12,
  outlineStyle: 'solid',
  outlineColor: lightDark('transparent', 'transparent-white-100'),
  outlineWidth: 1
});

// Animated heading sliding in from the top.
const swapWrapper = style({
  display: 'inline-block',
  position: 'relative',
  height: '[1.2em]',
  overflow: 'hidden',
  verticalAlign: 'baseline',
  whiteSpace: 'nowrap',
  lineHeight: '[1.2]'
});

// Track that scrolls vertically through all the items.
// Use 3D to ensure crisp text rendering.
// With 10x hold time vs transition time:
//   Total units: (6 holds × 10) + (6 transitions × 1) = 60 + 6 = 66 units
//   Each transition = 100/66 = 1.515%
//   Each hold = 10 × 1.515% = 15.152%
const slideTrack: string = keyframes(`
  0% {
    transform: translate3d(0, 0, 0);
  }
  15.15% {
    transform: translate3d(0, 0, 0);
  }
  16.67% {
    transform: translate3d(0, -1.2em, 0);
  }
  31.82% {
    transform: translate3d(0, -1.2em, 0);
  }
  33.33% {
    transform: translate3d(0, -2.4em, 0);
  }
  48.48% {
    transform: translate3d(0, -2.4em, 0);
  }
  50% {
    transform: translate3d(0, -3.6em, 0);
  }
  65.15% {
    transform: translate3d(0, -3.6em, 0);
  }
  66.67% {
    transform: translate3d(0, -4.8em, 0);
  }
  81.82% {
    transform: translate3d(0, -4.8em, 0);
  }
  83.33% {
    transform: translate3d(0, -6em, 0);
  }
  98.48% {
    transform: translate3d(0, -6em, 0);
  }
  100% {
    transform: translate3d(0, -7.2em, 0);
  }
`);

const swapTrack = style({
  position: 'relative',
  display: {
    default: 'flex',
    '@media (prefers-reduced-motion: reduce)': 'none'
  },
  flexDirection: 'column',
  whiteSpace: 'nowrap',
  height: '[1.2em]',
  overflow: 'hidden',
  fontSize: '[1em]',
  willChange: 'transform'
});

const swapSizer = style({
  display: {
    default: 'none',
    '@media (prefers-reduced-motion: reduce)': 'block'
  },
  whiteSpace: 'nowrap'
});

const swapRow = style({
  animation: slideTrack,
  animationDuration: 10000,
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
  lineHeight: '[1.2]',
  height: '[1.2em]'
});

export function Home({currentPage}: {currentPage: Page}) {
  let headingId = useId();
  return (
    <body
      className={style({
        margin: 0
      })}
      style={{
        backgroundImage: `url(${bg}), linear-gradient(0deg,#7154fa,#eb1000)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100%'
      }}>
      <HomeHeader />
      <header aria-labelledby={headingId} className={style({marginX: 'auto', paddingX: {default: 16, sm: 40}, paddingY: 96, maxWidth: 1024, isolation: 'isolate'})}>
        <ReleaseLink />
        <HomeH1 id={headingId}>
          <span className={swapWrapper}>Build apps with&nbsp;</span>
          <span className={swapWrapper}>
            <div className={swapTrack}>
              <span className={swapRow}>polish</span>
              <span className={swapRow}>speed</span>
              <span className={swapRow}>ease</span>
              <span className={swapRow}>accessibility</span>
              <span className={swapRow}>consistency</span>
              <span className={swapRow}>React Spectrum</span>
              <span className={swapRow} aria-hidden>polish</span>
            </div>
            <span className={swapSizer} aria-hidden>React Spectrum</span>
          </span>
        </HomeH1>
        <p className={style({font: {default: 'body-2xl', md: 'body-3xl'}, marginY: 0, color: 'white', textWrap: 'balance'})}>React Spectrum empowers you to build high quality, accessible, cohesive apps with Adobe's signature design.</p>
        <div className={style({display: 'flex', gap: 16, flexDirection: {default: 'column', sm: 'row'}, marginTop: 32, marginBottom: 96})}>
          <LinkButton size="XL" staticColor="white" href="getting-started">Get started</LinkButton>
          <SearchMenuWrapperServer currentPage={currentPage}>
            <Button size="XL" staticColor="white" variant="secondary">Explore components</Button>
          </SearchMenuWrapperServer>
        </div>
        <section aria-label="Example app" className={style({height: 'calc(100svh - 24px)', maxHeight: size(600)})}>
          <ExampleApp showArrows />
        </section>
      </header>
      <main className={style({marginX: 'auto', paddingX: {default: 16, sm: 40}, maxWidth: 1600, isolation: 'isolate'})}>
        <Section
          title="Build Once. Adapt Everywhere."
          description="React Spectrum makes interfaces more accessible, flexible, and maintainable, giving users a seamless experience no matter where they are.">
          <Feature
            title="Dark mode"
            description="Deliver effortless light and dark mode support with no extra styling needed."
            illustration={<Lightbulb />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 4'}})}>
            <DarkMode />
          </Feature>
          <Feature
            title="Touch friendly"
            description="Components automatically scale and adapt for touch or pointer input, ensuring a smooth experience on any device."
            illustration={<Interaction />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 2'}})}>
            <Mobile />
          </Feature>
          <Feature
            title="Global ready by default"
            description="Components automatically mirror their layout and format text for different languages, currencies, dates, and locales."
            illustration={<Translate />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3'}})}>
            <Provider
              locale="ar-AE"
              styles={style({
                height: 300,
                containerType: 'inline-size',
                margin: {
                  default: -16,
                  sm: 0
                },
                marginTop: 0,
                '--app-frame-radius-top': {
                  type: 'borderTopStartRadius',
                  value: {
                    default: 'none',
                    sm: 'lg'
                  }
                }
              })}>
              <AppFrame />
            </Provider>
          </Feature>
          <Feature
            title="Reduce motion options"
            description="Component animations and transitions automatically adjust for users who prefer less motion, keeping your UI comfortable and inclusive."
            illustration={<Animation />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3'}})}>
            <ReduceMotion />
          </Feature>
          {/* <Feature
            title="Space aware"
            description="TagGroup with collapsing"
            illustration={<Ruler />}
            style={{gridColumn: 'span 6'}}>
            <Collapsing />
          </Feature> */}
          <Feature
            title="High contrast mode"
            description="Support for high contrast mode is included, ensuring a clear and readable experience based on preference."
            illustration={<Accessibility />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 2'}})}>
            <HCM />
          </Feature>
          <Feature
            title="Adaptive font sizes"
            description="Fonts scale automatically according to user preferences and screen size using rem-based typography, allowing your text to scale naturally."
            illustration={<TextIcon />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 4'}})}>
            <Rems />
          </Feature>
        </Section>
        {/* We will add this section back after we have a few more things (e.g. dnd) */}
        {/* <Section title="Motion that makes sense"
          description="Every interaction — from button presses to drag-and-drop — is polished, fast, and consistent across platforms. ">
          <Feature
            title="Press scaling"
            description="Components respond instantly to user input, with smooth animations and transitions that feel natural and without extra code."
            illustration={<Interaction />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 2'}})}>
            <PressAnimation />
          </Feature>
          <Feature
            title="Submenus"
            description="Description"
            illustration={<Cursor />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 4'}})}>
            <SubmenuAnimation />
          </Feature>
        </Section> */}
        <Section title="Everything you need to build beautiful apps." description="Bring your interface to life with expressive icons, Spectrum colors, and rich illustrations. Every detail works together to make your product look polished and on-brand.">
          <Feature
            title="Icons"
            description={<>With hundreds of Spectrum icons to choose from, use our <Link href="icons" variant="secondary">icon search</Link> to find the right icon for the right experience.</>}
            illustration={<VectorDraw />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3'}})}>
            <Icons />
          </Feature>
          <Feature
            title="Illustrations"
            description={<>Rich illustrations help bring your interface to life. Use our <Link href="illustrations" variant="secondary">illustration search</Link> to find the right illustration for your product.</>}
            illustration={<IllustrationIcon />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3'}})}>
            <Illustrations />
          </Feature>
        </Section>
        <Section
          title={<>Rapidly style custom components with Style Macros.</>}
          description={<>Easily use Spectrum tokens like colors, spacing, and typography in your own custom components with style macros. Styles are <strong>colocated</strong> with your component code, allowing you to <strong>develop more efficiently</strong> and <strong>refactor with confidence</strong> – no more CSS conflicts or specificity issues. Style macros generate atomic CSS at build time, so you get tiny bundle sizes and fast runtime performance.</>}>
          <Feature
            title="Colors"
            description="Convenient access to the full range of Spectrum color tokens."
            illustration={<Color />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 2'}})}>
            <ColorScales />
          </Feature>
          <Feature
            title="Typography"
            description="Use the predefined type styles to draw attention and create consistent hierarchy."
            illustration={<TextIcon />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 2'}})}>
            <Typography />
          </Feature>
          <Feature
            title="Object styles"
            description="Apply Spectrum’s foundational design principles using object-style tokens."
            illustration={<Shapes />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 2'}})}>
            <ObjectStyles />
          </Feature>
          <Feature
            title="States and variants"
            description="Define the states for your custom components all in one place using Spectrum tokens."
            illustration={<Layers />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3'}})}>
            <States />
          </Feature>
          <Feature
            title="Reusable utilities"
            description="Use macros to create reusable style utilities for your own components."
            illustration={<CodeBrackets />}
            styles={style({gridColumnStart: {default: 'span 6', xl: 'span 3'}})}>
            <div className={style({display: 'flex', flexDirection: 'column', gap: 16, flexGrow: 1, justifyContent: 'space-between'})}>
            <div
              className={style({
                backgroundColor: 'layer-2',
                boxShadow: 'elevated',
                padding: {
                  default: 16,
                  sm: 24
                },
                borderRadius: {
                  default: 'none',
                  sm: 'lg'
                },
                overflow: 'auto',
                marginX: {
                  default: -16,
                  sm: 0
                }
              })}>
              <h4 className={style({font: 'title', marginTop: 0})}>Button.tsx</h4>
              <Pre><Code lang="tsx">{`import {style, focusRing} from '@react-spectrum/s2/style' with {type: 'macro'};
import {hstack} from './style-utils' with {type: 'macro'};

const buttonStyle = style({
  ...focusRing(),
  ...hstack(4)
});`}</Code></Pre>
            </div>
            <div
              className={style({
                backgroundColor: 'layer-2',
                boxShadow: 'elevated',
                padding: {
                  default: 16,
                  sm: 24
                },
                borderRadius: {
                  default: 'none',
                  sm: 'lg'
                },
                overflow: 'auto',
                margin: {
                  default: -16,
                  sm: 0
                },
                marginTop: 0
              })}>
              <h4 className={style({font: 'title', marginTop: 0})}>style-utils.ts</h4>
              <Pre><Code lang="tsx">{`export function hstack(gap: number) {
  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap
  };
}`}</Code></Pre>
            </div>
            </div>
          </Feature>
          <Feature
            title="Responsive design"
            description="Adapt your application for any screen size using our built-in breakpoints, or define your own."
            illustration={<Phone />}
            style={{gridColumn: 'span 6'}}>
            <Responsive />
          </Feature>
        </Section>
        <Section
          title="Built for modern development and the modern web."
          description="With AI-ready documentation, server side and runtime performance optimizations, React Spectrum helps you build modern, scalable apps without compromise.">
          <Feature
            title="AI-ready"
            description="Comprehensive markdown docs, llms.txt, and an agent-friendly MCP server."
            illustration={<Sparkles />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 2'}})}>

          </Feature>
          <Feature
            title="SSR"
            description="Server-side rendering and React Server Components support maximize Core Web Vitals."
            illustration={<Server />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 2'}})}>

          </Feature>
          <Feature
            title="Small bundle"
            description="Aggressive tree-shaking and atomic CSS produce smaller bundles and faster runtime performance."
            illustration={<SpeedFast />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 2'}})}>

          </Feature>
        </Section>
        <section className={style({paddingY: 64})}>
          <h2 className={style({font: 'heading-2xl', color: 'white'})}>Ready to get started?</h2>
          <div className={style({display: 'flex', gap: 16, flexDirection: {default: 'column', sm: 'row'}})}>
            <LinkButton size="XL" staticColor="white" href="getting-started">Install and setup</LinkButton>
            <SearchMenuWrapperServer currentPage={currentPage}>
              <Button size="XL" staticColor="white">Explore components</Button>
            </SearchMenuWrapperServer>
          </div>
        </section>
      </main>
      <footer
        className={style({
          maxWidth: 1600,
          marginX: 'auto',
          marginTop: 32,
          paddingY: 12
        })}>
        <Divider size="S" staticColor="white" />
        <ul
          className={style({
            display: 'flex',
            justifyContent: 'end',
            flexWrap: 'wrap',
            padding: 0,
            margin: 0,
            marginTop: 16,
            font: 'body-2xs',
            listStyleType: 'none',
            color: 'white'
          })}>
          <li>Copyright © {new Date().getFullYear()} Adobe. All rights reserved.</li>
          <li><Link isQuiet staticColor="white" href="//www.adobe.com/privacy.html" target="_blank">Privacy</Link></li>
          <li><Link isQuiet staticColor="white" href="//www.adobe.com/legal/terms.html" target="_blank">Terms of Use</Link></li>
          <li><Link isQuiet staticColor="white" href="//www.adobe.com/privacy/cookies.html" target="_blank">Cookies</Link></li>
          <li><Link isQuiet staticColor="white" href="//www.adobe.com/privacy/ca-rights.html" target="_blank">Do not sell my personal information</Link></li>
        </ul>
      </footer>
    </body>
  );
}

function getTitleTextWidth(text: string) {
  let width = 0;
  for (let c of text) {
    let w = letters[c];
    if (w != null) {
      width += w;
    }
  }

  return width;
}

function HomeH1(props) {
  let {children, ...otherProps} = props;
  return (
    <h1
      {...otherProps}
      style={{'--width-per-em': getTitleTextWidth('React Spectrum')} as any}
      className={style({
        font: 'heading-3xl',
        // This variable is used to calculate the line height.
        // Normally it is set by the fontSize, but the custom clamp prevents this.
        '--fs': {
          type: 'opacity',
          value: 'pow(1.125, 10)' // heading-2xl
        },
        '--headingFontSize': {
          type: 'width',
          value: `[round(pow(1.125, ${fontSizeToken('heading-size-xxxl')}) * var(--s2-font-size-base, 14) / 16 * 1rem, 1px)]`
        },
        // On mobile, adjust heading to fit in the viewport, and clamp between a min and max font size.
        fontSize: `clamp(${35 / 16}rem, (100vw - 40px) / var(--width-per-em), var(--headingFontSize))`,
        marginY: 0,
        color: 'white'
      })}>
      {children}
    </h1>
  )
}

function Section({title, description, children}: any) {
  let headingId = useId();
  return (
    <section aria-labelledby={headingId} className={style({paddingY: 64})}>
      <h2 id={headingId} className={style({font: {default: 'heading-xl', sm: 'heading-2xl'}, color: 'white'})}>{title}</h2>
      <p className={style({font: {default: 'body-xl', sm: 'body-2xl'}, color: 'white', maxWidth: {default: 'full', lg: '75%'}, marginBottom: 64, textWrap: 'balance'})}>{description}</p>
      <div className={style({display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16})}>
        {children}
      </div>
    </section>
  );
}

function Feature({title, description, illustration, children, style: styleProp, styles = ''}: any) {
  let headingId = useId();
  return (
    <section aria-labelledby={headingId} className={mergeStyles(container, styles)} style={styleProp}>
      <div className={style({display: 'flex', flexDirection: {default: 'column', sm: 'row'}, gap: 12, alignItems: 'start'})}>
        <div style={{marginTop: -12, marginInlineStart: -12}}>
          {illustration}
        </div>
        <div className={style({display: 'flex', flexDirection: 'column', rowGap: 4})}>
          <h3 id={headingId} className={style({font: 'heading', marginY: 0})}>{title}</h3>
          <p className={style({font: 'body-lg', marginY: 0})}>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ColorScales() {
  const size = 'auto';
  let red = getColorScale('red', size);
  let orange = getColorScale('orange', size);
  let yellow = getColorScale('yellow', size);
  let celery = getColorScale('celery', size);
  let green = getColorScale('green', size);
  let seafoam = getColorScale('seafoam', size);
  let turquoise = getColorScale('turquoise', size);
  let cyan = getColorScale('cyan', size);
  let blue = getColorScale('blue', size);
  let indigo = getColorScale('indigo', size);
  let purple = getColorScale('purple', size);
  let fuchsia = getColorScale('fuchsia', size);
  let magenta = getColorScale('magenta', size);
  let pink = getColorScale('pink', size);

  let scales = [red, orange, yellow, celery, green, seafoam, turquoise, cyan, blue, indigo, purple, fuchsia, magenta, pink];
  return <Colors scales={scales} />
}
