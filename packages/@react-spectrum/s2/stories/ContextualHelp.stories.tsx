import {Content, ContextualHelp, Footer, Heading, Text} from '../src';
import {Link} from '../src/Link';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof ContextualHelp> = {
  component: ContextualHelp,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    onOpenChange: {table: {category: 'Events'}}
  },
  title: 'ContextualHelp'
};

export default meta;
type Story = StoryObj<typeof ContextualHelp>;

export const Example: Story = {
  render: (args) => {
    return (
      <ContextualHelp {...args}>
        <Heading>What is a segment?</Heading>
        <Content>
          <Text>
            Segments identify who your visitors are, what devices and services they
            use, where they navigated from, and much more.
          </Text>
        </Content>
        <Footer>
          <Link
            isStandalone
            href="https://experienceleague.adobe.com/en/docs/experience-manager-65/content/sites/administering/personalization/campaign-segmentation"
            target="_blank">Learn more about segments</Link>
        </Footer>
      </ContextualHelp>
    );
  }
};
