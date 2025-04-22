/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionMenu, Avatar, Button, ButtonGroup, Card, CardPreview, CardView, CardViewProps, Collection, CollectionCardPreview, Content, DialogTrigger, Divider, Footer, FullscreenDialog, Heading, IllustratedMessage, Image, MenuItem, NumberField, Picker, PickerItem, SearchField, SkeletonCollection, Tag, TagGroup, Text, ToggleButton} from '../src';
import Binoculars from '../s2wf-icons/S2_Icon_Binoculars_20_N.svg';
import EmptyIcon from '../spectrum-illustrations/gradient/generic1/Image';
import ErrorIcon from '../spectrum-illustrations/linear/AlertNotice';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import type {Meta} from '@storybook/react';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';
import Properties from '../s2wf-icons/S2_Icon_Properties_20_N.svg';
import SortDown from '../s2wf-icons/S2_Icon_SortDown_20_N.svg';
import StarFilled from '../s2wf-icons/S2_Icon_StarFilled_20_N.svg';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useAsyncList} from 'react-stately';
import {useNumberFormatter} from 'react-aria';
import ViewGrid from '../s2wf-icons/S2_Icon_ViewGrid_20_N.svg';

const meta: Meta<typeof CardView> = {
  component: CardView,
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs']
};

export default meta;

const cardViewStyles = style({
  width: {
    default: 'screen',
    viewMode: {
      docs: 'full'
    }
  },
  height: {
    default: 'screen',
    viewMode: {
      docs: 600
    }
  }
});

type Item = {
  id: number,
  user: {
    name: string,
    profile_image: { small: string }
  },
  urls: { regular: string },
  description: string,
  alt_description: string,
  width: number,
  height: number
};

const avatarSize = {
  XS: 16,
  S: 20,
  M: 24,
  L: 28,
  XL: 32
} as const;

function PhotoCard({item, layout}: {item: Item, layout: string}) {
  return (
    <Card id={item.id} textValue={item.description || item.alt_description}>
      {({size}) => (<>
        <CardPreview>
          <Image
            src={item.urls.regular}
            styles={style({
              width: 'full',
              pointerEvents: 'none'
            })}
            // TODO - should we have a safe `dynamicStyles` or something for this?
            UNSAFE_style={{
              aspectRatio: layout === 'waterfall' ? `${item.width} / ${item.height}` : '4/3',
              objectFit: layout === 'waterfall' ? 'contain' : 'cover'
            }}
            renderError={() => (
              <div className={style({display: 'flex', alignItems: 'center', justifyContent: 'center', size: 'full'})}>
                <ErrorIcon size="S" />
              </div>
            )} />
        </CardPreview>
        <Content>
          <Text slot="title">{item.description || item.alt_description}</Text>
          {size !== 'XS' && <ActionMenu>
            <MenuItem>Test</MenuItem>
          </ActionMenu>}
          <div className={style({display: 'flex', alignItems: 'center', gap: 8, gridArea: 'description'})}>
            <Avatar src={item.user.profile_image.small} size={avatarSize[size]} />
            <Text slot="description">{item.user.name}</Text>
          </div>
        </Content>
      </>)}
    </Card>
  );
}

export const Example = (args: CardViewProps<any>, {viewMode}) => {
  let list = useAsyncList<Item, number | null>({
    async load({signal, cursor, items}) {
      let page = cursor || 1;
      let res = await fetch(
        `https://api.unsplash.com/topics/nature/photos?page=${page}&per_page=30&client_id=AJuU-FPh11hn7RuumUllp4ppT8kgiLS7LtOHp_sp4nc`,
        {signal}
      );
      let nextItems = await res.json();
      // Filter duplicates which might be returned by the API.
      let existingKeys = new Set(items.map(i => i.id));
      nextItems = nextItems.filter(i => !existingKeys.has(i.id) && (i.description || i.alt_description));
      return {items: nextItems, cursor: nextItems.length ? page + 1 : null};
    }
  });

  let loadingState = args.loadingState === 'idle' ? list.loadingState : args.loadingState;
  let items = loadingState === 'loading' ? [] : list.items;

  return (
    <CardView
      aria-label="Nature photos"
      {...args}
      loadingState={loadingState}
      onLoadMore={args.loadingState === 'idle' ? list.loadMore : undefined}
      styles={cardViewStyles({viewMode})}>
      <Collection items={items} dependencies={[args.layout]}>
        {item => <PhotoCard item={item} layout={args.layout || 'grid'} />}
      </Collection>
      {(loadingState === 'loading' || loadingState === 'loadingMore') && (
        <SkeletonCollection>
          {() => (
            <PhotoCard
              item={{
                id: Math.random(),
                user: {name: 'Devon Govett', profile_image: {small: ''}},
                urls: {regular: ''},
                description: 'This is a fake description. Kinda long so it wraps to a new line.',
                alt_description: '',
                width: 400,
                height: 200 + Math.max(0, Math.round(Math.random() * 400))
              }}
              layout={args.layout || 'grid'} />
          )}
        </SkeletonCollection>
      )}
    </CardView>
  );
};

