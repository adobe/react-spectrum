import {Card} from '../src/Card';
import DocumentOutline from '../src/Icon/DocumentOutline';
import DropdownButton from '../src/DropdownButton/js/DropdownButton';
import {MenuItem} from '../src/Menu';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Card', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (<Card>
      <div>
        <div style={{'text-align': 'center'}}>
          <div style={{height: 136 + 'px', 'background-color': 'rgb(234, 234, 234)', 'border-top-right-radius': 4 + 'px', 'border-top-left-radius': 4 + 'px'}}>
            <DocumentOutline size="XXL" style={{'margin-top': 35 + 'px'}} />
          </div>
        </div>
        <div style={{'background-color': 'white', height: 120 + 'px', 'border-bottom-right-radius': 4 + 'px', 'border-bottom-left-radius': 4 + 'px'}}>
          <div style={{'display': 'flex', 'justify-content': 'space-between', 'padding-top': 15 + 'px', 'padding-right': 10 + 'px'}}>
            <div style={{'margin-left': 20 + 'px', 'color': 'rgb(75, 75, 75)'}}>Card Title</div>
            <DropdownButton alignRight>
              <MenuItem>Foo</MenuItem>
              <MenuItem>Bar</MenuItem>
              <MenuItem>Baz</MenuItem>
            </DropdownButton>
          </div>
          <div style={{'margin-left': 20 + 'px', 'color': 'rgb(112, 112, 112)'}}>Optional Metadata
            <br /> Can be two to three lines.
          </div>
        </div>
      </div>
    </Card>),
    {inline: true}
  )
  .addWithInfo(
    'Selected',
    () => (<Card selected>
      <div>
        <div style={{'text-align': 'center'}}>
          <div style={{height: 136 + 'px', 'background-color': 'rgb(234, 234, 234)', 'border-top-right-radius': 4 + 'px', 'border-top-left-radius': 4 + 'px'}}>
            <DocumentOutline size="XXL" style={{'margin-top': 35 + 'px'}} />
          </div>
        </div>
        <div style={{'background-color': 'white', height: 120 + 'px', 'border-bottom-right-radius': 4 + 'px', 'border-bottom-left-radius': 4 + 'px'}}>
          <div style={{'display': 'flex', 'justify-content': 'space-between', 'padding-top': 15 + 'px', 'padding-right': 10 + 'px'}}>
            <div style={{'margin-left': 20 + 'px', 'color': 'rgb(75, 75, 75)'}}>Card Title</div>
            <DropdownButton alignRight>
              <MenuItem>Foo</MenuItem>
              <MenuItem>Bar</MenuItem>
              <MenuItem>Baz</MenuItem>
            </DropdownButton>
          </div>
          <div style={{'margin-left': 20 + 'px', 'color': 'rgb(112, 112, 112)'}}>Optional Metadata
            <br /> Can be two to three lines.
          </div>
        </div>
      </div>
    </Card>),
    {inline: true}
  )

  .addWithInfo(
    'Selection Disabled',
    () => (<Card allowsSelection={false}>
      <div>
        <div style={{'text-align': 'center'}}>
          <div style={{height: 136 + 'px', 'background-color': 'rgb(234, 234, 234)', 'border-top-right-radius': 4 + 'px', 'border-top-left-radius': 4 + 'px'}}>
            <DocumentOutline size="XXL" style={{'margin-top': 35 + 'px'}} />
          </div>
        </div>
        <div style={{'background-color': 'white', height: 120 + 'px', 'border-bottom-right-radius': 4 + 'px', 'border-bottom-left-radius': 4 + 'px'}}>
          <div style={{'display': 'flex', 'justify-content': 'space-between', 'padding-top': 15 + 'px', 'padding-right': 10 + 'px'}}>
            <div style={{'margin-left': 20 + 'px', 'color': 'rgb(75, 75, 75)'}}>Card Title</div>
            <DropdownButton alignRight>
              <MenuItem>Foo</MenuItem>
              <MenuItem>Bar</MenuItem>
              <MenuItem>Baz</MenuItem>
            </DropdownButton>
          </div>
          <div style={{'margin-left': 20 + 'px', 'color': 'rgb(112, 112, 112)'}}>Optional Metadata
            <br /> Can be two to three lines.
          </div>
        </div>
      </div>
    </Card>),
    {inline: true}
);
