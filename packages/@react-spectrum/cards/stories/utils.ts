
let images = [
  'https://i.imgur.com/Z7AzH2c.jpg',
  'https://i.imgur.com/DhygPot.jpg',
  'https://i.imgur.com/L7RTlvI.png',
  'https://i.imgur.com/1nScMIH.jpg',
  'https://i.imgur.com/zzwWogn.jpg'
];

export function getImage(index: number) {
  return images[index % images.length];
}
