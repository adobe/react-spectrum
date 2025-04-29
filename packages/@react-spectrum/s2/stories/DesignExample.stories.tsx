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

import {Accordion, ActionButton, Badge, Button, ButtonGroup, Card, CardView, Collection, Content, DialogTrigger, Disclosure, DisclosureHeader, DisclosurePanel, DisclosureTitle, Divider, Footer, FullscreenDialog, Heading, Link, Meter, NumberField, Picker, PickerItem, SearchField, StatusLight, Tab, TabList, TabPanel, Tabs, Tag, TagGroup, Text, ToggleButton} from '../src';
import Add from '../s2wf-icons/S2_Icon_Add_20_N.svg';
import AlertTriangle from '../s2wf-icons/S2_Icon_AlertTriangle_20_N.svg';
import Binoculars from '../s2wf-icons/S2_Icon_Binoculars_20_N.svg';
import Checkmark from '../s2wf-icons/S2_Icon_Checkmark_20_N.svg';
import CheckmarkCircle from '../s2wf-icons/S2_Icon_CheckmarkCircle_20_N.svg';
import ChevronDown from '../s2wf-icons/S2_Icon_ChevronDown_20_N.svg';
import ChevronLeft from '../s2wf-icons/S2_Icon_ChevronLeft_20_N.svg';
import ChevronUp from '../s2wf-icons/S2_Icon_ChevronUp_20_N.svg';
import Circle from '../s2wf-icons/S2_Icon_Circle_20_N.svg';
import Comment from '../s2wf-icons/S2_Icon_Comment_20_N.svg';
import ConversionActualGraph from '../stories/assets/ConversionGraph.svg';
import Data from '../s2wf-icons/S2_Icon_Data_20_N.svg';
import Edit from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import FileText from '../s2wf-icons/S2_Icon_FileText_20_N.svg';
import Legend from '../stories/assets/Legend.svg';
import Lightbulb from '../s2wf-icons/S2_Icon_Lightbulb_20_N.svg';
import {linearGradient} from '../style' with {type: 'macro'};
import LinkIcon from '../s2wf-icons/S2_Icon_Link_20_N.svg';
import Lock from '../s2wf-icons/S2_Icon_Lock_20_N.svg';
import More from '../s2wf-icons/S2_Icon_More_20_N.svg';
import PeopleGroup from '../s2wf-icons/S2_Icon_PeopleGroup_20_N.svg';
import Play from '../s2wf-icons/S2_Icon_Play_20_N.svg';
import Properties from '../s2wf-icons/S2_Icon_Properties_20_N.svg';
import React from 'react';
import ShoppingCart from '../s2wf-icons/S2_Icon_ShoppingCart_20_N.svg';
import SortDown from '../s2wf-icons/S2_Icon_SortDown_20_N.svg';
import Star from '../s2wf-icons/S2_Icon_Star_20_N.svg';
import StarFilled from '../s2wf-icons/S2_Icon_StarFilled_20_N.svg';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import Target from '../s2wf-icons/S2_Icon_Target_20_N.svg';
import TargetAudience from '../stories/assets/TargetAudiences.svg';
import {useNumberFormatter} from 'react-aria';
import User from '../s2wf-icons/S2_Icon_User_20_N.svg';
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

const outerContainer = style({
  backgroundImage: linearGradient('to bottom right', ['cyan-900', 0], ['seafoam-400', 5], ['gray-100', 10]),
  width: '[1400px]',
  height: '[1000px]'
});

const background = style({
  backgroundColor: 'gray-25',
  font: 'ui',
  position: 'absolute',
  width: '[1350px]',
  height: '[1350px]',
  borderRadius: 'lg',
  marginTop: 32,
  marginStart: 32,
  paddingBottom: 32
});

const panel = style({
  backgroundColor: 'gray-50',
  borderRadius: 'lg',
  marginTop: 32,
  marginEnd: 32,
  padding: 12,
  display: 'flex',
  gap: 12,
  flexDirection: 'column'
});

function MeasureHeading() {
  return (
    <div className={style({display: 'flex', alignItems: 'center', justifyContent: 'space-between'})}>
      <div className={style({font: 'title-lg'})}>Measurement-2024-03-01 13:06:23</div>
      <Button variant="accent"><Binoculars /><Text>View full report</Text></Button>
    </div>
  );
}

