'use client';

import ActionButtonSvg from '../../docs/pages/assets/component-illustrations/ActionButton.svg';
import ActionGroupSvg from '../../docs/pages/assets/component-illustrations/ActionGroup.svg';
import BadgeSvg from '../../docs/pages/assets/component-illustrations/Badge.svg';
import BreadcrumbsSvg from '../../docs/pages/assets/component-illustrations/Breadcrumbs.svg';
import ButtonGroupSvg from '../../docs/pages/assets/component-illustrations/ButtonGroup.svg';
import ButtonSvg from '../../docs/pages/assets/component-illustrations/Button.svg';
import CalendarSvg from '../../docs/pages/assets/component-illustrations/Calendar.svg';
import {Card, CardPreview, CardView, Collection, Content, Tag, TagGroup, Text} from '@react-spectrum/s2';
import CheckboxGroupSvg from '../../docs/pages/assets/component-illustrations/CheckboxGroup.svg';
import CheckboxSvg from '../../docs/pages/assets/component-illustrations/Checkbox.svg';
import CollectionsSvg from '../../docs/pages/assets/component-illustrations/Collections.svg';
import ColorAreaSvg from '../../docs/pages/assets/component-illustrations/ColorArea.svg';
import ColorFieldSvg from '../../docs/pages/assets/component-illustrations/ColorField.svg';
import ColorPickerSvg from '../../docs/pages/assets/component-illustrations/ColorPicker.svg';
import ColorSliderSvg from '../../docs/pages/assets/component-illustrations/ColorSlider.svg';
import ColorSwatchPickerSvg from '../../docs/pages/assets/component-illustrations/ColorSwatchPicker.svg';
import ColorSwatchSvg from '../../docs/pages/assets/component-illustrations/ColorSwatch.svg';
import ColorWheelSvg from '../../docs/pages/assets/component-illustrations/ColorWheel.svg';
import ComboBoxSvg from '../../docs/pages/assets/component-illustrations/ComboBox.svg';
import ContextualHelpSvg from '../../docs/pages/assets/component-illustrations/ContextualHelp.svg';
import DateFieldSvg from '../../docs/pages/assets/component-illustrations/DateField.svg';
import DatePickerSvg from '../../docs/pages/assets/component-illustrations/DatePicker.svg';
import DateRangePickerSvg from '../../docs/pages/assets/component-illustrations/DateRangePicker.svg';
import DialogSvg from '../../docs/pages/assets/component-illustrations/Dialog.svg';
import DisclosureGroupSvg from '../../docs/pages/assets/component-illustrations/DisclosureGroup.svg';
import DisclosureSvg from '../../docs/pages/assets/component-illustrations/Disclosure.svg';
import DragAndDropSvg from '../../docs/pages/assets/component-illustrations/DragAndDrop.svg';
import DropZoneSvg from '../../docs/pages/assets/component-illustrations/DropZone.svg';
import FileTriggerSvg from '../../docs/pages/assets/component-illustrations/FileTrigger.svg';
import FocusScopeSvg from '../../docs/pages/assets/component-illustrations/FocusScope.svg';
import FormSvg from '../../docs/pages/assets/component-illustrations/Form.svg';
import InputSvg from '../../docs/pages/assets/component-illustrations/Input.svg';
import InternationalizedDateSvg from '../../docs/pages/assets/component-illustrations/InternationalizedDate.svg';
import LabeledValueSvg from '../../docs/pages/assets/component-illustrations/LabeledValue.svg';
import LabelSvg from '../../docs/pages/assets/component-illustrations/Label.svg';
import LinkSvg from '../../docs/pages/assets/component-illustrations/Link.svg';

