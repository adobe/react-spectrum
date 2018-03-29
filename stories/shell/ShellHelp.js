import {action, storiesOf} from '@storybook/react';
import Launch from '../../src/Icon/Launch';
import React from 'react';
import ShellHelp from '../../src/Shell/js/ShellHelp';
import User from '../../src/Icon/User';
import {VerticalCenter} from '../../.storybook/layout';

const options = {inline: true};
const storyTitle = 'ShellHelp - @deprecated';
const deprecatedFlag = (<div>
  <h2 style={{'color': '#990000'}}>{ storyTitle }</h2>
  <p>ShellHelp component has been deprecated in favor of
    <a href="http://excsdk.corp.adobe.com" target="blank"> ExC SDK </a>and its corresponding component
    <a href="http://excsdk.corp.adobe.com/#!/SuperComponents/ShellHelp" target="blank"> ShellHelp </a>
  </p>
</div>);

storiesOf(storyTitle, module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    deprecatedFlag,
    () => render(),
    options
  )
  .addWithInfo(
    'open: true',
    deprecatedFlag,
    () => render({open: true}),
    options
  )
  .addWithInfo(
    'defaultResults',
    deprecatedFlag,
    () => render({defaultResults, open: true}),
    options
  )
  .addWithInfo(
    'onChange',
    deprecatedFlag,
    () => render({defaultResults, open: true, onChange: action('change')}),
    options
  )
  .addWithInfo(
    'onHide',
    deprecatedFlag,
    () => render({defaultResults, onHide: action('hiding')}),
    options
  )
  .addWithInfo(
    'searchResults: 0',
    deprecatedFlag,
    () => render({searchResults: [], numTotalResults: 0, open: true}),
    options
  )
  .addWithInfo(
    '5 searchResults',
    deprecatedFlag,
    () => render({
      searchResults: searchResults.slice(5),
      numTotalResults: 5,
      moreSearchResultsUrl,
      open: true
    }),
    options
  )
  .addWithInfo(
    '1000 searchResults',
    deprecatedFlag,
    () => render({
      searchResults,
      numTotalResults: 1000,
      moreSearchResultsUrl,
      open: true
    }),
    options
  )
  .addWithInfo(
    'loading: true',
    deprecatedFlag,
    () => render({loading: true, open: true}),
    options
  );

function render(props = {}) {
  return (
    <ShellHelp
      moreSearchResultsUrl="#"
      onSearch={action('search')}
      {...props} />
  );
}

const moreSearchResultsUrl = 'https://marketing.adobe.com/resources/help/en_US/home/';

const defaultResults = [
  {
    href: '/foo',
    icon: <Launch />,
    label: 'React Coral'
  },
  {
    href: '/community',
    icon: <User />,
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