function CampaignInfo() {
  return (
    <div className={style({display: 'flex', gap: 12})}>
      <StatusLight variant="positive">Active</StatusLight>
      <Divider orientation="vertical" size="S" />
      <div className={style({display: 'flex', gap: 2})}>Campaign names:<div className={style({font: 'title-sm'})}>120507081 Acme summer '24, 130456012 Acme winter '23</div></div>
      <Divider orientation="vertical" size="S" />
      <div>Campaign date range: 01/15/2024 - 06/14/2024</div>
    </div>
  );
}

function CampaignPerformance() {
  return (
    <div>
      <div className={style({display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12})}>
        <Star />
        <div className={style({font: 'title'})}>Campaign performance by AI assistant</div>
        <Button size="S" staticColor="black"><Comment /><Text>Ask for a follow-up</Text></Button>
      </div>
      <div className={style({display: 'flex', gap: 4, flexDirection: 'column'})}>
        <div className={style({display: 'flex', alignItems: 'center', gap: 8})}><AlertTriangle />Your ad completion rate is below the range of 75% to 95% <ActionButton size="S"><LinkIcon /><Text>View details</Text></ActionButton></div>
        <div className={style({display: 'flex', alignItems: 'center', gap: 8})}><AlertTriangle />Your ad conversion rate is low and total conversion decreases 2.5% in last 7 days<ActionButton size="S"><LinkIcon /><Text>View details</Text></ActionButton></div>
        <div className={style({display: 'flex', alignItems: 'center', gap: 8})}><AlertTriangle />Sports Fans audience reach increases 5.5% in last 7 days <ActionButton size="S"><LinkIcon /><Text>View details</Text></ActionButton></div>
      </div>
    </div>
  );
}

function RecommendedActions() {
  return (
    <div className={style({backgroundColor: 'gray-25', padding: 12, borderRadius: 'lg'})}>
      <div className={style({display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12})}><Lightbulb /><div className={style({font: 'title'})}>Recommended actions</div><Button size="S"><Comment /><Text>Review with AI Assistant</Text></Button></div>
      <div className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
        <div><span className={style({font: 'title-sm'})}>Lengthy creative:</span> Viewers might find the ad too long to hold their attention. Recommend decreasing the length</div>
        <div><span className={style({font: 'title-sm'})}>Target audience:</span> Utilize the <Link>"Olympic Viewers"</Link> audience of TVtube to increase conversions</div>
      </div>
    </div>
  );
}

function ImpressionCard() {
  return (
    <div className={style({display: 'flex', justifyContent: 'space-around', backgroundColor: 'gray-25', borderWidth: 2, borderColor: 'gray-100', borderStyle: 'solid', borderRadius: 'lg', padding: 12})}>
      <div>
        <div className={style({paddingBottom: 8})}>Total impression</div>
        <div className={style({font: 'title-2xl'})}>4.2M</div>
        <div className={style({display: 'flex', alignItems: 'center'})}><ChevronUp />2.5%</div>
      </div>
      <div>
        <div className={style({paddingBottom: 8})}>Ad completion rate</div>
        <Meter variant="negative" value={45} label="45%" />
      </div>
    </div>
  );
}

function ConversionCard() {
  return (
    <div className={style({display: 'flex', justifyContent: 'space-around', backgroundColor: 'gray-25', borderWidth: 2, borderColor: 'gray-100', borderStyle: 'solid', borderRadius: 'lg', paddingY: 12})}>
      <div>
        <div className={style({paddingBottom: 8})}>Total conversions</div>
        <div className={style({font: 'title-2xl'})}>245K</div>
        <div className={style({display: 'flex', alignItems: 'center'})}><ChevronDown />2.5%</div>
      </div>
      <div>
        <div className={style({paddingBottom: 8})}>Conversion rate</div>
        <Meter variant="negative" value={0.5} label="0.5%" />
      </div>
    </div>
  );
}

function AudienceChart() {
  return (
    <div className={style({display: 'flex', flexDirection: 'column', backgroundColor: 'gray-25', borderWidth: 2, borderColor: 'gray-100', borderStyle: 'solid', borderRadius: 'lg', paddingY: 12, paddingX: 24, gap: 8})}>
      <Legend />
      <TargetAudience />
    </div>
  );
}

function ConversionGraph() {
  return (
    <div className={style({display: 'flex', flexDirection: 'column', backgroundColor: 'gray-25', borderWidth: 2, borderColor: 'gray-100', borderStyle: 'solid', borderRadius: 'lg', paddingY: 32, paddingX: 24, gap: 8})}>
      <div className={style({font: 'title'})}>Conversion</div>
      <ConversionActualGraph />
    </div>
  );
}

