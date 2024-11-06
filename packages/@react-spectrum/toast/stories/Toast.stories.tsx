/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {ActionButton, Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {Checkbox} from '@react-spectrum/checkbox';
import {Content} from '@react-spectrum/view';
import {createLandmarkController, useLandmark} from '@react-aria/landmark';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Divider} from '@react-spectrum/divider';
import {Flex} from '@react-spectrum/layout';
import {Header} from '@react-spectrum/view';
import {Heading, Text} from '@react-spectrum/text';
import React, {SyntheticEvent, useEffect, useMemo, useRef, useState} from 'react';
import {SpectrumToastOptions} from '../src/ToastContainer';
import {ToastContainer, ToastQueue} from '../';
import {UNSTABLE_PortalProvider} from '@react-aria/overlays';

export default {
  title: 'Toast',
  decorators: [
    (story, {parameters}) => (
      <>
        {!parameters.disableToastContainer && <ToastContainer />}
        <MainLandmark>{story()}</MainLandmark>
      </>
    )
  ],
  args: {
    shouldCloseOnAction: false,
    timeout: null
  },
  argTypes: {
    timeout: {
      control: 'radio',
      options: [null, 5000]
    }
  }
};

export const Default = (args) => <RenderProvider {...args} />;
Default.story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          // Ignore landmark accessibility failures since the extra main is just for testing purposes
          // and not a explicit part of the Toast component
          {id: 'landmark-main-is-top-level', enabled: false},
          {id: 'landmark-no-duplicate-main', enabled: false},
          {id: 'landmark-unique', enabled: false}
        ]
      }
    }
  }
};


export const WithAction = (args) => (
  <RenderProvider {...args} actionLabel="Action" onAction={action('onAction')} />
);

WithAction.story = {
  name: 'With action',
  parameters: {
    a11y: {
      config: {
        rules: [
          {id: 'landmark-main-is-top-level', enabled: false},
          {id: 'landmark-no-duplicate-main', enabled: false},
          {id: 'landmark-unique', enabled: false}
        ]
      }
    }
  }
};


export const WithTestId = (args) => (
  <RenderProvider {...args} actionLabel="Action" onAction={action('onAction')} data-testid="hello i am a test id" />
);

WithTestId.story = {
  name: 'With test id',
  parameters: {
    a11y: {
      config: {
        rules: [
          {id: 'landmark-main-is-top-level', enabled: false},
          {id: 'landmark-no-duplicate-main', enabled: false},
          {id: 'landmark-unique', enabled: false}
        ]
      }
    }
  }
};

export const WithDialog = (args) => (
  <DialogTrigger isDismissable>
    <Button variant="accent">Open dialog</Button>
    <Dialog>
      <Heading>Toasty</Heading>
      <Content>
        <RenderProvider {...args} />
      </Content>
    </Dialog>
  </DialogTrigger>
);

WithDialog.story = {
  name: 'With dialog',
  parameters: {
    a11y: {
      config: {
        rules: [
          {id: 'landmark-main-is-top-level', enabled: false},
          {id: 'landmark-no-duplicate-main', enabled: false},
          {id: 'landmark-unique', enabled: false}
        ]
      }
    }
  }
};

export const MultipleToastContainers = (args) => <Multiple {...args} />;

MultipleToastContainers.story = {
  name: 'multiple ToastContainers',
  parameters: {
    disableToastContainer: true,
    a11y: {
      config: {
        rules: [
          {id: 'landmark-main-is-top-level', enabled: false},
          {id: 'landmark-no-duplicate-main', enabled: false},
          {id: 'landmark-unique', enabled: false}
        ]
      }
    }
  }
};

export const ProgrammaticallyClosing = (args) => <ToastToggle {...args} />;

ProgrammaticallyClosing.story = {
  name: 'programmatically closing',
  parameters: {
    a11y: {
      config: {
        rules: [
          {id: 'landmark-main-is-top-level', enabled: false},
          {id: 'landmark-no-duplicate-main', enabled: false},
          {id: 'landmark-unique', enabled: false}
        ]
      }
    }
  }
};