import ListBoxSvg from '../../docs/pages/assets/component-illustrations/ListBox.svg';
import ListViewSvg from '../../docs/pages/assets/component-illustrations/ListView.svg';
import MenuSvg from '../../docs/pages/assets/component-illustrations/Menu.svg';
import MeterSvg from '../../docs/pages/assets/component-illustrations/Meter.svg';
import NumberFieldSvg from '../../docs/pages/assets/component-illustrations/NumberField.svg';
import {Page} from '@parcel/rsc';
import PickerSvg from '../../docs/pages/assets/component-illustrations/Picker.svg';
import PopoverSvg from '../../docs/pages/assets/component-illustrations/Popover.svg';
import ProgressBarSvg from '../../docs/pages/assets/component-illustrations/ProgressBar.svg';
import ProgressCircleSvg from '../../docs/pages/assets/component-illustrations/ProgressCircle.svg';
import RadioGroupSvg from '../../docs/pages/assets/component-illustrations/RadioGroup.svg';
import RangeCalendarSvg from '../../docs/pages/assets/component-illustrations/RangeCalendar.svg';
import RangeSliderSvg from '../../docs/pages/assets/component-illustrations/RangeSlider.svg';
import React, {useEffect, useMemo, useState} from 'react';
import SearchFieldSvg from '../../docs/pages/assets/component-illustrations/SearchField.svg';
import SelectionSvg from '../../docs/pages/assets/component-illustrations/Selection.svg';
import SliderSvg from '../../docs/pages/assets/component-illustrations/Slider.svg';
import StatusLightSvg from '../../docs/pages/assets/component-illustrations/StatusLight.svg';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };
import SwitchSvg from '../../docs/pages/assets/component-illustrations/Switch.svg';
import TableSvg from '../../docs/pages/assets/component-illustrations/Table.svg';
import TabsSvg from '../../docs/pages/assets/component-illustrations/Tabs.svg';
import TagGroupSvg from '../../docs/pages/assets/component-illustrations/TagGroup.svg';
import TextAreaSvg from '../../docs/pages/assets/component-illustrations/TextArea.svg';
import TextFieldSvg from '../../docs/pages/assets/component-illustrations/TextField.svg';
import TimeFieldSvg from '../../docs/pages/assets/component-illustrations/TimeField.svg';
import ToastSvg from '../../docs/pages/assets/component-illustrations/Toast.svg';
import ToggleButtonSvg from '../../docs/pages/assets/component-illustrations/ToggleButton.svg';
import TooltipSvg from '../../docs/pages/assets/component-illustrations/Tooltip.svg';
import TreeSvg from '../../docs/pages/assets/component-illustrations/Tree.svg';
import useFocusRingSvg from '../../docs/pages/assets/component-illustrations/useFocusRing.svg';
import useFocusSvg from '../../docs/pages/assets/component-illustrations/useFocus.svg';
import useFocusWithinSvg from '../../docs/pages/assets/component-illustrations/useFocusWithin.svg';
import useHoverSvg from '../../docs/pages/assets/component-illustrations/useHover.svg';
import useKeyboardSvg from '../../docs/pages/assets/component-illustrations/useKeyboard.svg';
import useLongPressSvg from '../../docs/pages/assets/component-illustrations/useLongPress.svg';
import useMoveSvg from '../../docs/pages/assets/component-illustrations/useMove.svg';
import usePressSvg from '../../docs/pages/assets/component-illustrations/usePress.svg';

const componentIllustrations: Record<string, React.ComponentType> = {
  'ActionButton': ActionButtonSvg,
  'ActionGroup': ActionGroupSvg,
  'Badge': BadgeSvg,
  'Breadcrumbs': BreadcrumbsSvg,
  'Button': ButtonSvg,
  'ButtonGroup': ButtonGroupSvg,
  'Calendar': CalendarSvg,
  'Checkbox': CheckboxSvg,
  'CheckboxGroup': CheckboxGroupSvg,
  'Collections': CollectionsSvg,
  'ColorArea': ColorAreaSvg,
  'ColorField': ColorFieldSvg,
  'ColorPicker': ColorPickerSvg,
  'ColorSlider': ColorSliderSvg,
  'ColorSwatch': ColorSwatchSvg,
  'ColorSwatchPicker': ColorSwatchPickerSvg,
  'ColorWheel': ColorWheelSvg,
  'ComboBox': ComboBoxSvg,
  'ContextualHelp': ContextualHelpSvg,
  'DateField': DateFieldSvg,
  'DatePicker': DatePickerSvg,
  'DateRangePicker': DateRangePickerSvg,
  'Dialog': DialogSvg,
  'Disclosure': DisclosureSvg,
  'DisclosureGroup': DisclosureGroupSvg,
  'Drag and Drop': DragAndDropSvg,
  'DropZone': DropZoneSvg,
  'FileTrigger': FileTriggerSvg,
  'FocusScope': FocusScopeSvg,
  'Form': FormSvg,
  'GridList': ListViewSvg, // GridList -> ListView
  'Input': InputSvg,
  'InternationalizedDate': InternationalizedDateSvg,
  'Label': LabelSvg,
  'LabeledValue': LabeledValueSvg,
  'Link': LinkSvg,
  'ListBox': ListBoxSvg,
  'ListView': ListViewSvg,
  'Menu': MenuSvg,
  'Meter': MeterSvg,
  'NumberField': NumberFieldSvg,
  'Picker': PickerSvg,
  'Popover': PopoverSvg,
  'ProgressBar': ProgressBarSvg,
  'ProgressCircle': ProgressCircleSvg,
  'RadioGroup': RadioGroupSvg,
  'RangeCalendar': RangeCalendarSvg,
  'RangeSlider': RangeSliderSvg,
  'SearchField': SearchFieldSvg,
  'Select': PickerSvg, // Select -> Picker
  'Selection': SelectionSvg,
  'Slider': SliderSvg,
  'StatusLight': StatusLightSvg,
  'Switch': SwitchSvg,
  'Table': TableSvg,
  'Tabs': TabsSvg,
  'TagGroup': TagGroupSvg,
  'TextArea': TextAreaSvg,
  'TextField': TextFieldSvg,
  'TimeField': TimeFieldSvg,
  'Toast': ToastSvg,
  'ToggleButton': ToggleButtonSvg,
  'ToggleButtonGroup': ActionGroupSvg, // ToggleButtonGroup -> ActionGroup
  'Tooltip': TooltipSvg,
  'Tree': TreeSvg,
  'useFocus': useFocusSvg,
  'useFocusRing': useFocusRingSvg,
  'useFocusWithin': useFocusWithinSvg,
  'useHover': useHoverSvg,
  'useKeyboard': useKeyboardSvg,
  'useLongPress': useLongPressSvg,
  'useMove': useMoveSvg,
  'usePress': usePressSvg
};

