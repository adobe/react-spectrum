import './button.css';
import { style } from '@react-spectrum/s2/style' with {type: 'macro'};

export interface ButtonProps {
  /**
   * Whether the button is primary
   * @default false
   */
  primary?: boolean;
  /**
   * Background color of the button
   */
  backgroundColor?: string;
  /**
   * Size of Button
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Label of the button
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

const Button = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  ...props
}: ButtonProps) => {
  const mode = primary ? 'demo-button--primary' : 'demo-button--secondary';
  return (
    <div className={style({backgroundColor: 'cyan-400', color: 'magenta-400'})}>
      <button
        type="button"
        className={['demo-button', `demo-button--${size}`, mode].join(' ')}
        {...props}
      >
        {label}
      </button>
    </div>
  );
};

export default Button;