function AgoraDesign(props) {
  return (
    // @ts-ignore
    <div className={outerContainer}>
      <div {...props} className={background}>
        <div className={style({marginTop: 32, marginStart: 32})}>
          <div className={style({display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24})}>
            <div className={style({display: 'flex', alignItems: 'center'})}>
              <ActionButton size="M" aria-label="Go back"><ChevronLeft /></ActionButton>
              <div className={style({font: 'heading-lg', paddingX: 12})}>May '24 Spring Sale</div>
              <Button fillStyle="outline" variant="secondary" size="S" UNSAFE_style={{borderWidth: 0}}><Play /><Text>TVtube</Text></Button>
            </div>
            <div className={style({display: 'flex', alignItems: 'center', marginEnd: 12, gap: 8})}>
              <Button fillStyle="outline" variant="secondary"><More /></Button>
              <Button fillStyle="outline" variant="secondary"><Edit /></Button>
              <Button ><Add /></Button>
            </div>
          </div>
          <div>
            <Tabs aria-label="Agora Workspace" density="compact" selectedKey={'measure'}>
              <TabList>
                <Tab id="project">Project overview</Tab>
                <Tab id="discover">Discover</Tab>
                <Tab id="share">Share</Tab>
                <Tab id="measure">Measure</Tab>
              </TabList>
              <TabPanel id="project">
                <div>Hi project</div>
              </TabPanel>
              <TabPanel id="discover">
                <div>Hi project</div>
              </TabPanel>
              <TabPanel id="share">
                <div>Hi project</div>
              </TabPanel>
              <TabPanel id="measure">
                <div className={panel}>
                  <div className={style({display: 'flex', flexDirection: 'column', gap: 12})}>
                    <MeasureHeading />
                    <div className={style({display: 'flex', flexDirection: 'column', gap: 12, marginStart: 8})}>
                      <CampaignInfo />
                      <Divider orientation="horizontal" />
                      <div className={style({display: 'flex', borderWidth: 2, borderRadius: 'lg', borderStyle: 'solid', borderColor: 'gray-100', padding: 12, gap: 8, justifyContent: 'space-between'})}>
                        <CampaignPerformance />
                        <RecommendedActions />
                      </div>
                      <div className={style({font: 'title', marginStart: 8, marginTop: 12})}>Summary insights</div>
                      <div className={style({display: 'flex', gap: 24})}>
                        <div className={style({display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12})}>
                          <ImpressionCard />
                          <ConversionCard />
                          <AudienceChart />
                        </div>
                        <div>
                          <ConversionGraph />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Measurements = () => {
  return (
    <AgoraDesign />
  );
};

const metricCardStyles = style({
  backgroundColor: 'layer-1',
  borderRadius: 'lg',
  marginBottom: 12,
  border: 'thin',
  borderColor: 'gray-300',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'start',
  padding: 16,
  gap: 16
});

const personaIconContainerStyles = {
  borderRadius: 'full',
  width: 56,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: 'white'
};

const personaFlexContainerStyles = style({
  display: 'flex',
  flexDirection: 'row',
  gap: 16,
  alignItems: 'start'
});

const personaFlexColumnStyles = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: 1
});

const personaDetailsGridStyles = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 12,
  marginTop: 16
});

const detailLabelStyles = style({
  font: 'body-sm',
  color: 'gray-700'
});

const detailValueStyles = style({
  font: 'body-sm',
  fontWeight: 'medium'
});

const detailFlexColumnStyles = style({
  display: 'flex',
  flexDirection: 'column'
});

const metricTextContainerStyles = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4
});

const metricTitleStyles = style({
  font: 'heading-sm',
  fontWeight: 'bold'
});

const metricScoreStyles = style({
  font: 'heading-lg',
  fontWeight: 'bold'
});

const metricValueStyles = {
  font: 'heading-sm',
  fontWeight: 'medium',
  borderStyle: 'solid',
  borderWidth: '[6px]',
  borderRadius: 'full',
  width: 60,
  height: 60,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1
};

const checkItemStatusStyles = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginLeft: 'auto'
});

const meterStyles = style({
  width: 160
});

const personaCardStyles = style({
  borderRadius: 'lg',
  marginBottom: 12,
  border: 'thin',
  borderColor: 'gray-300',
  position: 'relative',
  padding: 24,
  gap: 16,
  backgroundColor: 'green-100',
  borderStyle: 'solid',
  borderWidth: 1
});

