import {fileURLToPath} from 'url';
import fs from 'fs/promises';
import matter from 'gray-matter';
import path from 'path';
import satori from 'satori';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.resolve(__dirname, '../pages');
const outputDir = path.resolve(__dirname, '../dist/og');

async function getMdxFiles(dir) {
  let entries = await fs.readdir(dir, {withFileTypes: true});
  let files = [];
  for (let entry of entries) {
    let fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await getMdxFiles(fullPath));
    } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function getTitle(filePath) {
  let raw = await fs.readFile(filePath, 'utf8');
  let parsed = matter(raw);
  if (parsed.data && parsed.data.title) {
    return parsed.data.title;
  }
  let match = parsed.content.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].trim();
  }
  return path.basename(filePath, path.extname(filePath));
}

function getSubtitle(slug) {
  let slugParts = slug.split('/');
  if (slugParts.length === 1) {
    return 'React Spectrum';
  }

  const folder = slugParts[0];
  switch (folder) {
    case 'react-aria':
      return 'React Aria';
    case 'internationalized':
      return 'Internationalized';
    case 's2':
    default:
      return 'React Spectrum';
  }
}

async function loadFont(url) {
  let res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch font: ${url}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

const [interRegular, interBold] = await Promise.all([
  loadFont('https://github.com/rsms/inter/blob/v3.19/docs/font-files/Inter-Regular.otf?raw=true'),
  loadFont('https://github.com/rsms/inter/blob/v3.19/docs/font-files/InterDisplay-Bold.otf?raw=true')
]);

await fs.mkdir(outputDir, {recursive: true});
const files = await getMdxFiles(pagesDir);
console.log(`Generating OG images for ${files.length} pages…`);

for (let file of files) {
  let title = await getTitle(file);
  let slug = path
    .relative(pagesDir, file)
    .replace(/\\/g, '/')
    .replace(/\.mdx?$/, '');
  let subtitle = getSubtitle(slug);

  let svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          padding: '80px',
          fontFamily: 'Inter',
          color: '#000000',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 48
        },
        children: [
          {
            type: 'svg',
            props: {
              width: 150,
              height: 133,
              viewBox: '0 0 501.71 444.05',
              xmlns: 'http://www.w3.org/2000/svg',
              children: {
                type: 'path',
                props: {
                  d: 'm297.58 444.05-36.45-101.4h-91.46l76.87-193.53 116.65 294.93h138.52L316.8 0H186.23L0 444.05h297.58z',
                  fill: '#EB1000',
                  strokeWidth: 0
                }
              }
            }
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column'
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 72,
                      fontWeight: 700,
                      lineHeight: 1.2
                    },
                    children: title
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      marginTop: 12,
                      fontSize: 40,
                      fontWeight: 500,
                      color: '#666'
                    },
                    children: subtitle
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: interRegular,
          weight: 400,
          style: 'normal'
        },
        {
          name: 'Inter',
          data: interBold,
          weight: 700,
          style: 'normal'
        }
      ]
    }
  );

  // Convert SVG -> PNG
  let pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  let outFile = path.join(outputDir, `${slug}.png`);
  await fs.mkdir(path.dirname(outFile), {recursive: true});
  await fs.writeFile(outFile, pngBuffer);
  console.log(`✓ ${slug}.png`);
}

console.log(`Finished! OG images are saved to ${path.relative(process.cwd(), outputDir)}`);
