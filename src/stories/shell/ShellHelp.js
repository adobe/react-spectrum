import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../../.storybook/layout';

import ShellHelp from '../../shell/ShellHelp';

storiesOf('ShellHelp', module)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none' } }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    { inline: true }
  )
  .addWithInfo(
    'open: true',
    () => render({ open: true }),
    { inline: true }
  )
  .addWithInfo(
    'defaultResults',
    () => render({ defaultResults, open: true }),
    { inline: true }
  )
  .addWithInfo(
    'searchResults: 0',
    () => render({ searchResults: [], numTotalResults: 0, open: true }),
    { inline: true }
  )
  .addWithInfo(
    '5 searchResults',
    () => render({
      searchResults: searchResults.slice(5),
      numTotalResults: 5,
      moreSearchResultsUrl,
      open: true
    }),
    { inline: true }
  )
  .addWithInfo(
    '1000 searchResults',
    () => render({
      searchResults,
      numTotalResults: 1000,
      moreSearchResultsUrl,
      open: true
    }),
    { inline: true }
  )
  .addWithInfo(
    'loading: true',
    () => render({ loading: true, open: true }),
    { inline: true }
  );

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
    title: 'Create an A/B Test',
    tags: ['Target'],
    href: 'https://marketing.adobe.com/resources/help/en_US/target/target/t_test_create_ab.html'
  },
  {
    title: '&quot;Error Not a valid video file&quot; when YouTube URL is entered on a video post',
    tags: ['Social'],
    href: 'http://helpx.adobe.com/social/kb/valid-video-file-youtube.html'
  },
  {
    title: 'Create a Redirect Offer',
    tags: ['Target'],
    href: 'https://marketing.adobe.com/resources/help/en_US/target/target/t_offer_redirect.html'
  },
  {
    title: 'A/B Test',
    tags: ['Target'],
    href: 'https://marketing.adobe.com/resources/help/en_US/target/target/t_test_ab.html'
  },
  {
    title: 'Launching a Survey When a User Enters or Leaves a Web Page',
    tags: ['Analytics'],
    href: 'http://microsite.omniture.com/t2/help/en_US/survey/t_Launching_a_Survey_When_a_Users_Enters_or_Leaves_a_Web_Page_sur.html'
  },
  {
    title: 'Launching a Survey When a User Enters or Exits a Website',
    tags: ['Analytics'],
    href: 'http://microsite.omniture.com/t2/help/en_US/survey/t_Launching_a_Survey_When_a_User_Enters_or_Exits_a_Web_Site_sur.html'
  },
  {
    title: 'Launching a Survey From a Feedback Link',
    tags: ['Analytics'],
    href: 'http://microsite.omniture.com/t2/help/en_US/survey/t_Launching_a_Survey_From_a_Feedback_Link.html'
  },
  {
    title: 'Download a Report as a File',
    tags: ['Media Optimizer'],
    href: 'http://microsite.omniture.com/t2/help/en_US/scm/t_Downloading_a_Report_as_a_File_scm.html'
  },
  {
    title: 'Multivariate Test',
    tags: ['Target'],
    href: 'https://marketing.adobe.com/resources/help/en_US/target/mvt/c_multivariate_testing.html'
  },
  {
    title: 'Previewing a Survey using a Review URL',
    tags: ['Analytics'],
    href: 'http://microsite.omniture.com/t2/help/en_US/survey/t_Previewing_a_Public_Survey_sur.html'
  }
];