function ValidateAudienceComponent() {
  return (
    <div
      className={style({
        borderRadius: 'xl',
        padding: 24,
        backgroundColor: 'layer-1'
      })}>
      {/* Header */}
      <header className={style({display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24})}>
        <h2 className={style({font: 'heading'})}>Validate audience</h2>
        <ButtonGroup>
          <Button variant="secondary" fillStyle="outline">Cancel</Button>
          <Button variant="accent">
            <CheckmarkCircle />
            <Text>Activate</Text>
          </Button>
        </ButtonGroup>
      </header>

      {/* Metrics Section */}
      <section className={style({display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24})}>
        <div className={metricCardStyles}>
          <div className={style({...metricValueStyles, borderColor: 'green-700'})}>95</div>
          <div className={metricTextContainerStyles}>
            <span className={metricTitleStyles}>Audience quality</span>
            <span className={metricScoreStyles}>95/100</span>
          </div>
        </div>
        <div className={metricCardStyles}>
          <div className={style({...metricValueStyles, borderColor: 'orange-900'})}>67</div>
          <div className={metricTextContainerStyles}>
            <span className={metricTitleStyles}>Data readiness</span>
            <span className={metricScoreStyles}>67/100</span>
          </div>
        </div>
        <div className={metricCardStyles}>
          <div className={style({...metricValueStyles, borderColor: 'green-700'})}>83</div>
          <div className={metricTextContainerStyles}>
            <span className={metricTitleStyles}>Activation readiness</span>
            <span className={metricScoreStyles}>83/100</span>
          </div>
        </div>
      </section>

      {/* Main Content: Summary + Checks */}
      <section className={style({display: 'grid', gridTemplateColumns: '[summary] 1fr [checks] 2fr', gap: 32, padding: 24, backgroundColor: 'layer-1', borderRadius: 'lg', boxShadow: 'elevated'})}>
        {/* Summary */}
        <article>
          <h4 className={style({font: 'heading', marginTop: 0, marginBottom: 16})}>Summary</h4>
          <p className={style({font: 'body'})}>
            The audience validation shows that the audience size of 650K and propensity score of 85 meet the objectives, indicating strong targeting potential. However, the data contains malformed fields and 5% of rows are missing customer IDs, which could hinder matching and cause deduplication issues, affecting targeting accuracy.
          </p>
        </article>

        {/* Checks */}
        <aside>
          <h4 className={style({font: 'heading', fontWeight: 'bold', marginTop: 0, marginBottom: 16})}>8 Checks</h4>
          <Accordion isQuiet>
            <Disclosure id="audience-size">
              <DisclosureHeader>
                <DisclosureTitle>
                  <PeopleGroup /> <span>Audience size</span>
                </DisclosureTitle>
                <div className={checkItemStatusStyles}>
                  <Badge variant="positive" fillStyle="subtle">
                    <Checkmark aria-label="Passed" />
                    <Text>Passed</Text>
                  </Badge>
                </div>
              </DisclosureHeader>
              <DisclosurePanel>
                Audience size details...
              </DisclosurePanel>
            </Disclosure>

            <Disclosure id="propensity-score">
              <DisclosureHeader>
                <DisclosureTitle>
                  <ShoppingCart /> <span>Propensity score</span>
                </DisclosureTitle>
                <div className={checkItemStatusStyles}>
                  <Badge variant="positive" fillStyle="subtle"><Checkmark aria-label="Passed" /> <Text>Passed</Text></Badge>
                </div>
              </DisclosureHeader>
              <DisclosurePanel>
                Propensity score details...
              </DisclosurePanel>
            </Disclosure>

            <Disclosure id="objective-reached">
              <DisclosureHeader>
                <DisclosureTitle>
                  <Target /> <span>Objective reached</span>
                </DisclosureTitle>
                <div className={checkItemStatusStyles}>
                  <Badge variant="positive" fillStyle="subtle"><Checkmark aria-label="Passed" /> <Text>Passed</Text></Badge>
                </div>
              </DisclosureHeader>
              <DisclosurePanel>
                Objective reached details...
              </DisclosurePanel>
            </Disclosure>

            <Disclosure id="audience-overlap">
              <DisclosureHeader>
                <DisclosureTitle>
                  <Circle /> <Text>Audience overlap</Text>
                </DisclosureTitle>
                <div className={checkItemStatusStyles}>
                  <Badge variant="positive" fillStyle="subtle"><Checkmark aria-label="Passed" /> <Text>Passed</Text></Badge>
                </div>
              </DisclosureHeader>
              <DisclosurePanel>
                Audience overlap details...
              </DisclosurePanel>
            </Disclosure>

            <Disclosure id="regulatory-compliance">
              <DisclosureHeader>
                <DisclosureTitle>
                  <FileText /> <span>Regulatory compliance</span>
                </DisclosureTitle>
                <div className={checkItemStatusStyles}>
                  <Badge variant="positive" fillStyle="subtle"><Checkmark aria-label="Passed" /> <Text>Passed</Text></Badge>
                </div>
              </DisclosureHeader>
              <DisclosurePanel>
                Regulatory compliance details...
              </DisclosurePanel>
            </Disclosure>

            <Disclosure id="data-freshness">
              <DisclosureHeader>
                <DisclosureTitle>
                  <FileText /> <span>Data freshness</span>
                </DisclosureTitle>
                <div className={checkItemStatusStyles}>
                  <Badge variant="positive" fillStyle="subtle"><Checkmark aria-label="Passed" /> <Text>Passed</Text></Badge>
                </div>
              </DisclosureHeader>
              <DisclosurePanel>
                Data freshness details...
              </DisclosurePanel>
            </Disclosure>

            <Disclosure id="data-completeness">
              <DisclosureHeader>
                <DisclosureTitle>
                  <Data /> <span>Data completeness & integrity</span>
                </DisclosureTitle>
                <div className={checkItemStatusStyles}>
                  <Meter label=" " labelPosition="side" aria-label="Data completeness & integrity" value={67} variant="notice" styles={meterStyles} />
                </div>
              </DisclosureHeader>
              <DisclosurePanel>
                Data completeness & integrity details...
              </DisclosurePanel>
            </Disclosure>

            <Disclosure id="destination-compatibility">
              <DisclosureHeader>
                <DisclosureTitle>
                  <Circle /> <Text>Destination compatibility</Text>
                </DisclosureTitle>
                <div className={checkItemStatusStyles}>
                  <Meter label=" " labelPosition="side" aria-label="Destination compatibility" value={83} variant="positive"  styles={meterStyles} />
                </div>
              </DisclosureHeader>
              <DisclosurePanel>
                Destination compatibility details...
              </DisclosurePanel>
            </Disclosure>
          </Accordion>
        </aside>
      </section>
    </div>
  );
}

