const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Spectrum Example</title>
  </head>
  <body>
      <style>
        body {
          min-height: 100vh;
          margin: 0;
        }
        #app {
          min-height: 100vh;
        }
        #app > div {
          padding: 40px;
          min-height: calc(100vh - 80px);
        }
      </style>
    <div id="app"></div>
  </body>
</html>`;

const sandpackImports = `import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackThemeProvider,
  useActiveCode,
  useSandpack,
  useSandpackNavigation,
  UnstyledOpenInCodeSandboxButton
} from "@codesandbox/sandpack-react";
import Copy from '@spectrum-icons/workflow/Copy';
import Edit from '@spectrum-icons/workflow/Edit';
import Refresh from '@spectrum-icons/workflow/Refresh';
import LinkOut from '@spectrum-icons/workflow/LinkOut';
import {ActionGroup, Item} from '@adobe/react-spectrum';`;

const formatExampleCode = (code, fixIndention = false) => fixIndention ? code.replace(/`/g, '\\`').replace(/\n/g, '\n    ').trim() : code.replace(/`/g, '\\`').trim();

const formatImports = (imports) => imports.join('\n').replace(/`/g, '\\`');

const getIndexFile = (componentName, colorScheme = 'light') => `import React from "react";
import { createRoot } from "react-dom/client";
import { Provider, defaultTheme } from "@adobe/react-spectrum";
import ${componentName} from "./${componentName}";

const container = document.getElementById("app");
const root = createRoot(container);
root.render(
  <Provider theme={defaultTheme} colorScheme="${colorScheme}">
    <${componentName} />
  </Provider>
);
`;

const getExampleFile = (exampleCode, imports) => `${formatImports(imports)}

export default function Example() {
  return (
    ${formatExampleCode(exampleCode, true)}
  );
}
`;

const getNamedExampleFile = (exampleCode, imports) => `${formatImports(imports)}

export default ${formatExampleCode(exampleCode)}
`;

const getExampleSandpack = (id, provider, code, imports, componentName, named = false) => `
function CustomSandpack(props) {
  const { code } = useActiveCode();
  const { sandpack } = useSandpack();
  const { refresh } = useSandpackNavigation();

  React.useEffect(() => {
    // Detect when dark/light mode is changed and update index.js file.
    const observer = new MutationObserver((mutations) => {
      if (mutations[0].target.style.cssText.includes('dark')) {
        sandpack.updateFile('/index.js', props.indexFiles.dark);
      } else {
        sandpack.updateFile('/index.js', props.indexFiles.light);
      }
    });

    observer.observe(document.documentElement, {attributeFilter: ['style']});

    return () => {
      observer.disconnect();
    }
  }, []);

  const openInCodeSandboxButtonRef = React.useRef(null);

  return (
    <SandpackLayout
      style={{ flexDirection: "column", border: 'none' }}>
      <SandpackThemeProvider
        theme={{
          colors: {
            surface1: 'var(--hljs-background)',
            surface2: 'var(--hljs-background)',
            surface3: 'var(--hljs-background)',
            clickable: 'var(--hljs-color)',
            base: 'var(--hljs-color)',
            activeBackground: 'var(--hljs-background)',
            hover: 'var(--hljs-color)'
          },
          syntax: {
            comment: 'var(--hljs-comment-color)',
            definition: 'var(--hljs-section-color)',
            keyword: 'var(--hljs-keyword-color)',
            plain: 'var(--hljs-color)', // Unsure
            property: 'var(--hljs-attribute-color)',
            punctuation: 'var(--hljs-color)',
            static: 'var(--hljs-literal-color)',
            string: 'var(--hljs-string-color)',
            tag: 'var(--hljs-section-color)'
          }
        }}
      >
        <SandpackCodeEditor readOnly showReadOnly={false} showTabs={false} wrapContent={true} style={{height: 'auto'}} />
        <SandpackPreview
          style={{display: 'block', background: 'none', border: 'none'}}
          actionsChildren={
            <ActionGroup
              isQuiet
              buttonLabelBehavior="hide"
              onAction={(key) => {
                if (key === 'copy') {
                  navigator.clipboard.writeText(code.trim());
                } else if (key === 'edit') {
                  refresh()
                } else if (key === 'open') {
                  openInCodeSandboxButtonRef.current.firstChild.click();
                }
              }}
              >
              <Item key="copy">
                <Copy size="S" />
                <Text>Copy code</Text>
              </Item>
              <Item key="refresh">
                <Refresh size="S" />
                <Text>Refresh code</Text>
              </Item>
              <Item key="open">
                <LinkOut size="S" />
                <Text>Open in CodeSandbox</Text>
              </Item>
            </ActionGroup>
          }
          showRefreshButton={false}
          showOpenInCodeSandbox={false} />
          <div ref={openInCodeSandboxButtonRef} style={{ display: "none" }}>
            <UnstyledOpenInCodeSandboxButton>
              Open in CodeSandbox
            </UnstyledOpenInCodeSandboxButton>
          </div>
        </SandpackThemeProvider>
    </SandpackLayout>
  );
}

ReactDOM.render(
  <${provider} UNSAFE_style={{padding: 0}}>
    <SandpackProvider
      files={{
        "/${componentName}.js":
          {
            code: \`${named ? getNamedExampleFile(code, imports) : getExampleFile(code, imports)}\`,
            active: true
          },
        "/index.js": localStorage.theme === 'dark' ? \`${getIndexFile(componentName, 'dark')}\` : \`${getIndexFile(componentName, 'light')}\`,
        "/index.html": \`${indexHtml}\`
      }}
      customSetup={{
        dependencies: {
          "@adobe/react-spectrum": "latest",
          react: "^18.0.0",
          "react-dom": "^18.0.0",
        },
        entry: "/index.js",
        main: "/index.html",
        environment: "create-react-app",
      }}>
      <CustomSandpack indexFiles={{light: \`${getIndexFile(componentName, 'light')}\`, dark: \`${getIndexFile(componentName, 'dark')}\` }} />
    </SandpackProvider>
  </${provider}>,
  document.getElementById("sandpack-${id}"));`;

const getActions = (id) => `
function ExampleActions(props) {

  return (
    <ActionGroup
      isQuiet
      buttonLabelBehavior="hide"
      onAction={(key) => {
        if (key === 'copy') {
          let code = document.querySelectorAll('.${id}')[0].textContent;
          navigator.clipboard.writeText(code.trim());
        } else if (key === 'edit') {
          document.getElementById('sandpack-${id}').style.display = 'block';
          document.querySelectorAll('.${id}').forEach(el => el.style.display = 'none');
          document.getElementById('${id}').style.display = 'none';
        }
      }}
      UNSAFE_className="example-actions"
      >
      <Item key="edit">
        <Edit size="S" />
        <Text>Edit code</Text>
      </Item>
      <Item key="copy">
        <Copy size="S" />
        <Text>Copy code</Text>
      </Item>
    </ActionGroup>
  );
}`; 

module.exports = {getExampleSandpack, sandpackImports, getActions};