interface IExampleItem {
  id: string,
  name: string,
  description?: string,
  href: string,
  IllustrationComponent?: React.ComponentType
}

interface CardListProps {
  selectedLibrary: 'react-spectrum' | 'react-aria' | 'internationalized',
  pages?: Page[]
}

const illustrationStyles = style({
  width: 'full',
  aspectRatio: '3/2',
  objectFit: 'cover',
  userSelect: 'none',
  pointerEvents: 'none'
});

export function CardList({selectedLibrary, pages}: CardListProps) {
  let sectionsData = useMemo(() => {
    if (!pages || !Array.isArray(pages)) {
      return [];
    }

    const sections = pages
      .filter(page => {
        if (!page.url || !page.url.endsWith('.html')) {
          return false;
        }

        let library: 'react-spectrum' | 'react-aria' | 'internationalized' = 'react-spectrum';
        if (page.url.includes('react-aria')) {
          library = 'react-aria';
        } else if (page.url.includes('react-internationalized')) {
          library = 'internationalized';
        }
        
        return library === selectedLibrary;
      })
      .reduce<Record<string, IExampleItem[]>>((acc, page) => {
        let sectionName = (page as any).exports?.section;
        if (!sectionName || sectionName === 'S2') {
          sectionName = 'Components';
        }

        const name = page.url.replace(/^\//, '').replace(/\.html$/, '');
        const title = page.tableOfContents?.[0]?.title || name;

        const IllustrationComponent = componentIllustrations[title];

        const component: IExampleItem = {
          id: name,
          name: title,
          href: page.url,
          IllustrationComponent
        };

        if (!acc[sectionName]) {
          acc[sectionName] = [];
        }
        acc[sectionName].push(component);

        return acc;
      }, {});

    const sectionEntries = Object.entries(sections).map(([name, children]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      children
    }));

    const componentsSection = sectionEntries.find(section => section.name === 'Components');
    const otherSections = sectionEntries.filter(section => section.name !== 'Components');

    otherSections.sort((a, b) => a.name.localeCompare(b.name));

    return componentsSection ? [componentsSection, ...otherSections] : otherSections;
  }, [pages, selectedLibrary]);

  const [selectedSection, setSelectedSection] = useState<string>('components');

  useEffect(() => {
    if (sectionsData.length > 0) {
      setSelectedSection(sectionsData[0].id);
    }
  }, [sectionsData]);

  const selectedSectionData = sectionsData.find(section => section.id === selectedSection);
  const items = selectedSectionData?.children || [];

  return (
    <nav
      className={style({ 
        flexGrow: 1,
        overflow: 'auto',
        margin: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      })}>
      {sectionsData.length > 0 && (
        <TagGroup
          selectionMode="single"
          selectedKeys={[selectedSection]}
          onSelectionChange={(keys) => {
            const newSelection = Array.from(keys)[0] as string;
            setSelectedSection(newSelection);
          }}
          aria-label="Select section">
          {sectionsData.map((section) => (
            <Tag key={section.id} id={section.id}>
              {section.name}
            </Tag>
          ))}
        </TagGroup>
      )}

      {items.length > 0 && (
        <CardView
          aria-label={`${selectedSectionData?.name || 'Items'}`}
          styles={style({
            flexGrow: 1
          })}>
          <Collection items={items}>
            {(item) => {
              const {IllustrationComponent} = item;
              return (
                <Card
                  key={item.id}
                  id={item.id}
                  textValue={item.name}
                  href={item.href}
                  size="S">
                  {IllustrationComponent && (
                    <CardPreview>
                      <IllustrationComponent
                        aria-hidden="true"
                        // @ts-ignore
                        className={illustrationStyles} />
                    </CardPreview>
                  )}
                  <Content>
                    <Text slot="title">{item.name}</Text>
                  </Content>
                </Card>
              );
            }}
          </Collection>
        </CardView>
      )}
    </nav>
  );
}

export default CardList;