Example.args = {
  loadingState: 'idle',
  onAction: null,
  selectionMode: 'multiple'
};

export const Empty = (args: CardViewProps<any>, {viewMode}) => {
  return (
    <CardView
      aria-label="Assets"
      {...args}
      styles={cardViewStyles({viewMode})}
      renderEmptyState={() => (
        <IllustratedMessage size="L">
          <EmptyIcon />
          <Heading>Create your first asset.</Heading>
          <Content>Get started by uploading or importing some assets.</Content>
        </IllustratedMessage>
      )}>
      {[]}
    </CardView>
  );
};

interface Topic {
  id: string,
  title: string,
  total_photos: number,
  links: {html: string},
  preview_photos: {id: string, urls: {small: string}}[]
}

function TopicCard({topic}: {topic: Topic}) {
  return (
    <Card href={topic.links.html} target="_blank" textValue={topic.title}>
      <CollectionCardPreview>
        {topic.preview_photos.slice(0, 4).map(photo => (
          <Image key={photo.id} alt="" src={photo.urls.small} />
        ))}
      </CollectionCardPreview>
      <Content>
        <Text slot="title">{topic.title}</Text>
        <div className={style({display: 'flex', alignItems: 'center', gap: 8})}>
          <Folder />
          <Text slot="description">{topic.total_photos.toLocaleString()} photos</Text>
        </div>
      </Content>
    </Card>
  );
}

export const CollectionCards = (args: CardViewProps<any>, {viewMode}) => {
  let list = useAsyncList<Topic, number | null>({
    async load({signal, cursor}) {
      let page = cursor || 1;
      let res = await fetch(
        `https://api.unsplash.com/topics?page=${page}&per_page=30&client_id=AJuU-FPh11hn7RuumUllp4ppT8kgiLS7LtOHp_sp4nc`,
        {signal}
      );
      let items = (await res.json()).filter((topic: Topic) => !!topic.preview_photos);
      return {items, cursor: items.length ? page + 1 : null};
    }
  });

  let loadingState = args.loadingState === 'idle' ? list.loadingState : args.loadingState;
  let items = loadingState === 'loading' ? [] : list.items;

  return (
    <CardView
      aria-label="Topics"
      {...args}
      loadingState={loadingState}
      onLoadMore={args.loadingState === 'idle' ? list.loadMore : undefined}
      styles={cardViewStyles({viewMode})}>
      <Collection items={items}>
        {topic => <TopicCard topic={topic} />}
      </Collection>
      {(loadingState === 'loading' || loadingState === 'loadingMore') && (
        <SkeletonCollection>
          {() => (
            <TopicCard
              topic={{
                id: Math.random().toString(36),
                title: 'Topic title',
                total_photos: 80,
                links: {html: ''},
                preview_photos: [
                  {id: 'a', urls: {small: ''}},
                  {id: 'b', urls: {small: ''}},
                  {id: 'c', urls: {small: ''}},
                  {id: 'd', urls: {small: ''}}
                ]
              }} />
          )}
        </SkeletonCollection>
      )}
    </CardView>
  );
};

CollectionCards.args = {
  loadingState: 'idle',
  onAction: null
};

interface ITagItem {
  name: string,
  id: string
}

interface AudienceInfo {
  id: string,
  title: string,
  tags: ITagItem[],
  audienceCount: number,
  propensityScore: number,
  plansCount: number,
  conversionRate: number,
  isFavorited?: boolean
}

