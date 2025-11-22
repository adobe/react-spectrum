import type {SectionInfo} from './types.js';

export function parseSectionsFromMarkdown(lines: string[]): SectionInfo[] {
  const sections: SectionInfo[] = [];
  let inCode = false;
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (/^```/.test(line.trim())) {inCode = !inCode;}
    if (inCode) {continue;}
    if (line.startsWith('## ')) {
      const name = line.replace(/^##\s+/, '').trim();
      sections.push({name, startLine: idx, endLine: lines.length});
    }
  }
  for (let s = 0; s < sections.length - 1; s++) {
    sections[s].endLine = sections[s + 1].startLine;
  }
  return sections;
}

export function extractNameAndDescription(lines: string[]): {name: string, description?: string} {
  let name = '';
  let description: string | undefined = undefined;

  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('# ')) {
      name = line.replace(/^#\s+/, '').trim();
      i++;
      break;
    }
  }

  let descLines: string[] = [];
  let inCode = false;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line.trim())) {inCode = !inCode;}
    if (inCode) {continue;}
    if (line.trim() === '') {
      if (descLines.length > 0) {break;} else {continue;}
    }
    if (/^#{1,6}\s/.test(line) || /^</.test(line.trim())) {continue;}
    descLines.push(line);
  }
  if (descLines.length > 0) {
    description = descLines.join('\n').trim();
  }

  return {name, description};
}
