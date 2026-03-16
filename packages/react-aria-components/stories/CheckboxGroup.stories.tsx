import {Button, Checkbox, CheckboxGroup, FieldError, Form, Label} from 'react-aria-components';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import './styles.css';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components/CheckboxGroup',
  component: CheckboxGroup
} as Meta<typeof CheckboxGroup>;

export type CheckboxGroupStory = StoryObj<typeof CheckboxGroup>;

export const CheckboxGroupExample: CheckboxGroupStory = {
  render: () => (
    <CheckboxGroup>
      <Label>Favorite sports</Label>
      <Checkbox value="soccer">
        <div className="checkbox" aria-hidden="true">
          <svg viewBox="0 0 18 18"><polyline points="1 9 7 14 15 4" /></svg>
        </div>
        Soccer
      </Checkbox>
      <Checkbox value="baseball">
        <div className="checkbox" aria-hidden="true">
          <svg viewBox="0 0 18 18"><polyline points="1 9 7 14 15 4" /></svg>
        </div>
        Baseball
      </Checkbox>
      <Checkbox value="basketball">
        <div className="checkbox" aria-hidden="true">
          <svg viewBox="0 0 18 18"><polyline points="1 9 7 14 15 4" /></svg>
        </div>
        Basketball
      </Checkbox>
      <FieldError className={styles.errorMessage} />
    </CheckboxGroup>
  )
};

export const CheckboxGroupSubmitExample: CheckboxGroupStory = {
  render: () => (
    <Form>
      <CheckboxGroup isRequired>
        <Label>Favorite sports</Label>
        <Checkbox value="soccer">
          <div className="checkbox" aria-hidden="true">
            <svg viewBox="0 0 18 18"><polyline points="1 9 7 14 15 4" /></svg>
          </div>
          Soccer
        </Checkbox>
        <Checkbox value="baseball">
          <div className="checkbox" aria-hidden="true">
            <svg viewBox="0 0 18 18"><polyline points="1 9 7 14 15 4" /></svg>
          </div>
          Baseball
        </Checkbox>
        <Checkbox value="basketball">
          <div className="checkbox" aria-hidden="true">
            <svg viewBox="0 0 18 18"><polyline points="1 9 7 14 15 4" /></svg>
          </div>
          Basketball
        </Checkbox>
      </CheckboxGroup>
      <Button type="submit">Submit</Button>
      <Button type="reset">Reset</Button>
    </Form>
  )
};
