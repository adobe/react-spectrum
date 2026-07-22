import { style } from '@react-spectrum/s2/style' with {type: 'macro'};

const Card = () => {
  return (
    <div className={style({backgroundColor: 'cyan-400', color: 'magenta-400'})}>
      <h1>Card</h1>
    </div>
  );
};

export default Card;