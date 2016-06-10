import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../../.storybook/layout';

import ShellHelp from '../../shell/ShellHelp';

storiesOf('ShellHelp', module)
  .addDecorator(story => <VerticalCenter>{ story() }</VerticalCenter>)
  .add('Default', () => render())
  .add('open: true', () => render({ open: true }))
  .add('defaultResults', () => render({ defaultResults, open: true }))
  .add('searchResults: 0', () => render({ searchResults: [], numTotalResults: 0, open: true }))
  .add('5 searchResults', () => render({
    searchResults: searchResults.slice(5),
    numTotalResults: 5,
    moreSearchResultsUrl,
    open: true
  }))
  .add('1000 searchResults', () => render({
    searchResults,
    numTotalResults: 1000,
    moreSearchResultsUrl,
    open: true
  }))
  .add('loading: true', () => render({ loading: true, open: true }))

function render(props = {}) {
  return (
    <ShellHelp
      moreSearchResultsUrl="#"
      onSearch={ action('search') }
      { ...props }
    />
  );
}

const moreSearchResultsUrl = 'https://marketing.adobe.com/resources/help/en_US/home/';

const defaultResults = [
  {
    href: '/foo',
    icon: 'launch',
    label: 'React Coral'
  },
  {
    href: '/community',
    icon: 'users',
    label: 'Community'
  }
];

const searchResults = [
  {
    "label": "Create an A/B Test",
    "tags": ["Target"],
    "href": "https://marketing.adobe.com/resources/help/en_US/target/target/t_test_create_ab.html"
  },
  {
    "label": "&quot;Error Not a valid video file&quot; when YouTube URL is entered on a video post",
    "tags": ["Social"],
    "href": "http://helpx.adobe.com/social/kb/valid-video-file-youtube.html"
  },
  {
    "label": "Create a Redirect Offer",
    "tags": ["Target"],
    "href": "https://marketing.adobe.com/resources/help/en_US/target/target/t_offer_redirect.html",
  },
  {
    "label": "A/B Test",
    "tags": ["Target"],
    "href": "https://marketing.adobe.com/resources/help/en_US/target/target/t_test_ab.html"
  },
  {
    "label": "Launching a Survey When a User Enters or Leaves a Web Page",
    "tags": ["Analytics"],
    "href": "http://microsite.omniture.com/t2/help/en_US/survey/t_Launching_a_Survey_When_a_Users_Enters_or_Leaves_a_Web_Page_sur.html"
  },
  {
    "label": "Launching a Survey When a User Enters or Exits a Website",
    "tags": ["Analytics"],
    "href": "http://microsite.omniture.com/t2/help/en_US/survey/t_Launching_a_Survey_When_a_User_Enters_or_Exits_a_Web_Site_sur.html"
  },
  {
    "label": "Launching a Survey From a Feedback Link",
    "tags": ["Analytics"],
    "href": "http://microsite.omniture.com/t2/help/en_US/survey/t_Launching_a_Survey_From_a_Feedback_Link.html"
  },
  {
    "label": "Download a Report as a File",
    "tags": ["Media Optimizer"],
    "href": "http://microsite.omniture.com/t2/help/en_US/scm/t_Downloading_a_Report_as_a_File_scm.html"
  },
  {
    "label": "Multivariate Test",
    "tags": ["Target"],
    "href": "https://marketing.adobe.com/resources/help/en_US/target/mvt/c_multivariate_testing.html"
  },
  {
    "label": "Previewing a Survey using a Review URL",
    "tags": ["Analytics"],
    "href": "http://microsite.omniture.com/t2/help/en_US/survey/t_Previewing_a_Public_Survey_sur.html"
  }
];
