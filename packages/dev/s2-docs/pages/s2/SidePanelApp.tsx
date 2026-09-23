'use client';
import {ActionButton} from '@react-spectrum/s2/ActionButton';
import {ActionMenu, MenuItem as ActionMenuItem} from '@react-spectrum/s2/ActionMenu';
import {Avatar} from '@react-spectrum/s2/Avatar';
import ChevronDoubleLeft from '@react-spectrum/s2/icons/ChevronDoubleLeft';
import ChevronDoubleRight from '@react-spectrum/s2/icons/ChevronDoubleRight';
import {Divider} from '@react-spectrum/s2/Divider';
import {
  Header,
  Heading,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Text
} from '@react-spectrum/s2/Menu';
import {Popover} from '@react-spectrum/s2/Popover';
import React, {ReactNode, useContext, useState} from 'react';
import {RouterProvider} from 'react-aria-components';
import {SearchField} from '@react-spectrum/s2/SearchField';
import Settings from '@react-spectrum/s2/icons/Settings';
import {SidePanelContext} from '@react-spectrum/s2/SideNav';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

interface SidePanelAppProps {
  /**
   * Rendered with the currently selected route. Return a `SidePanel` with `gridArea: 'sidebar'` in
   * its `styles`.
   */
  children: ({selectedRoute}: {selectedRoute: string}) => ReactNode;
  /** The route that is selected on first render. */
  defaultSelectedRoute: string;
  /**
   * Whether the side panel is currently collapsed. Shows a profile menu in the header when
   * provided.
   */
  isCollapsed?: boolean;
  /** Handler that is called when the profile menu's expand/collapse option is selected. */
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

/**
 * A user avatar and account menu, shown at the bottom of the side panel. It reads the panel's
 * animation state from `SidePanelContext` so its label fades out before the panel narrows, and
 * only fades back in once the panel has finished widening.
 */
export function AccountFooter(): ReactNode {
  let {isCollapsed = false, isHidden = false, isReady = false} = useContext(SidePanelContext);

  return (
    <div
      className={style({
        display: 'flex',
        flexDirection: {default: 'row', isCollapsed: 'column-reverse'},
        alignItems: {default: 'center', isCollapsed: 'start'},
        justifyContent: 'start',
        gap: 8,
        paddingX: {default: 8, isCollapsed: 0},
        paddingY: 8,
        flexShrink: 0
      })({isCollapsed})}>
      <Avatar
        alt="Jordan Rivera"
        src="https://i.imgur.com/xIe7Wlb.png"
        size={24}
        styles={style({marginStart: {isCollapsed: 4}})({isCollapsed})}
      />
      <div
        className={style({
          opacity: {default: 1, isHidden: 0, '@starting-style': 0},
          minWidth: 0,
          flexGrow: 1,
          transition: {default: 'none', isReady: {default: '[opacity, display]', isHidden: 'none'}},
          transitionBehavior: 'allow-discrete',
          transitionDuration: 150
        })({isHidden, isReady})}>
        <Text
          styles={style({font: 'ui', display: {default: 'block', isHidden: 'none'}})({isHidden})}>
          Jordan Rivera
        </Text>
      </div>
      <ActionMenu aria-label="Account" isQuiet direction={isCollapsed ? 'right' : 'top'}>
        <ActionMenuItem>Profile</ActionMenuItem>
        <ActionMenuItem>Settings</ActionMenuItem>
        <ActionMenuItem>Sign out</ActionMenuItem>
      </ActionMenu>
    </div>
  );
}

interface ProfileMenuProps {
  isCollapsed: boolean;
  onCollapsedChange: (isCollapsed: boolean) => void;
}

function ProfileMenu({isCollapsed, onCollapsedChange}: ProfileMenuProps) {
  return (
    <MenuTrigger>
      <ActionButton isQuiet aria-label="Account">
        <Avatar src="https://i.imgur.com/xIe7Wlb.png" />
      </ActionButton>
      <Popover hideArrow placement="bottom end">
        <div className={style({paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 12})}>
          <div className={style({display: 'flex', gap: 12, alignItems: 'center', marginX: 12})}>
            <Avatar src="https://i.imgur.com/xIe7Wlb.png" size={56} />
            <div>
              <div className={style({font: 'title'})}>Thor Odenson</div>
              <div className={style({font: 'ui', color: 'body'})}>thor@example.com</div>
            </div>
          </div>
          <Divider styles={style({marginX: 12})} />
          <Menu aria-label="Account">
            <MenuSection>
              <Header>
                <Heading>Settings</Heading>
              </Header>
              <MenuItem onAction={() => onCollapsedChange(!isCollapsed)}>
                {isCollapsed ? <ChevronDoubleRight /> : <ChevronDoubleLeft />}
                <Text slot="label">
                  {isCollapsed ? 'Expand side panel' : 'Collapse side panel'}
                </Text>
              </MenuItem>
              <MenuItem>
                <Settings />
                <Text slot="label">Preferences</Text>
              </MenuItem>
            </MenuSection>
            <MenuSection aria-label="Session">
              <MenuItem>Sign out</MenuItem>
            </MenuSection>
          </Menu>
        </div>
      </Popover>
    </MenuTrigger>
  );
}

/**
 * A miniature application frame used by the SidePanel examples. It provides a header,
 * a grid area for the panel, and a main content area, and keeps track of the selected
 * route so links in the SideNav don't perform a real navigation.
 */
export function SidePanelApp(props: SidePanelAppProps): ReactNode {
  let {children, defaultSelectedRoute, isCollapsed, onCollapsedChange} = props;
  let [selectedRoute, setSelectedRoute] = useState(defaultSelectedRoute);

  return (
    <RouterProvider navigate={setSelectedRoute}>
      <div
        className={style({
          width: 'full',
          maxWidth: 560,
          height: 400,
          display: 'grid',
          gridTemplateAreas: ['header header', 'sidebar main'],
          gridTemplateColumns: ['auto', '1fr'],
          gridTemplateRows: ['auto', '1fr'],
          backgroundColor: 'layer-1',
          borderRadius: 'lg',
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: 'gray-200',
          overflow: 'hidden'
        })}>
        <div
          className={style({
            gridArea: 'header',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingX: 16,
            paddingY: 12
          })}>
          <div className={style({font: 'title-sm'})}>Acme Cloud</div>
          <div className={style({flexGrow: 1, display: 'flex', justifyContent: 'center'})}>
            <SearchField aria-label="Search" size="S" styles={style({maxWidth: 200})} />
          </div>
          {onCollapsedChange ? (
            <ProfileMenu isCollapsed={!!isCollapsed} onCollapsedChange={onCollapsedChange} />
          ) : (
            <Avatar alt="Your account" src="https://i.imgur.com/xIe7Wlb.png" size={24} />
          )}
        </div>
        {children({selectedRoute})}
        <div
          className={style({
            gridArea: 'main',
            backgroundColor: 'layer-2',
            borderTopStartRadius: 'lg',
            padding: 16,
            font: 'ui',
            color: 'neutral-subdued'
          })}>
          {selectedRoute}
        </div>
      </div>
    </RouterProvider>
  );
}