export const ValidateAudience = () => {
  return <ValidateAudienceComponent />;
};

function TargetBuyingGroupComponent() {
  return (
    <section className={style({marginBottom: 24})}>
      <h2 className={style({font: 'heading-lg', marginBottom: 8})}>Target buying group</h2>
      <p className={style({font: 'body', marginBottom: 8})}>NVAIE AI-generated buying group persona will be used to create buying groups for each of the accounts in the target account audience above.</p>

      <h4 className={style({font: 'heading', marginBottom: 8})}>Buying group roles</h4>

      <div className={style({display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12})}>
        {/* Decision Maker Card */}
        <div className={personaCardStyles}>
          <div className={personaFlexContainerStyles}>
            <div className={style({...personaIconContainerStyles, backgroundColor: 'pink-600'})}>
              <User />
            </div>
            <div className={personaFlexColumnStyles}>
              <h5 className={style({font: 'title', margin: 0})}>Decision maker</h5>
              <p className={style({font: 'body', margin: 0})}><strong className={style({fontWeight: 'bold'})}>Role description:</strong> A person who ultimately makes the final purchase decision.</p>
              <p className={style({font: 'body', margin: 0})}><strong className={style({fontWeight: 'bold'})}>Role summary:</strong> an executive-level person for an organization who would like to consider purchasing Nvidia AI Enterprise solution. This person cares about the product features and ROI.</p>
              <Divider size="S" />
              <div className={personaDetailsGridStyles}>
                <div className={detailFlexColumnStyles}>
                  <span className={detailLabelStyles}>Job function</span>
                  <span className={detailValueStyles}>Engineering</span>
                </div>
                <div className={detailFlexColumnStyles}>
                  <span className={detailLabelStyles}>Job level</span>
                  <span className={detailValueStyles}>C-level, VP</span>
                </div>
                <div className={detailFlexColumnStyles}>
                  <span className={detailLabelStyles}>Content interests</span>
                  <span className={detailValueStyles}>ROI, capabilities, competitor differentiators</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Practitioner Card */}
        <div className={personaCardStyles}>
          <div className={personaFlexContainerStyles}>
            <div className={style({...personaIconContainerStyles, backgroundColor: 'seafoam-600'})}>
              <User />
            </div>
            <div className={personaFlexColumnStyles}>
              <h5 className={style({font: 'title', margin: 0})}>Practitioner</h5>
              <p className={style({font: 'body', margin: 0})}><strong className={style({fontWeight: 'bold'})}>Role description:</strong> A person who is the end user of the product.</p>
              <p className={style({font: 'body', margin: 0})}><strong className={style({fontWeight: 'bold'})}>Role summary:</strong> An AI/ML engineer or leader for an organization who would like to consider purchasing Nvidia AI Enterprise solution. This person cares about the product features capabilities.</p>
              <Divider size="S" />
              <div className={personaDetailsGridStyles}>
                <div className={detailFlexColumnStyles}>
                  <span className={detailLabelStyles}>Job function</span>
                  <span className={detailValueStyles}>Engineering</span>
                </div>
                <div className={detailFlexColumnStyles}>
                  <span className={detailLabelStyles}>Job level</span>
                  <span className={detailValueStyles}>Director, manager, principal</span>
                </div>
                <div className={detailFlexColumnStyles}>
                  <span className={detailLabelStyles}>Content interests</span>
                  <span className={detailValueStyles}>Capabilities, features, ease-of-use</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Influencer Card */}
        <div className={personaCardStyles}>
          <div className={personaFlexContainerStyles}>
            <div className={style({...personaIconContainerStyles, backgroundColor: 'yellow-600'})}>
              <User />
            </div>
            <div className={personaFlexColumnStyles}>
              <h5 className={style({font: 'title', margin: 0})}>Influencer</h5>
              <p className={style({font: 'body', margin: 0})}><strong className={style({fontWeight: 'bold'})}>Role description:</strong> A person who is will be influencing the decision-making process.</p>
              <p className={style({font: 'body', margin: 0})}><strong className={style({fontWeight: 'bold'})}>Role summary:</strong> This may be an executive or head of department for an organization who would like to consider purchasing Nvidia AI Enterprise solution. This person cares about case studies and roadmap.</p>
              <Divider size="S" />
              <div className={personaDetailsGridStyles}>
                <div className={detailFlexColumnStyles}>
                  <span className={detailLabelStyles}>Job function</span>
                  <span className={detailValueStyles}>Engineering, R&D,</span>
                </div>
                <div className={detailFlexColumnStyles}>
                  <span className={detailLabelStyles}>Job level</span>
                  <span className={detailValueStyles}>C-level, Heads, Manager</span>
                </div>
                <div className={detailFlexColumnStyles}>
                  <span className={detailLabelStyles}>Content interests</span>
                  <span className={detailValueStyles}>Case studies, ROI, future roadmap</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* IT/Security Card */}
        <div className={personaCardStyles}>
          <div className={personaFlexContainerStyles}>
            <div className={style({...personaIconContainerStyles, backgroundColor: 'purple-600'})}>
              <Lock />
            </div>
            <div className={personaFlexColumnStyles}>
              <h5 className={style({font: 'title', margin: 0})}>IT/Security</h5>
              <p className={style({font: 'body', margin: 0})}><strong className={style({fontWeight: 'bold'})}>Role description:</strong> A person who is will be influencing the decision-making process.</p>
              <p className={style({font: 'body', margin: 0})}><strong className={style({fontWeight: 'bold'})}>Role summary:</strong> This may be an executive or head of department for an organization who would like to consider purchasing Nvidia AI Enterprise solution. This person cares about case studies and roadmap.</p>
              <Divider size="S" />
              <div className={personaDetailsGridStyles}>
                <div className={detailFlexColumnStyles}>
                  <span className={detailLabelStyles}>Job function</span>
                  <span className={detailValueStyles}>IT, Security, Engineering</span>
                </div>
                <div className={detailFlexColumnStyles}>
                  <span className={detailLabelStyles}>Job level</span>
                  <span className={detailValueStyles}>Director, C-level, Admin</span>
                </div>
                <div className={detailFlexColumnStyles}>
                  <span className={detailLabelStyles}>Content interests</span>
                  <span className={detailValueStyles}>Security features, compliance, case studies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const TargetBuyingGroup = () => {
  return <TargetBuyingGroupComponent />;
};