export const WithIframe = () => <IframeExample />;

WithIframe.story = {
  name: 'with iframe',
  parameters: {
    a11y: {
      config: {
        rules: [
          {id: 'aria-allowed-role', selector: '*:not(iframe[role="main"])'},
          {id: 'landmark-main-is-top-level', enabled: false},
          {id: 'landmark-no-duplicate-main', enabled: false},
          {id: 'landmark-unique', enabled: false}
        ]
      }
    }
  }
};

export let singleParagraph = () => <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text>;

let two = () => (
  <React.Fragment>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mi proin sed libero enim. Mattis ullamcorper velit sed ullamcorper morbi tincidunt. Sed enim ut sem viverra aliquet eget sit amet tellus. Diam quis enim lobortis scelerisque fermentum dui faucibus in ornare. Diam quam nulla porttitor massa id. Eleifend mi in nulla posuere sollicitudin. Turpis nunc eget lorem dolor sed viverra ipsum nunc. Faucibus in ornare quam viverra. Risus commodo viverra maecenas accumsan lacus vel facilisis volutpat est. Nam libero justo laoreet sit amet cursus sit. Netus et malesuada fames ac. Dictum fusce ut placerat orci nulla pellentesque dignissim enim sit. Eros donec ac odio tempor orci. Ut etiam sit amet nisl purus in mollis nunc. Nisl rhoncus mattis rhoncus urna neque viverra. Convallis aenean et tortor at risus. Diam phasellus vestibulum lorem sed risus ultricies.</p>
    <p>Eleifend quam adipiscing vitae proin sagittis nisl. Diam donec adipiscing tristique risus. In fermentum posuere urna nec tincidunt praesent semper. Suspendisse in est ante in. Egestas diam in arcu cursus euismod quis viverra nibh cras. Aliquam sem fringilla ut morbi tincidunt augue interdum. Lacus sed turpis tincidunt id aliquet risus feugiat. Praesent semper feugiat nibh sed pulvinar proin. In massa tempor nec feugiat nisl pretium fusce id velit. Non nisi est sit amet facilisis. Mi in nulla posuere sollicitudin aliquam ultrices. Morbi leo urna molestie at elementum. Laoreet non curabitur gravida arcu ac tortor dignissim convallis. Risus quis varius quam quisque id. Platea dictumst quisque sagittis purus. Etiam non quam lacus suspendisse faucibus interdum posuere. Semper feugiat nibh sed pulvinar proin gravida hendrerit lectus.</p>
    {/* <p>Risus ultricies tristique nulla aliquet enim tortor at. Ac placerat vestibulum lectus mauris. Sed viverra tellus in hac habitasse platea dictumst vestibulum rhoncus. Suspendisse ultrices gravida dictum fusce ut placerat orci nulla pellentesque. Sit amet nulla facilisi morbi tempus iaculis urna. Ut etiam sit amet nisl purus in. Risus at ultrices mi tempus imperdiet. Magna fermentum iaculis eu non diam phasellus. Orci sagittis eu volutpat odio. Volutpat blandit aliquam etiam erat velit scelerisque in dictum non. Amet nulla facilisi morbi tempus iaculis urna id. Iaculis eu non diam phasellus. Eu lobortis elementum nibh tellus molestie nunc. At tempor commodo ullamcorper a lacus vestibulum sed. Mi sit amet mauris commodo quis. Tellus elementum sagittis vitae et leo duis. Vel risus commodo viverra maecenas accumsan lacus.</p>
    <p>Ut porttitor leo a diam sollicitudin tempor id eu nisl. Tristique senectus et netus et malesuada fames ac turpis egestas. Tellus in hac habitasse platea dictumst vestibulum rhoncus est. Integer feugiat scelerisque varius morbi enim nunc faucibus a. Tempus quam pellentesque nec nam aliquam sem et. Quam viverra orci sagittis eu volutpat odio facilisis mauris. Nunc lobortis mattis aliquam faucibus purus in massa tempor. Tincidunt dui ut ornare lectus sit amet est. Magna fermentum iaculis eu non. Posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Vitae aliquet nec ullamcorper sit amet risus nullam eget felis. Vitae proin sagittis nisl rhoncus mattis rhoncus. Nunc vel risus commodo viverra maecenas. Diam in arcu cursus euismod. Dolor morbi non arcu risus quis varius quam. Amet nisl suscipit adipiscing bibendum. Nulla pellentesque dignissim enim sit amet venenatis. Nunc congue nisi vitae suscipit tellus mauris a diam maecenas. In hac habitasse platea dictumst vestibulum rhoncus est pellentesque elit</p>
    <p>Cras semper auctor neque vitae tempus quam pellentesque nec. Maecenas ultricies mi eget mauris pharetra et ultrices neque ornare. Vulputate enim nulla aliquet porttitor lacus luctus accumsan tortor posuere. Pellentesque habitant morbi tristique senectus et. Ipsum dolor sit amet consectetur adipiscing elit pellentesque. Sem et tortor consequat id porta nibh venenatis. Viverra nibh cras pulvinar mattis nunc sed blandit. Urna porttitor rhoncus dolor purus. Vivamus arcu felis bibendum ut. Cras sed felis eget velit aliquet. Sed tempus urna et pharetra pharetra. Viverra adipiscing at in tellus integer feugiat scelerisque varius morbi. Ac tortor vitae purus faucibus ornare suspendisse sed nisi lacus. Ultrices neque ornare aenean euismod elementum nisi quis eleifend quam. Vel turpis nunc eget lorem. Quisque egestas diam in arcu cursus euismod quis viverra. At tempor commodo ullamcorper a lacus vestibulum sed. Id aliquet lectus proin nibh nisl condimentum id venenatis. Quis viverra nibh cras pulvinar. Purus in mollis nunc sed.</p> */}
  </React.Fragment>
);


