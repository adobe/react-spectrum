/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  AssetCard,
  CardPreview,
  CardView,
  Content,
  Image,
  Text
} from '../src';
import {describe, expect, it} from 'vitest';
import React from 'react';
import {render} from './utils/render';

describe('CardView', () => {
  it('renders', async () => {
    const screen = await render(
      <CardView aria-label="Nature photos">
        <AssetCard textValue="Desert Sunset">
          <CardPreview>
            <Image src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={400} />
          </CardPreview>
          <Content>
            <Text slot="title">Desert Sunset</Text>
            <Text slot="description">PNG • 2/3/2024</Text>
          </Content>
        </AssetCard>
        <AssetCard textValue="Hiking Trail">
          <CardPreview>
            <Image src="https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} />
          </CardPreview>
          <Content>
            <Text slot="title">Hiking Trail</Text>
            <Text slot="description">JPEG • 1/10/2022</Text>
          </Content>
        </AssetCard>
        <AssetCard textValue="Lion">
          <CardPreview>
            <Image src="https://images.unsplash.com/photo-1629812456605-4a044aa38fbc?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={899} />
          </CardPreview>
          <Content>
            <Text slot="title">Lion</Text>
            <Text slot="description">JPEG • 8/28/2021</Text>
          </Content>
        </AssetCard>
        <AssetCard textValue="Mountain Sunrise">
          <CardPreview>
            <Image src="https://images.unsplash.com/photo-1722172118908-1a97c312ce8c?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} />
          </CardPreview>
          <Content>
            <Text slot="title">Mountain Sunrise</Text>
            <Text slot="description">PNG • 3/15/2015</Text>
          </Content>
        </AssetCard>
        <AssetCard textValue="Giraffe tongue">
          <CardPreview>
            <Image src="https://images.unsplash.com/photo-1574870111867-089730e5a72b?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} />
          </CardPreview>
          <Content>
            <Text slot="title">Giraffe tongue</Text>
            <Text slot="description">PNG • 11/27/2019</Text>
          </Content>
        </AssetCard>
        <AssetCard textValue="Golden Hour">
          <CardPreview>
            <Image src="https://images.unsplash.com/photo-1718378037953-ab21bf2cf771?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={402} />
          </CardPreview>
          <Content>
            <Text slot="title">Golden Hour</Text>
            <Text slot="description">WEBP • 7/24/2024</Text>
          </Content>
        </AssetCard>
        <AssetCard textValue="Architecture">
          <CardPreview>
            <Image src="https://images.unsplash.com/photo-1721661657253-6621d52db753?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDYxfE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D" width={600} height={900} />
          </CardPreview>
          <Content>
            <Text slot="title">Architecture</Text>
            <Text slot="description">PNG • 12/24/2016</Text>
          </Content>
        </AssetCard>
        <AssetCard textValue="Peeking leopard">
          <CardPreview>
            <Image src="https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={400} />
          </CardPreview>
          <Content>
            <Text slot="title">Peeking leopard</Text>
            <Text slot="description">JPEG • 3/2/2016</Text>
          </Content>
        </AssetCard>
        <AssetCard textValue="Roofs">
          <CardPreview>
            <Image src="https://images.unsplash.com/photo-1721598359121-363311b3b263?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDc0fE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D" width={600} height={900} />
          </CardPreview>
          <Content>
            <Text slot="title">Roofs</Text>
            <Text slot="description">JPEG • 4/24/2025</Text>
          </Content>
        </AssetCard>
        <AssetCard textValue="Half Dome Deer">
          <CardPreview>
            <Image src="https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={990} />
          </CardPreview>
          <Content>
            <Text slot="title">Half Dome Deer</Text>
            <Text slot="description">DNG • 8/28/2018</Text>
          </Content>
        </AssetCard>
      </CardView>
    );
    expect(screen.container.firstChild).toBeInTheDocument();
  });
});
