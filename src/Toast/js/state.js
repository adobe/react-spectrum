export const TOAST_CONTAINERS = new Map;
export let TOAST_PLACEMENT = 'top center';

export function setToastPlacement(placement) {
  TOAST_PLACEMENT = placement;

  for (let container of TOAST_CONTAINERS.values()) {
    container.setState({placement});
  }
}
