export function useTabList(props, tabListState) {
  let {
    orientation = 'horizontal'
  } = props;

  return {
    tabListProps: {
      role: 'tablist',
      'aria-orientation': orientation
    }
  };
}

export function useTab(props) {
  return {
    tabProps: {
      'aria-selected': props.selected,
      tabIndex: props.selected ? 0 : -1,
      role: 'tab',
      onClick: () => props.onSelect(),
      onKeyPress: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          props.onSelect();
        }
      }
    }
    // keyboardActivation?
  };
}
