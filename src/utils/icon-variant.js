export const getVariantIcon = (variant) => {
  switch (variant) {
    case 'error':
    case 'warning':
      return 'alert';
    case 'success':
      return 'checkCircle';
    case 'help':
      return 'helpCircle';
    case 'info':
      return 'infoCircle';
    case 'default':
      return null;
    default:
      throw new Error('Invalid icon variant - Must use error, warning, success, help, or info');
  }
};
