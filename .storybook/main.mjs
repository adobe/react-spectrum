import {fileURLToPath} from 'node:url';

const localAddon = rel => fileURLToPath(import.meta.resolve(rel));

export default {
  stories: [
    '../packages/@{react-aria,react-stately,spectrum-icons}/*/stories/*.stories.{js,jsx,ts,tsx}',
    '../packages/@react-spectrum/!(s2)/stories/*.stories.{js,jsx,ts,tsx}',
    '../packages/@adobe/react-spectrum/stories/*/*.stories.{js,jsx,ts,tsx}',
    '../packages/react-aria/stories/*/*.stories.{js,jsx,ts,tsx}',
    '../packages/react-stately/stories/*/*.stories.{js,jsx,ts,tsx}',
    '../packages/react-aria-components/stories/*.stories.{js,jsx,ts,tsx}'
  ],

  addons: [
    'storybook/actions',
    '@storybook/addon-a11y',
    '@vueless/storybook-dark-mode',
    localAddon('./custom-addons/provider'),
    localAddon('./custom-addons/descriptions'),
    localAddon('./custom-addons/theme'),
    localAddon('./custom-addons/strictmode'),
    localAddon('./custom-addons/scrolling')
  ],

  typescript: {
    check: false,
    reactDocgen: false
  },

  framework: {
    name: 'storybook-react-parcel',
    options: {}
  },

  core: {
    disableWhatsNewNotifications: true
  },

  features: {
    sidebarOnboardingChecklist: false
  }
};
