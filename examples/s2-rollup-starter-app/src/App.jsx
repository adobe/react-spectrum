import React from 'react';
import "@react-spectrum/s2/page.css";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import { Button } from "@react-spectrum/s2";

function App() {
  return (
    <main>
      <Button
        styles={style({
          marginStart: 16,
        })}
      >
        Hello Spectrum 2!
      </Button>
    </main>
  );
}

export default App;
