/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import agapanthus from 'url:./plants/agapanthus.jpg?as=webp';
import aloe from 'url:./plants/aloe.jpg?as=webp';
import dracaena from 'url:./plants/dracaena.jpg?as=webp';
import fern from 'url:./plants/fern.jpg?as=webp';
import fig from 'url:./plants/fig.jpg?as=webp';
import gardenia from 'url:./plants/gardenia.jpg?as=webp';
import ivy from 'url:./plants/ivy.jpg?as=webp';
import jacaranda from 'url:./plants/jacaranda.jpg?as=webp';
import maidenhair from 'url:./plants/maidenhair.jpg?as=webp';
import money from 'url:./plants/money.jpg?as=webp';
import monstera from 'url:./plants/monstera.jpg?as=webp';
import morning from 'url:./plants/morning.jpg?as=webp';
import nasturtium from 'url:./plants/nasturtium.jpg?as=webp';
import oleander from 'url:./plants/oleander.jpg?as=webp';
import poplar from 'url:./plants/poplar.jpg?as=webp';
import spider from 'url:./plants/spider.jpg?as=webp';
import star from 'url:./plants/star.jpg?as=webp';
import tree_fern from 'url:./plants/tree_fern.jpg?as=webp';
import xmas from 'url:./plants/xmas.jpg?as=webp';
import zz from 'url:./plants/zz.jpg?as=webp';

export interface Plant {
  id: number,
  common_name: string,
  scientific_name: string[],
  watering: string,
  sunlight: string[],
  cycle: string,
  default_image: {
    thumbnail: string
  },
  isFavorite?: boolean
}

export default [
  {
    id: 1,
    common_name: 'Aloe',
    scientific_name: ['Aloe vera'],
    watering: 'Minimum',
    sunlight: ['full sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: aloe
    }
  },
  {
    id: 2,
    common_name: 'Blue Jacaranda',
    scientific_name: ['Jacaranda mimosifolia'],
    watering: 'Minimum',
    sunlight: ['full sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: jacaranda
    }
  },
  {
    id: 3,
    common_name: 'Oleander',
    scientific_name: ['Nerium oleander'],
    watering: 'Minimum',
    sunlight: ['full sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: oleander
    }
  },
  {
    id: 4,
    common_name: 'Poplar',
    scientific_name: ['Populus'],
    watering: 'Average',
    sunlight: ['full sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: poplar
    }
  },
  {
    id: 5,
    common_name: 'Zanzibar Gem',
    scientific_name: ['Zamioculcas'],
    watering: 'Average',
    sunlight: ['part sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: zz
    }
  },
  {
    id: 6,
    common_name: 'Morning Glory',
    scientific_name: ['Ipomoea'],
    watering: 'Frequent',
    sunlight: ['full sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: morning
    }
  },
  {
    id: 7,
    common_name: 'Christmas Bush',
    scientific_name: ['Ceratopetalum gummiferum'],
    watering: 'Average',
    sunlight: ['full sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: xmas
    }
  },
  {
    id: 8,
    common_name: 'Gardenia',
    scientific_name: ['Gardenia jasminoides'],
    watering: 'Average',
    sunlight: ['part sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: gardenia
    }
  },
  {
    id: 9,
    common_name: 'Spider Plant',
    scientific_name: ['Chlorophytum comosum'],
    watering: 'Average',
    sunlight: ['part sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: spider
    }
  },
  {
    id: 10,
    common_name: 'Chinese Money Plant',
    scientific_name: ['Pilea peperomioides'],
    watering: 'Average',
    sunlight: ['part sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: money
    }
  },
  {
    id: 11,
    common_name: 'Fiddle Leaf Fig',
    scientific_name: ['Ficus lyrata'],
    watering: 'Average',
    sunlight: ['full sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: fig
    }
  },
  {
    id: 12,
    common_name: 'Tuberous Sword Fern',
    scientific_name: ['Nephrolepis cordifolia'],
    watering: 'Frequent',
    sunlight: ['part shade'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: fern
    }
  },
  {
    id: 13,
    common_name: 'Star Jasmine',
    scientific_name: ['Trachelospermum jasminoides'],
    watering: 'Frequent',
    sunlight: ['full sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: star
    }
  },
  {
    id: 14,
    common_name: 'Split-leaf Philodendron',
    scientific_name: ['Monstera deliciosa'],
    watering: 'Frequent',
    sunlight: ['part shade'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: monstera
    }
  },
  {
    id: 15,
    common_name: 'Agapanthus',
    scientific_name: ['Agapanthus praecox'],
    watering: 'Minimum',
    sunlight: ['full sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: agapanthus
    }
  },
  {
    id: 16,
    common_name: 'Tree Fern',
    scientific_name: ['Cyatheaceae'],
    watering: 'Frequent',
    sunlight: ['part sun'],
    cycle: 'Annual',
    default_image: {
      thumbnail: tree_fern
    }
  },
  {
    id: 17,
    common_name: 'Striped Dracaena',
    scientific_name: ['Asparagaceae'],
    watering: 'Average',
    sunlight: ['part sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: dracaena
    }
  },
  {
    id: 18,
    common_name: 'Delta Maidenhair Fern',
    scientific_name: ['Adiantum raddianum'],
    watering: 'Average',
    sunlight: ['part shade'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: maidenhair
    }
  },
  {
    id: 19,
    common_name: 'Ivy',
    scientific_name: ['Hedera'],
    watering: 'Frequent',
    sunlight: ['part sun'],
    cycle: 'Perennial',
    default_image: {
      thumbnail: ivy
    }
  },
  {
    id: 20,
    common_name: 'Nasturtium',
    scientific_name: ['Tropaeolum'],
    watering: 'Average',
    sunlight: ['full sun'],
    cycle: 'Annual',
    default_image: {
      thumbnail: nasturtium
    }
  }
] as Plant[];
