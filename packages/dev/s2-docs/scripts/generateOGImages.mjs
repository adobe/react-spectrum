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
const illustrationsDir = path.resolve(__dirname, '../../docs/pages/assets/component-illustrations');

const cssVariables = {
  '--anatomy-gray-50': '#FFFFFF',
  '--anatomy-gray-75': '#FDFDFE', 
  '--anatomy-gray-100': '#f4f6fc',
  '--anatomy-gray-200': '#E5EBF7',
  '--anatomy-gray-300': '#DAE2F4',
  '--anatomy-gray-400': '#beccea',
  '--anatomy-gray-500': '#a2b6e1',
  '--anatomy-gray-600': '#718dcf',
  '--anatomy-gray-700': '#4a6fc3',
  '--anatomy-gray-800': '#496EC2',
  '--anatomy-gray-900': '#486EC2',
  '--spectrum-global-color-gray-300': '#d3d3d3',
  '--spectrum-global-color-gray-400': '#bcbcbc',
  '--spectrum-global-color-gray-700': '#464646',
  '--spectrum-alias-border-color-focus': '#0f62fe'
};

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

const [adobeCleanRegular, adobeCleanBold] = await Promise.all([
  loadFont('https://use.typekit.net/af/cb695f/000000000000000000017701/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3'),
  loadFont('https://use.typekit.net/af/eaf09c/000000000000000000017703/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3')
]);

// Mappings for components that don't match their SVG file names
const componentSvgExceptions = {
  'GridList': 'ListView.svg',
  'Select': 'Picker.svg',
  'Drag and Drop': 'DragAndDrop.svg'
};

async function getComponentSvg(title) {
  // First try exception mappings
  let svgFileName = componentSvgExceptions[title];
  
  // If no exception mapping, try automatic name matching
  if (!svgFileName) {
    svgFileName = `${title}.svg`;
  }
  
  try {
    const svgPath = path.join(illustrationsDir, svgFileName);
    let svgContent = await fs.readFile(svgPath, 'utf8');
    
    // Replace CSS variables with actual colors
    for (const [variable, color] of Object.entries(cssVariables)) {
      svgContent = svgContent.replace(new RegExp(`var\\(${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'), color);
    }
    
    // Replace SVG background to match container background
    svgContent = svgContent.replace(/background:\s*var\(--anatomy-gray-100\)/g, 'background: #f8f8f8');
    svgContent = svgContent.replace(/background:\s*#f4f6fc/g, 'background: #f8f8f8');
    svgContent = svgContent.replace(/var\(--anatomy-font\)/g, 'adobe-clean');

    // Convert SVG to data URI for use as image source
    const svgBase64 = Buffer.from(svgContent).toString('base64');
    return `data:image/svg+xml;base64,${svgBase64}`;
  } catch (error) {
    console.warn(`Could not load SVG for ${title}: ${error.message}`);
    return null;
  }
}

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

  // Get component SVG if available
  const componentSvg = await getComponentSvg(title);
  if (!componentSvg) {
    continue;
  }

  let svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          fontFamily: 'adobe-clean',
          color: '#000000'
        },
        children: [
          // Top section: Component illustration
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '394px', // 10/16 of 630px total height
                backgroundColor: '#f8f8f8',
                padding: '40px',
                borderBottom: '1px solid #e5e5e5'
              },
              children: componentSvg ? {
                type: 'img',
                props: {
                  src: componentSvg,
                  style: {
                    width: '340px',
                    height: '320px',
                    objectFit: 'contain'
                  }
                }
              } : {
                type: 'div',
                props: {
                  style: {
                    fontSize: 72,
                    fontWeight: 400,
                    color: '#464646'
                  },
                  children: title
                }
              }
            }
          },
          // Bottom section: Adobe logo + text
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                height: '236px', // 6/16 of 630px total height
                padding: '0 60px',
                gap: 40
              },
              children: [
                // Adobe logo
                {
                  type: 'svg',
                  props: {
                    width: 156,
                    height: 138,
                    viewBox: '0 0 501.71 444.05',
                    xmlns: 'http://www.w3.org/2000/svg',
                    children: {
                      type: 'polygon',
                      props: {
                        fill: '#eb1000',
                        strokeWidth: 0,
                        points: '297.58 444.05 261.13 342.65 169.67 342.65 246.54 149.12 363.19 444.05 501.71 444.05 316.8 0 186.23 0 0 444.05 297.58 444.05 297.58 444.05'
                      }
                    }
                  }
                },
                // Text content
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: 84,
                            fontWeight: 700,
                            lineHeight: 1.1
                          },
                          children: title
                        }
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: 56,
                            fontWeight: 400,
                            color: '#464646'
                          },
                          children: subtitle
                        }
                      }
                    ]
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
          name: 'adobe-clean',
          data: adobeCleanRegular,
          weight: 400,
          style: 'normal'
        },
        {
          name: 'adobe-clean',
          data: adobeCleanBold,
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
