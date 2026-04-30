import AlertTriangle from '@react-spectrum/s2/icons/AlertTriangle';
import { iconStyle } from '@react-spectrum/s2/style' with {type: 'macro'};

const Icon = () => {
  return (
    <AlertTriangle
      styles={iconStyle({ size: 'M', color: 'negative' })}
    />
  );
};

export default Icon;