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

function getLibraryLogo(subtitle) {
  if (subtitle === 'React Aria') {
    return {
      type: 'svg',
      props: {
        width: 156,
        height: 150,
        viewBox: '15.79 17.64 131.21 126.14',
        xmlns: 'http://www.w3.org/2000/svg',
        children: [
          {
            type: 'defs',
            props: {
              children: {
                type: 'clipPath',
                props: {
                  id: 'a',
                  children: {
                    type: 'path',
                    props: {
                      d: 'M80 136c30.93 0 56-25.07 56-56s-25.07-56-56-56-56 25.07-56 56 25.07 56 56 56Zm8.48-86.3c0 4.69-3.8 8.48-8.48 8.48s-8.48-3.8-8.48-8.48 3.8-8.48 8.48-8.48 8.48 3.8 8.48 8.48ZM51.09 61.78c.52-1.8 2.39-2.85 4.2-2.33a89.865 89.865 0 0 0 48.82.17l.64-.18c1.81-.5 3.68.55 4.18 2.36a3.39 3.39 0 0 1-2.36 4.18l-.64.18a97.139 97.139 0 0 1-15.51 2.98c-1.03.11-1.82.97-1.82 2.01v14.89c0 .18.03.37.08.55 1.37 4.83 2.94 10.39 4.32 15.27.98 3.46 1.86 6.58 2.49 8.85.32 1.14.58 2.06.76 2.71l.04.15c.13.48.27.97.31 1.16a3.38 3.38 0 0 1-2.66 3.99 3.38 3.38 0 0 1-3.99-2.66c.02.09 0 .04-.08-.27-.04-.13-.09-.31-.15-.54-.18-.65-.44-1.57-.76-2.7-.64-2.27-1.52-5.39-2.49-8.85l-3.74-13.21a1.992 1.992 0 0 0-1.92-1.45h-1.6c-.89 0-1.68.59-1.92 1.45-1.22 4.3-2.55 9.01-3.74 13.21-.98 3.46-1.85 6.58-2.49 8.85-.32 1.13-.58 2.06-.76 2.7-.06.23-.11.41-.15.54-.09.31-.1.36-.08.27a3.39 3.39 0 1 1-6.65-1.33c.04-.18.18-.68.31-1.16l.04-.15c.18-.65.44-1.58.76-2.71.64-2.27 1.52-5.39 2.49-8.85 1.38-4.88 2.95-10.44 4.32-15.27.05-.18.08-.36.08-.55V71.16c0-1.04-.79-1.9-1.82-2.01a96.504 96.504 0 0 1-16.17-3.17 3.395 3.395 0 0 1-2.33-4.2Z',
                      fill: 'none'
                    }
                  }
                }
              }
            }
          },
          {
            type: 'circle',
            props: {
              cx: 80,
              cy: 80,
              r: 50.83,
              fill: '#fff'
            }
          },
          {
            type: 'g',
            props: {
              clipPath: 'url(#a)',
              children: {
                type: 'path',
                props: {
                  d: 'M15.79 17.64H147v126.14H15.79z',
                  fill: '#269ff4'
                }
              }
            }
          }
        ]
      }
    };
  } else if (subtitle === 'Internationalized') {
    return {
      type: 'svg',
      props: {
        width: 156,
        height: 148,
        viewBox: '15 17 135 128',
        xmlns: 'http://www.w3.org/2000/svg',
        children: [
          {
            type: 'defs',
            props: {
              children: [
                {
                  type: 'clipPath',
                  props: {
                    id: 'b',
                    children: {
                      type: 'path',
                      props: {
                        d: 'M23.98 79.99c0-17.01 7.58-32.25 19.54-42.52.92 2.02 2.32 4.67 4 7.13 1.05 1.54 2.28 3.1 3.65 4.41 1.33 1.27 3.04 2.55 5.08 3.13 3.29.94 7.1.8 9.98.7l.88-.03c1.63-.05 2.94-.07 4.03.05 1.11.11 1.57.33 1.71.42.31.2.39.37.41.43.03.08.07.22.03.46-.09.52-.53 1.28-1.4 1.76-2.07 1.15-4.14 2.6-5.69 4.59-1.63 2.09-2.54 4.6-2.54 7.55 0 .86-.07 1.4-.15 1.72v.03c-.28.06-.81.1-1.7.03-.27-.02-.55-.05-.86-.07-2.32-.21-5.69-.5-8.87-.17-3.54.37-8.1 1.64-10.56 5.96-1.08 1.89-2.33 5.04-2.03 8.8.31 3.92 2.27 7.99 6.71 11.55 5.12 4.1 10.75 4.98 18.12 5.8 4.2.47 6.58 1.37 7.94 2.33 1.19.84 1.85 1.9 2.18 3.55.58 2.88-.4 7.19-2.43 12.45-.97 2.52-2.11 5.05-3.24 7.52-.25.54-.5 1.08-.74 1.61-.81 1.76-1.61 3.47-2.27 5.03C41.73 127.9 24 106.03 24 80.02Zm26.36-46.91c-.07-.17-.15-.33-.24-.49a55.64 55.64 0 0 1 12.37-5.84c.05.3.14.6.26.89 2.06 4.9 8.3 10.94 16.68 10.94 4.33 0 7.8-1.86 10.35-3.97 2.53-2.1 4.34-4.6 5.47-6.33.41-.63.62-1.34.65-2.04.69.2 1.37.42 2.05.65-.06.18-.1.37-.13.57-.67 4.46-1.44 10.7-.74 16.34.69 5.54 3.01 11.91 9.76 14.25 5.36 1.86 10.66.94 14.8-.9 2.74-1.22 5.23-2.96 7.07-4.9 2.11 3.7 3.81 7.65 5.04 11.81l-1.75-.36c-3.01-.59-7.06-1.26-11.28-1.54-4.16-.28-8.77-.19-12.78.91-4.02 1.1-8.1 3.44-9.84 8.13-4.86 13.11 1.7 21.06 3.39 22.75 2.55 2.55 5.17 3.75 7.1 4.62.23.11.46.21.67.31 1.86.87 3.19 1.63 4.54 3.58.47.67.94 1.89 1.3 3.74.34 1.8.52 3.89.58 6.11.07 2.2.02 4.41-.04 6.43l-.06 1.63c-.04 1.08-.07 2.1-.09 2.95a55.775 55.775 0 0 1-35.48 12.67c-2.09 0-4.15-.11-6.18-.34.44-.97.91-1.99 1.41-3.08.26-.55.52-1.12.79-1.71 1.15-2.49 2.37-5.21 3.44-7.97 2.05-5.28 3.89-11.54 2.82-16.9-.67-3.35-2.3-6.32-5.41-8.51-2.94-2.07-6.85-3.21-11.67-3.74-7.46-.83-10.89-1.6-14.01-4.09-2.9-2.32-3.62-4.43-3.74-5.93-.13-1.67.44-3.21 1-4.2.51-.9 1.72-1.68 4.44-1.97 2.35-.25 4.9-.03 7.3.18.31.03.62.05.93.08 2.86.24 5.98-.1 8.18-2.42 2.06-2.18 2.33-5.13 2.33-7.33 0-1.17.32-1.95.86-2.64.61-.79 1.63-1.6 3.26-2.51 2.83-1.57 4.87-4.32 5.4-7.4.56-3.26-.64-6.73-3.89-8.9-1.72-1.14-3.68-1.55-5.33-1.72-1.68-.17-3.48-.13-5.1-.08-.22 0-.44.01-.65.02-3.22.11-5.75.19-7.75-.38-.27-.08-.86-.38-1.74-1.22-.84-.8-1.72-1.89-2.58-3.15-1.73-2.53-3.12-5.37-3.79-7Zm73.36 81.97a55.79 55.79 0 0 0 12.32-35.06c0-2.49-.16-4.94-.48-7.34-.05 0-.09-.02-.12-.02-.14-.03-.29-.06-.42-.09-.2-.04-.45-.1-.74-.16l-.35-.08c-.87-.2-2.06-.46-3.47-.73-2.84-.56-6.52-1.16-10.27-1.41-3.81-.25-7.38-.11-10.13.64-2.73.75-3.97 1.89-4.45 3.2-3.38 9.13 1.14 13.91 1.55 14.32 1.49 1.49 2.84 2.11 4.77 3 .23.11.47.22.73.34 2.42 1.13 5.22 2.64 7.73 6.27 1.39 2 2.14 4.47 2.58 6.79.46 2.38.65 4.94.72 7.37.03 1 .04 1.99.03 2.96Zm.28-69.78a56.276 56.276 0 0 0-18.47-15.18c-.57 4.1-.99 8.75-.5 12.73.56 4.56 2.1 6.86 4.44 7.68 2.96 1.03 6.11.6 8.92-.65 2.91-1.3 4.85-3.21 5.46-4.32.05-.09.1-.18.16-.26ZM80 23.96c2.75 0 5.46.2 8.11.58-.9 1.31-2.06 2.75-3.46 3.91-1.61 1.33-3.33 2.13-5.24 2.13-4.39 0-7.99-3.27-9.19-5.78 3.17-.56 6.44-.85 9.78-.85Z',
                        fill: 'none'
                      }
                    }
                  }
                },
                {
                  type: 'clipPath',
                  props: {
                    id: 'c',
                    children: {
                      type: 'path',
                      props: {
                        d: 'M23.98 80c0-17.01 7.58-32.25 19.54-42.52.92 2.02 2.32 4.67 4 7.13 1.05 1.54 2.28 3.1 3.65 4.41 1.33 1.27 3.04 2.55 5.08 3.13 3.29.94 7.1.8 9.98.7l.88-.03c1.63-.05 2.94-.07 4.03.05 1.11.11 1.57.33 1.71.42.31.2.39.37.41.43.03.08.07.22.03.46-.09.52-.53 1.28-1.4 1.76-2.07 1.15-4.14 2.6-5.69 4.59-1.63 2.09-2.54 4.6-2.54 7.55 0 .86-.07 1.4-.15 1.72v.03c-.28.06-.81.1-1.7.03-.27-.02-.55-.05-.86-.07-2.32-.21-5.69-.5-8.87-.17-3.54.37-8.1 1.64-10.56 5.96-1.08 1.89-2.33 5.04-2.03 8.8.31 3.92 2.27 7.99 6.71 11.55 5.12 4.1 10.75 4.98 18.12 5.8 4.2.47 6.58 1.37 7.94 2.33 1.19.84 1.85 1.9 2.18 3.55.58 2.88-.4 7.19-2.43 12.45-.97 2.52-2.11 5.05-3.24 7.52-.25.54-.5 1.08-.74 1.61-.81 1.76-1.61 3.47-2.27 5.03C41.73 127.91 24 106.04 24 80.03Zm99.72 35.06A55.79 55.79 0 0 0 136.02 80c0-2.49-.16-4.94-.48-7.34-.05 0-.09-.02-.12-.02-.14-.03-.29-.06-.42-.09-.2-.04-.45-.1-.74-.16l-.35-.08c-.87-.2-2.06-.46-3.47-.73-2.84-.56-6.52-1.16-10.27-1.41-3.81-.25-7.38-.11-10.13.64-2.73.75-3.97 1.89-4.45 3.2-3.38 9.13 1.14 13.91 1.55 14.32 1.49 1.49 2.84 2.11 4.77 3 .23.11.47.22.73.34 2.42 1.13 5.22 2.64 7.73 6.27 1.39 2 2.14 4.47 2.58 6.79.46 2.38.65 4.94.72 7.37.03 1 .04 1.99.03 2.96Zm.28-69.77a56.276 56.276 0 0 0-18.47-15.18c-.57 4.1-.99 8.75-.5 12.73.56 4.56 2.1 6.86 4.44 7.68 2.96 1.03 6.11.6 8.92-.65 2.91-1.3 4.85-3.21 5.46-4.32.05-.09.1-.18.16-.26ZM80 23.98c2.75 0 5.46.2 8.11.58-.9 1.31-2.06 2.75-3.46 3.91-1.61 1.33-3.33 2.13-5.24 2.13-4.39 0-7.99-3.27-9.19-5.78 3.17-.56 6.44-.85 9.78-.85Z',
                        fill: 'none'
                      }
                    }
                  }
                }
              ]
            }
          },
          {
            type: 'g',
            props: {
              clipPath: 'url(#b)',
              children: {
                type: 'path',
                props: {
                  d: 'M15 17h135v128H15z',
                  fill: '#6995fe'
                }
              }
            }
          },
          {
            type: 'g',
            props: {
              clipPath: 'url(#c)',
              children: {
                type: 'path',
                props: {
                  d: 'M15 17.01h135v128H15z',
                  fill: '#099d59'
                }
              }
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
const files = await getMdxFiles(pagesDir);
console.log(`Generating OG images for ${files.length} pages…`);

for (let file of files) {
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
              gap: 44
            },
            children: [
              // Library logo
              getLibraryLogo(subtitle),
              // Library name
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 84,
                    fontWeight: 700,
                    lineHeight: 1.1
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
              gap: 44
            },
            children: [
              // Library logo
              getLibraryLogo(subtitle),
              // Text content
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0
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
  let outFile = path.join(outputDir, `${slug}.png`);
  await fs.mkdir(path.dirname(outFile), {recursive: true});
  await fs.writeFile(outFile, pngBuffer);
  console.log(`✓ ${slug}.png`);
}

console.log(`Finished! OG images are saved to ${path.relative(process.cwd(), outputDir)}`);