function RenderProvider(options: SpectrumToastOptions) {
  return (
    <>
      <DialogTrigger defaultOpen>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog height="600px">
            <Heading>The Heading</Heading>
            <Header>The Header</Header>
            <Divider />
            <Content>{singleParagraph()}</Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={close}>Cancel</Button>
              <Button
                onPress={() => ToastQueue.neutral('Toast available', {...options, onClose: action('onClose')})}
                variant="secondary">
                Show Neutral Toast
              </Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>
    </>
  );
}

function ToastToggle(options: SpectrumToastOptions) {
  let [close, setClose] = useState(null);

  return (
    <Button
      onPress={() => {
        if (!close) {
          let close = ToastQueue.negative('Unable to save', {...options, onClose: () => setClose(null)});
          setClose(() => close);
        } else {
          close();
        }
      }}
      variant="primary">
      {close ? 'Hide' : 'Show'} Toast
    </Button>
  );
}

function Multiple(options: SpectrumToastOptions) {
  let [isMounted1, setMounted1] = useState(true);

  return (
    <Flex direction="column">
      <Checkbox isSelected={isMounted1} onChange={setMounted1}>First mounted</Checkbox>
      {isMounted1 && <ToastContainer />}
      <MultipleInner />
      <RenderProvider {...options} />
    </Flex>
  );
}

function MultipleInner() {
  let [isMounted2, setMounted2] = useState(true);

  return (
    <>
      <Checkbox isSelected={isMounted2} onChange={setMounted2}>Second mounted</Checkbox>
      {isMounted2 && <ToastContainer />}
    </>
  );
}

