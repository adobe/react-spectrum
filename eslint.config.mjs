import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const WARN = 1;
const ERROR = 2;

const ignores = [
    "packages/@react-aria/i18n/server",
    "packages/@spectrum-icons/color/**/*",
    "packages/@spectrum-icons/ui/**/*",
    "packages/@spectrum-icons/workflow/**/*",
    "packages/@spectrum-icons/illustrations/**/*",
    "packages/@spectrum-icons/express/**/*",
    "**/node_modules",
    "packages/*/*/dist",
    "packages/*/*/dist/**",
    "packages/*/*/i18n",
    "packages/*/*/i18n/**",
    "packages/react-aria/dist",
    "packages/react-aria/dist/**",
    "packages/react-aria/i18n",
    "packages/react-aria/i18n/**",
    "packages/react-aria-components/dist",
    "packages/react-aria-components/dist/**",
    "packages/react-aria-components/i18n",
    "packages/react-aria-components/i18n/**",
    "packages/react-stately/dist",
    "packages/react-stately/dist/**",
    "packages/dev/storybook-builder-parcel/preview.js",
    "packages/dev/optimize-locales-plugin/LocalesPlugin.d.ts",
    "examples/**/*",
    "starters/**/*",
    "scripts/icon-builder-fixture/**/*",
    "packages/@react-spectrum/s2/icon.d.ts",
    "packages/@react-spectrum/s2/spectrum-illustrations",
    "packages/dev/parcel-config-storybook/*",
    "packages/dev/parcel-resolver-storybook/*",
    "packages/dev/parcel-transformer-storybook/*",
    "packages/dev/storybook-builder-parcel/*",
    "packages/dev/storybook-react-parcel/*",
    "packages/dev/s2-docs/pages/**",
    "packages/dev/mcp/*/dist"
];

function createNoopPlugin(ruleNames) {
    return {
        rules: Object.fromEntries(
            ruleNames.map((ruleName) => [
                ruleName,
                {
                    create() {
                        return {};
                    }
                }
            ])
        )
    };
}

const directiveOnlyPlugins = {
    "@typescript-eslint": createNoopPlugin(["no-unused-vars"]),
    "jsx-a11y": createNoopPlugin([
        "alt-text",
        "anchor-has-content",
        "anchor-is-valid",
        "click-events-have-key-events",
        "label-has-associated-control",
        "media-has-caption",
        "no-noninteractive-element-interactions",
        "no-noninteractive-tabindex",
        "no-static-element-interactions",
        "role-has-required-aria-props"
    ]),
    monorepo: createNoopPlugin(["no-internal-import"]),
    react: createNoopPlugin(["react-in-jsx-scope"]),
    "rsp-rules": createNoopPlugin([
        "no-non-shadow-contains",
        "safe-event-target"
    ]),
    rulesdir: createNoopPlugin([
        "imports",
        "pure-render",
        "useLayoutEffectRule"
    ])
};

export default [
    {
        ignores,
        linterOptions: {
            reportUnusedDisableDirectives: "off"
        }
    },
    {
        files: ["packages/**/*.{js,jsx,ts,tsx}"],
        plugins: {
            ...directiveOnlyPlugins,
            "react-hooks": reactHooks
        },
        languageOptions: {
            parser: tseslint.parser,
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                    legacyDecorators: true
                }
            }
        },
        rules: {
            // Temporary ESLint fallback until Oxlint supports React Compiler rules.
            "react-hooks/config": ERROR,
            "react-hooks/error-boundaries": ERROR,
            "react-hooks/component-hook-factories": ERROR,
            "react-hooks/gating": ERROR,
            "react-hooks/globals": ERROR,
            "react-hooks/purity": ERROR,
            "react-hooks/set-state-in-effect": ERROR,
            "react-hooks/set-state-in-render": ERROR,
            "react-hooks/static-components": ERROR,
            "react-hooks/unsupported-syntax": WARN,
            "react-hooks/use-memo": ERROR,
            "react-hooks/incompatible-library": WARN
        }
    }
];
