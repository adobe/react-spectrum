
import {Button} from '@react-spectrum/button';
import {Meta, Story} from '@storybook/react';
import React, {useEffect, useRef, useState} from 'react';
import {useResizeObserver} from '../src';

export default {
  title: 'useResizeObserver'
} as Meta;

const Template: Story<any> = () => (
  <App />
);

export const UseResizeObserverLoopLimit = Template.bind({});
UseResizeObserverLoopLimit.args = {};

const animalSet = ['🐰', '🦊', '🐻', '🐭', '🐼', '🐸'];
function App() {
  let ref = useRef();
  let index = useRef(0);
  let [animals, setAnimals] = useState([animalSet[0]]);

  function insertAnimal() {
    index.current = index.current + 1;
    setAnimals(prev => [...prev, animalSet[index.current % animalSet.length]]);
  }

  useEffect(() => {
    let onError = (err) => {
      console.log(err);
    };
    window.addEventListener('error', onError);
    return () => {
      window.removeEventListener('error', onError);
    };
  }, []);

  let onResize = () => {
    const {width} = ref.current.getBoundingClientRect();

    ref.current.style.height = `${width}px`;
  };

  useResizeObserver({onResize, ref});

  return (
    <>
      <div ref={ref} id="red-box">
        {animals}
      </div>
      <Button variant="primary" onPress={insertAnimal}>Insert Next Animal</Button>
    </>
  );
}
