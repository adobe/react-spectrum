import {Checkbox} from 'react-aria-components';
import React from 'react';
import './styles.css';


export default {
  title: 'React Aria Components'
};

export const CheckboxExample = () => {
  return (
    <Checkbox>
      <div className="checkbox">
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <polyline points="1 9 7 14 15 4" />
        </svg>
      </div>
      Unsubscribe
    </Checkbox>
  );
};
