import fs from 'fs';

async function fetchPage(page) {
  let res = await fetch(`https://perenual.com/api/species-list?key=sk-tZDd656803c94bb5d3204&indoor=1&page=${page}`);
  return (await res.json()).data;
}

let res = [];
for (let i = 0; i < 5; i++) {
  res.push(...await fetchPage(i));
}

let plants = [];
while (plants.length < 50) {
  let random = Math.floor(Math.random() * res.length);
  let plant = res[random];
  if (plant.default_image?.thumbnail && !plants.some(p => p.common_name === plant.common_name)) {
    plants.push(plant);
  }
}

console.log(plants);
fs.writeFileSync('plants.json', JSON.stringify(plants));
