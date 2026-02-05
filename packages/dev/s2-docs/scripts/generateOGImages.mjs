import {fileURLToPath} from 'url';
import fs from 'fs/promises';
import matter from 'gray-matter';
import path from 'path';
import satori from 'satori';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.resolve(__dirname, '../pages');
const outputDir = path.resolve(__dirname, '../dist');

async function getTitle(filePath) {
  let raw = await fs.readFile(filePath, 'utf8');
  let parsed = matter(raw);
  if (parsed.data && parsed.data.title) {
    return parsed.data.title;
  }
  let match = parsed.content.match(/^#\s+(.+)$/m);
  if (match) {
    let title = match[1].trim();
    // Strip out any React components (like <VersionBadge />)
    title = title.replace(/<[A-Z]\w*[^>]*\/>/g, '').trim();
    title = title.replace(/<[A-Z]\w*[^>]*>.*?<\/[A-Z]\w*>/g, '').trim();
    return title;
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

function getLibraryLogo(subtitle) {
  if (subtitle === 'React Aria' || subtitle === 'Internationalized') {
    return {
      type: 'svg',
      props: {
        width: 156,
        height: 154,
        viewBox: '0 0 801 789',
        xmlns: 'http://www.w3.org/2000/svg',
        children: [
          {
            type: 'path',
            props: {
              d: 'M196.982 514.709C208.175 499.409 230.82 498.847 242.758 513.572L304.192 591.02H303.164L335.947 632.935C348.452 648.36 350.322 671.192 338.426 687.091L269.192 776.667C263.18 784.445 253.904 789 244.073 789H15.9042C2.67099 789 -4.75388 773.758 3.40515 763.34L138.368 591.02H138.3L196.982 514.709Z',
              fill: '#6733FF'
            }
          },
          {
            type: 'path',
            props: {
              d: 'M521.047 0C667.958 0 787.056 119.096 787.056 266.007C787.056 384.756 709.241 485.326 601.824 519.523L796.6 763.217C804.908 773.611 797.508 789 784.201 789H584.008C574.743 789 565.94 784.952 559.909 777.918L497.742 705.421L293.505 447.391C257.513 401.92 289.897 334.983 347.889 334.98L521.047 334.973C559.134 334.973 590.011 304.095 590.012 266.007C590.011 227.92 559.134 197.042 521.047 197.042H230.317C205.333 197.042 189.001 185.889 174.373 167.626L77.727 46.9705C62.5727 28.0503 76.0433 0.00115052 100.284 0H521.047Z',
              fill: '#6733FF'
            }
          }
        ]
      }
    };
  } else {
    // Adobe logo for React Spectrum
    return {
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
    };
  }
}

await fs.mkdir(outputDir, {recursive: true});

for await (let file of fs.glob('pages/*/**/*.mdx')) {
  let title = await getTitle(file);
  let slug = path
    .relative(pagesDir, file)
    .replace(/\\/g, '/')
    .replace(/\.mdx?$/, '');

  // Skip the error page
  if (slug === 'error') {
    continue;
  }

  let subtitle = getSubtitle(slug);
  let isIndexPage = slug === 'index' || slug.endsWith('/index');

  // Determine layout type
  let layout;
  if (isIndexPage) {
    // Index page layout: Centered logo and library name
    layout = {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '60px',
          backgroundColor: '#ffffff',
          fontFamily: 'adobe-clean',
          color: '#000000'
        },
        children: {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 44,
              maxWidth: '100%'
            },
            children: [
              // Library logo
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexShrink: 0
                  },
                  children: getLibraryLogo(subtitle)
                }
              },
              // Library name
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: 84,
                    fontWeight: 700,
                    lineHeight: 1.1,
                    flexShrink: 1,
                    minWidth: 0
                  },
                  children: subtitle
                }
              }
            ]
          }
        }
      }
    };
  } else {
    // Regular page layout: Centered logo + page title + library name
    layout = {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '60px',
          backgroundColor: '#ffffff',
          fontFamily: 'adobe-clean',
          color: '#000000'
        },
        children: {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 44,
              maxWidth: '100%'
            },
            children: [
              // Library logo
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexShrink: 0
                  },
                  children: getLibraryLogo(subtitle)
                }
              },
              // Text content
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                    flexShrink: 1,
                    minWidth: 0
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
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
                          display: 'flex',
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
      }
    };
  }

  let svg = await satori(
    layout,
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
  let [library, ...rest] = slug.split('/');
  let outFile = path.join(outputDir, `${library}/og/${rest.join('/')}.png`);
  await fs.mkdir(path.dirname(outFile), {recursive: true});
  await fs.writeFile(outFile, pngBuffer);
  console.log(`✓ ${slug}.png`);
}

console.log(`Finished! OG images are saved to ${path.relative(process.cwd(), outputDir)}`);
