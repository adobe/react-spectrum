export const getVariantIcon = (variant) => {
  switch(variant) {
    case 'error':
    case 'warning':
      return 'alert';
    case 'success':
      return 'checkCircle';
    case 'help':
      return 'helpCircle';
    case 'info':
      return 'infoCircle';
    default:
      return null;
  }
}
