/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import Binoculars from '../s2wf-icons/S2_Icon_Binoculars_20_N.svg';
import {Button, ButtonGroup, Card, CardView, Collection, Content, DialogTrigger, Divider, Footer, FullscreenDialog, Heading, NumberField, Picker, PickerItem, SearchField, Tag, TagGroup, Text, ToggleButton} from '../src';
import Properties from '../s2wf-icons/S2_Icon_Properties_20_N.svg';
import SortDown from '../s2wf-icons/S2_Icon_SortDown_20_N.svg';
import StarFilled from '../s2wf-icons/S2_Icon_StarFilled_20_N.svg';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useNumberFormatter} from 'react-aria';
import ViewGrid from '../s2wf-icons/S2_Icon_ViewGrid_20_N.svg';

const meta = {
  title: 'zDesign Examples'
};

export default meta;

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

export const ProjectVistaDialog = () => {
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
