'use client';
import Settings from '@react-spectrum/s2/icons/Settings';
import Org from '@react-spectrum/s2/icons/Buildings';
import { style } from "@react-spectrum/s2/style" with { type: 'macro' };
import { Text, ActionButton, Avatar, MenuTrigger, Popover, Switch, Divider, Menu, MenuSection, SubmenuTrigger, MenuItem } from '@react-spectrum/s2';
import { useLocale } from 'react-aria';
import { useContext } from 'react';
import { useMediaQuery } from '@react-spectrum/utils';
import { PopoverContext } from 'react-aria-components';
import { HCMContext } from '../HCM';
import { ColorSchemeContext } from '../ExampleApp';

export function AccountMenu() {
  let {locale} = useLocale();
  let {colorScheme, setColorScheme} = useContext(ColorSchemeContext);
  let prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  let isDark = colorScheme == null ? prefersDark : colorScheme === 'dark';
  return (
    <MenuTrigger>
      <ActionButton isQuiet aria-label="Account">
        <Avatar src="https://i.imgur.com/xIe7Wlb.png" />
      </ActionButton>
      <PopoverContextProvider>
        <Popover hideArrow placement="bottom end">
          <div className={style({paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 12})}>
            <div className={style({display: 'flex', gap: 12, alignItems: 'center', marginX: 12})}>
              <Avatar src="https://i.imgur.com/xIe7Wlb.png" size={56} />
              <div>
                <div className={style({font: 'title', color: {default: 'title', forcedColors: 'ButtonText'}})}>Devon Govett</div>
                <div className={style({font: 'ui', color: {default: 'body', forcedColors: 'ButtonText'}})}>user@example.com</div>
                <Switch isSelected={isDark} onChange={isSelected => setColorScheme(isSelected ? 'dark' : 'light')} styles={style({marginTop: 4})}>
                  {locale === 'ar-AE' ? 'المظهر الداكن' : 'Dark theme'}
                </Switch>
              </div>
            </div>
            <Divider styles={style({marginX: 12})} />
            <Menu aria-label="Account">
              <MenuSection>
                <SubmenuTrigger>
                  <MenuItem>
                    <Org />
                    <Text slot="label">{locale === 'ar-AE' ? 'منظمة' : 'Organization'}</Text>
                    <Text slot="value">Adobe</Text>
                  </MenuItem>
                  <PopoverContextProvider>
                    <Menu selectionMode="single" selectedKeys={['adobe']}>
                      <MenuItem id="adobe">Adobe</MenuItem>
                      <MenuItem id="nike">Nike</MenuItem>
                      <MenuItem id="apple">Apple</MenuItem>
                    </Menu>
                  </PopoverContextProvider>
                </SubmenuTrigger>
                <MenuItem>
                  <Settings />
                  <Text slot="label">{locale === 'ar-AE' ? 'إعدادات' : 'Settings'}</Text>
                </MenuItem>
              </MenuSection>
              <MenuSection>
                <MenuItem>{locale === 'ar-AE' ? 'الإشعارات القانونية' : 'Legal notices'}</MenuItem>
                <MenuItem>{locale === 'ar-AE' ? 'تسجيل الخروج' : 'Sign out'}</MenuItem>
              </MenuSection>
            </Menu>
          </div>
        </Popover>
      </PopoverContextProvider>
    </MenuTrigger>
  );
}

export function PopoverContextProvider({children}: any) {
  let value = useContext(PopoverContext) as any;
  let hcm = useContext(HCMContext) as any;
  return (
    <PopoverContext value={{...value, ...hcm, style: {...value?.style, ...hcm?.style}}}>
      {children}
    </PopoverContext>
  );
}
