import { fileURLToPath } from "node:url";

const localAddon = (rel) => fileURLToPath(import.meta.resolve(rel));

export default {
  stories: [
    '../packages/@{react-aria,react-stately,spectrum-icons}/*/stories/*.stories.{js,jsx,ts,tsx}',
    '../packages/@react-spectrum/!(s2)/stories/*.stories.{js,jsx,ts,tsx}',
    '../packages/react-aria-components/stories/*.stories.{js,jsx,ts,tsx}'
  ],
  addons: [
    'storybook/actions',
    '@storybook/addon-a11y',
    '@vueless/storybook-dark-mode',
    localAddon('./custom-addons/provider/register.js'),
    localAddon('./custom-addons/descriptions/register.js'),
    localAddon('./custom-addons/theme/register.js'),
    localAddon('./custom-addons/strictmode/register.js'),
    localAddon('./custom-addons/scrolling/register.js'),
  ],
  typescript: { check: false, reactDocgen: false },
  framework: { name: 'storybook-react-parcel', options: {} },
  core: { disableWhatsNewNotifications: true },
};
