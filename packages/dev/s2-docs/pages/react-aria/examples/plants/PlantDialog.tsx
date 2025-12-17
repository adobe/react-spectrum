import {Button} from 'tailwind-starter/Button';
import {Heading, isFileDropItem, Text} from 'react-aria-components';
import {ComboBox, ComboBoxItem} from 'tailwind-starter/ComboBox';
import {DatePicker} from 'tailwind-starter/DatePicker';
import {Dialog} from 'tailwind-starter/Dialog';
import {DropZone} from 'tailwind-starter/DropZone';
import {Form} from 'tailwind-starter/Form';
import {getLocalTimeZone, today} from '@internationalized/date';
import plants, {Plant} from './plants';
import {Select, SelectItem} from 'tailwind-starter/Select';
import {TextField} from 'tailwind-starter/TextField';
import {cycleIcon, getSunlight, sunIcons, wateringIcons} from './Labels';
import {useState} from 'react';

export function PlantDialog({item, onSave}: {item?: Plant | null, onSave: (item: Plant) => void}) {
  let [droppedImage, setDroppedImage] = useState(item?.default_image?.thumbnail);
  return (
    <Dialog>
      {({close}) => (
        <>
          <Heading
            slot="title"
            className="text-2xl font-semibold leading-6 my-0 text-slate-700 dark:text-zinc-300">
            {item ? 'Edit Plant' : 'Add Plant'}
          </Heading>
          <Form
            action={formData => {
              let data = Object.fromEntries(formData) as any;
              data.sunlight = [data.sunlight];
              data.scientific_name = [data.scientific_name];
              data.default_image = {thumbnail: data.image};
              data.id = item?.id || Date.now();
              data.isFavorite = item?.isFavorite || false;
              onSave(data);
            }}
            className="mt-6">
            <div className="flex gap-4">
              <DropZone
                getDropOperation={types => types.has('image/jpeg') || types.has('image/png') ? 'copy' : 'cancel'}
                onDrop={async e => {
                  let item = e.items.filter(isFileDropItem).find(item => (item.type === 'image/jpeg' || item.type === 'image/png'));
                  if (item) {
                    setDroppedImage(URL.createObjectURL(await item.getFile()));
                  }
                }}
                className="w-24 sm:w-32 p-2">
                {droppedImage
                  ? <img alt="" src={droppedImage} className="w-full h-full object-contain aspect-square" />
                  : <Text slot="label" className="italic text-sm text-center">Drop or paste image here</Text>
                }
                <input type="hidden" name="image" value={droppedImage} />
              </DropZone>
              <div className="flex flex-col gap-3 flex-1 min-w-0">
                <ComboBox label="Common Name" placeholder="Enter plant name" name="common_name" isRequired items={plants} defaultInputValue={item?.common_name} allowsCustomValue autoFocus={navigator.maxTouchPoints === 0}>
                  {plant => <ComboBoxItem>{plant.common_name}</ComboBoxItem>}
                </ComboBox>
                <TextField label="Scientific Name" placeholder="Enter scientific name" name="scientific_name" isRequired defaultValue={item?.scientific_name?.join('')} />
              </div>
            </div>
            <Select label="Cycle" name="cycle" isRequired defaultSelectedKey={item?.cycle}>
              <SelectItem id="Perennial" textValue="Perennial">{cycleIcon} Perennial</SelectItem>
              <SelectItem id="Annual" textValue="Annual">{cycleIcon} Annual</SelectItem>
            </Select>
            <Select label="Sunlight" name="sunlight" isRequired defaultSelectedKey={item ? getSunlight(item) : undefined}>
              <SelectItem id="full sun" textValue="Full Sun">{sunIcons['full sun']} Full Sun</SelectItem>
              <SelectItem id="part sun" textValue="Part Sun">{sunIcons['part sun']} Part Sun</SelectItem>
              <SelectItem id="part shade" textValue="Part Shade">{sunIcons['part shade']} Part Shade</SelectItem>
            </Select>
            <Select label="Watering" name="watering" isRequired defaultSelectedKey={item?.watering}>
              <SelectItem id="Frequent" textValue="Frequent">{wateringIcons['Frequent']} Frequent</SelectItem>
              <SelectItem id="Average" textValue="Average">{wateringIcons['Average']} Average</SelectItem>
              <SelectItem id="Minimum" textValue="Minimum">{wateringIcons['Minimum']} Minimum</SelectItem>
            </Select>
            <DatePicker label="Date Planted" isRequired defaultValue={item ? today(getLocalTimeZone()) : null} />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {item ? 'Save' : 'Add'}
              </Button>
            </div>
          </Form>
        </>
      )}
    </Dialog>
  );
}
