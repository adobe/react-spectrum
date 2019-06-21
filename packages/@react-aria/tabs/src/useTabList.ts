import React, {AllHTMLAttributes, HTMLAttributes, ReactElement} from 'react';
import {useId} from '@react-aria/utils/src/useId';

type Orientation = 'horizontal' | 'vertical';

interface AriaTabListProps {
  orientation?: 'horizontal' | 'vertical'
}

interface AriaTabProps {
  isDisabled?: boolean,
  isSelected?: boolean,
  onSelect?: () => void,
  id?: string
}

interface AriaTabsProps extends HTMLAttributes<HTMLElement>{
  children?: ReactElement | ReactElement[],
}

interface TabListAria {
  tabListProps: AllHTMLAttributes<HTMLElement>
}

interface TabAria {
  tabProps: AllHTMLAttributes<HTMLElement>
}

interface TabsAria {
  tabPanelProps: AllHTMLAttributes<HTMLElement>,
  tabsPropsArray: Array<AllHTMLAttributes<HTMLElement>>
}

export function useTabList(props: AriaTabListProps): TabListAria {
  let {
    orientation = 'horizontal' as Orientation
  } = props;

  return {
    tabListProps: {
      role: 'tablist',
      'aria-orientation': orientation
    }
  };
}

export function useTab(props: AriaTabProps): TabAria {
  let {
    isSelected,
    isDisabled,
    onSelect,
    id
  } = props;

  return {
    tabProps: {
      id: useId(id),
      'aria-selected': isSelected,
      'aria-disabled': isDisabled,
      tabIndex: isSelected ? 0 : -1,
      role: 'tab',
      onClick: () => isDisabled ? null : onSelect(),
      onKeyPress: (e) => {
        if (!isDisabled) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }
      }
    }
    // keyboardActivation?
  };
}

export function useTabs(props: AriaTabsProps, state: any): TabsAria {
  let selectedTabId;
  let tabPanelId = useId();
  let tabsPropsArray = [];

  React.Children.forEach(props.children, (child) => {
    let tabProps = {
      'aria-controls': tabPanelId
    };
    tabsPropsArray.push(tabProps);
    if (child && child.props.value === state.selectedItem) {
      selectedTabId = child.props.id;
    }
  });

  if (selectedTabId == null) {
    selectedTabId = React.Children.toArray(props.children)[0].props.id;
  }

  return {
    tabPanelProps: {
      'aria-labelledby': selectedTabId,
      tabIndex: 0,
      role: 'tabpanel',
      id: tabPanelId
    },
    tabsPropsArray
  };
}