function IframeExample() {
  let controller = useMemo(() => createLandmarkController(), []);
  useEffect(() => () => controller.dispose(), [controller]);
  let onLoad = (e: SyntheticEvent) => {
    let iframe = e.target as HTMLIFrameElement;
    let window = iframe.contentWindow;
    let document = window.document;

    // Catch toasts inside the iframe and redirect them outside.
    window.addEventListener('react-spectrum-toast', (e: CustomEvent) => {
      e.preventDefault();
      ToastQueue[e.detail.variant](e.detail.children, e.detail.options);
    });

    let prevFocusedElement = null;
    window.addEventListener('react-aria-landmark-navigation', (e: CustomEvent) => {
      e.preventDefault();
      let el = document.activeElement;
      if (el !== document.body) {
        prevFocusedElement = el;
      }

      // Prevent focus scope from stealing focus back when we move focus to the iframe.
      document.body.setAttribute('data-react-aria-top-layer', 'true');

      window.parent.postMessage({
        type: 'landmark-navigation',
        direction: e.detail.direction
      });

      setTimeout(() => {
        document.body.removeAttribute('data-react-aria-top-layer');
      }, 100);
    });

    // When the iframe is re-focused, restore focus back inside where it was before.
    window.addEventListener('focus', () => {
      if (prevFocusedElement) {
        prevFocusedElement.focus();
        prevFocusedElement = null;
      }
    });

    // Move focus to first or last landmark when we receive a message from the parent page.
    window.addEventListener('message', e => {
      if (e.data.type === 'landmark-navigation') {
        // (Can't use LandmarkController in this example because we need the controller instance inside the iframe)
        document.body.dispatchEvent(new KeyboardEvent('keydown', {key: 'F6', shiftKey: e.data.direction === 'backward', bubbles: true}));
      }
    });
  };

  useEffect(() => {
    let onMessage = (e: MessageEvent) => {
      let iframe = ref.current;
      if (e.data.type === 'landmark-navigation') {
        // Move focus to the iframe so that when focus is restored there, and we can redirect it back inside (below).
        iframe.focus();

        // Now re-dispatch the keyboard event so landmark navigation outside the iframe picks it up.
        controller.navigate(e.data.direction);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [controller]);

  let ref = useRef(null);
  let {landmarkProps} = useLandmark({
    role: 'main',
    focus(direction) {
      // when iframe landmark receives focus via landmark navigation, go to first/last landmark inside iframe.
      ref.current.contentWindow.postMessage({
        type: 'landmark-navigation',
        direction
      });
    }
  }, ref);

  return (
    <iframe
      ref={ref}
      {...landmarkProps}
      title="iframe"
      width="500"
      height="500"
      src="iframe.html?providerSwitcher-express=false&providerSwitcher-toastPosition=bottom&viewMode=story&id=toast--with-dialog"
      onLoad={onLoad}
      tabIndex={-1} />
  );
}

function MainLandmark(props) {
  let ref = useRef(undefined);
  let {landmarkProps} = useLandmark({...props, role: 'main'}, ref);
  return <main aria-label="Danni's unicorn corral" ref={ref} {...props} {...landmarkProps} style={{padding: 40, background: 'white'}}>{props.children}</main>;
}

export const withFullscreen = {
  render: () => <FullscreenApp />,
  parameters: {
    disableToastContainer: true
  }
};

function FullscreenApp(props) {
  let ref = useRef(null);
  let [isFullscreen, setFullscreen] = useState(false);
  let fullscreenPress = () => {
    if (!isFullscreen) {
      ref.current.requestFullscreen();
    }
  };
  useEffect(() => {
    let onFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);
  return (
    <div ref={ref} style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'white'}}>
      <UNSTABLE_PortalProvider getContainer={() => ref.current}>
        <RenderProvider {...props} />
        <ActionButton onPress={fullscreenPress}>Enter fullscreen</ActionButton>
        {isFullscreen && <ToastContainer key="miniapp" />}
      </UNSTABLE_PortalProvider>
      {!isFullscreen && <ToastContainer key="app" />}
    </div>
  );
}
