import "@react/experimental-s2/page.css";
import { style } from "@react/experimental-s2/style" with { type: "macro" };
import { Button } from "@react/experimental-s2";

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