function AudienceCard({info}: {info: AudienceInfo}) {
  let compactFormatter = useNumberFormatter({notation: 'compact'});
  let percentageFormatter = useNumberFormatter({style: 'percent'});
  return (
    // TODO: HACK: needed to move checkbox to the right
    <Card id={info.id} textValue={info.title} UNSAFE_className="audience-card">
      <Content>
        {/* TODO: HACK: needed to add a favorite icon and override the color*/}
        {info.isFavorited && (
          <div
            className={style({
              position: 'absolute',
              insetEnd: 56,
              top: 24,
              '--iconPrimary': {
                type: 'fill',
                value: 'informative'
              }
            })}>
            <StarFilled />
          </div>
        )}
        <Text slot="title" styles={style({font: 'title-lg'})}>{info.title}</Text>
        {/* TODO: HACK: they want brown tags with white text */}
        <div className={style({display: 'flex', flexDirection: 'column', gap: 12})}>
          <TagGroup size="S" aria-label="what is this, audience tags?" UNSAFE_className="tag-group" items={info.tags}>
            {(item: ITagItem) => <Tag>{item.name}</Tag>}
          </TagGroup>
          <div className={style({display: 'flex', flexDirection: 'row'})}>
            <div className={style({display: 'flex', flexDirection: 'column', marginEnd: 24})}>
              <span className={style({font: 'title'})}>Audience Count</span>
              <span className={style({font: 'ui'})}>{compactFormatter.format(info.audienceCount)}</span>
            </div>
            <div className={style({display: 'flex', flexDirection: 'column', marginEnd: 24})}>
              <span className={style({font: 'title'})}>Propensity</span>
              <span className={style({font: 'ui'})}>{info.propensityScore}<span className={style({font: 'detail'})}>/100</span></span>
            </div>
          </div>
          <div className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
            {/* TODO: bold "upsell", would we prefer <b>? Or some other way of styling it */}
            {/* TODO: add values, ideally would be LabelledValue. Values need to have formatting too */}
            {/* TODO: missing a meter like component that can display with fillOffset  */}
            <span className={style({font: 'ui'})}>Audience Metrics for <span className={style({font: 'title-sm'})}>Upsell</span></span>
            <div className={style({display: 'inline-flex', gap: 12})}>
              <span className={style({font: 'detail'})}>Used in plan</span>
              <span className={style({font: 'ui'})}>{Math.abs(info.plansCount)}</span>
            </div>
            <div className={style({display: 'inline-flex', gap: 12})}>
              <span className={style({font: 'detail'})}>Avg. Conv. Rate</span>
              <span className={style({font: 'ui'})}>{percentageFormatter.format(Math.abs(info.conversionRate))}</span>
            </div>
          </div>
        </div>
      </Content>
      <Footer styles={style({paddingTop: 0})}>
        <Button size="S" fillStyle="outline" variant="secondary"><Binoculars /><Text>Details</Text></Button>
      </Footer>
    </Card>
  );
}

let audienceData = [
  {id: '1', title: 'Upsell Recent Purchasers', tags: [{name: 'High-Value Customer', id: 'HVC'}], audienceCount: 300000, propensityScore: 88, plansCount: 12, conversionRate: .56},
  {id: '2', title: 'Recent Bookings', tags: [{name: 'High-Engagement', id: 'HE'}], audienceCount: 148000, propensityScore: 82, plansCount: 22, conversionRate: .37, isFavorited: true},
  {id: '3', title: 'Frequent Diners', tags: [{name: 'Michelin restaurant', id: 'MR'}], audienceCount: 283000, propensityScore: 78, plansCount: -6, conversionRate: .21},
  {id: '4', title: 'Loyalty Travelers', tags: [{name: 'High-Engagement', id: 'Test'}], audienceCount: 121000, propensityScore: 71, plansCount: 16, conversionRate: .21, isFavorited: true},
  {id: '5', title: 'Luxury Travelers', tags: [{name: 'High-Value Customer', id: 'HVC'}, {name: 'Michelin restaurant', id: 'MR'}], audienceCount: 92000, propensityScore: 71, plansCount: -5, conversionRate: .42},
  {id: '6', title: 'Weekend Getaway Guests', tags: [{name: 'Last-Minute Booking', id: 'LMB'}], audienceCount: 131000, propensityScore: 68, plansCount: -3, conversionRate: -.18},
  {id: '7', title: 'Family Vacationers', tags: [{name: 'Kids', id: 'K'}], audienceCount: 489000, propensityScore: 60, plansCount: 11, conversionRate: .34},
  {id: '8', title: 'Business Travelers', tags: [{name: 'High-Value Customer', id: 'HVC'}], audienceCount: 742000, propensityScore: 56, plansCount: -10, conversionRate: .12},
  {id: '9', title: 'Solo Nomad', tags: [{name: 'Cultural', id: 'Cultural'}], audienceCount: 81000, propensityScore: 43, plansCount: 12, conversionRate: -.14}
];

