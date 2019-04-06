
export function useTabList(props, tabListState) {

  let {
    orientation = 'horizontal'
  } = props;

  return {
    tabListProps: {
      role: 'tablist',
      'aria-orientation': orientation
    },
    getTabProps: index => getTabProps(index, tabListState) //v3 todo Should we get the Tab props here too for disbled prop?
  }
}

function getTabProps(index, state) {
  return {
    'aria-selected': state.selectedIndex === index,
    tabIndex: state.selectedIndex === index ? 0 : -1,
    role: 'tab',
    onClick: () => state.setSelectedIndex(index),
    onKeyPress: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        state.setSelectedIndex(index);
      }
    }
    //keyboardActivation?
  }
}