const AudienceDialog = () => {
  return (
    <div className={style({display: 'flex', gap: 24})}>
      <div className={style({width: 380, flexShrink: 0})}>
        <h1 className={style({font: 'title-lg', marginBottom: 24, marginTop: 0})}>Audience Metadata</h1>
        <div className={style({display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24})}>
          <TagGroup selectionMode="single" defaultSelectedKeys={['conversion']} label="Target Metrics">
            <Tag>Engagement</Tag>
            <Tag>Impression</Tag>
            <Tag id="conversion">Conversion</Tag>
            <Tag>Reach</Tag>
          </TagGroup>
          <TagGroup selectionMode="single" defaultSelectedKeys={['upsell']} label="Show audience performance based on...">
            <Tag>All campaign categories</Tag>
            <Tag id="upsell">Upsell</Tag>
            <Tag>Cross-sell</Tag>
            <Tag>Event</Tag>
            <Tag>Abandoned cart</Tag>
            <Tag>Refferal</Tag>
          </TagGroup>
        </div>
        {/* TODO: should be a dotted divider? Would this be a case we'd expect the user to create their own via RAC or push back on design to use the Spectrum one? */}
        <Divider size="S" />
        <h1 className={style({font: 'heading', marginY: 24})}>Filter</h1>
        <div className={style({display: 'flex', flexDirection: 'column', gap: 24})}>
          {/* TODO: in the design the field itself is the same width regardless of the label width */}
          <NumberField label="Minimum audience count" formatOptions={{notation: 'compact'}} labelPosition="side" defaultValue={50000} />
          <NumberField label="Minimum propensity score" labelPosition="side" defaultValue={40} />
          {/* TODO: In the design this is an info button that occupies the delete button area... Should be a tooltip on the Tag? Something else entirely? */}
          <TagGroup label="Governance rules and permissions">
            <Tag>Sensitive Data</Tag>
            <Tag>Restricted Access</Tag>
            <Tag>No Marketing Use</Tag>
            <Tag>Compliance Required</Tag>
            <Tag>Custom Label</Tag>
            <Tag>Approved for [Team Use]</Tag>
          </TagGroup>
        </div>
      </div>
      <div className={style({display: 'flex', flexDirection: 'column', gap: 24, flexShrink: 1, flexGrow: 1, flexBasis: 'auto', minWidth: 250})}>
        <div className={style({display: 'flex', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch'})}>
          {/* TODO: the card view comes with padding which we need, so manually added margins */}
          <div className={style({display: 'flex', gap: 12, marginEnd: 'auto', marginStart: '[15px]'})}>
            {/* TODO: button is black with white text so I guess it is actually a toggle button rather than a action button? */}
            <ToggleButton defaultSelected aria-label="What is this button"><Properties /></ToggleButton>
            <SearchField styles={style({width: 284})} aria-label="what is this searchfield" />
          </div>
          <div className={style({display: 'flex', gap: 12, marginEnd: '[15px]'})}>
            <Picker isQuiet defaultSelectedKey="1">
              <PickerItem id="1" textValue="Propensity Score"><SortDown /><Text slot="label">Propensity Score</Text></PickerItem>
            </Picker>
            {/* TODO: this is a standalone icon in the design but that doesnt seem right... */}
            <ToggleButton isQuiet aria-label="What is this button?"><ViewGrid /></ToggleButton>
          </div>
        </div>
        {/* TODO: for some reason the cards aren't respecting the inherent minWidth set by CardView */}
        <CardView
          size="L"
          selectionMode="multiple"
          aria-label="Audiences">
          <Collection items={audienceData}>
            {info => <AudienceCard info={info} />}
          </Collection>
        </CardView>
      </div>
    </div>

  );
};

export const App = () => {
  return (
    <DialogTrigger>
      <Button variant="primary">Open dialog</Button>
      <FullscreenDialog>
        {({close}) => (
          <>
            <Heading slot="title">Audiences</Heading>
            <Content>
              <AudienceDialog />
            </Content>
            <ButtonGroup>
              <Button onPress={close} fillStyle="outline" variant="secondary">Cancel</Button>
              <Button onPress={close} isDisabled variant="primary">Complete</Button>
            </ButtonGroup>
          </>
        )}
      </FullscreenDialog>
    </DialogTrigger>
  );
};
