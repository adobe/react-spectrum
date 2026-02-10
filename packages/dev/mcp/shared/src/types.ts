export type SectionInfo = {
  name: string,
  startLine: number, // 0-based index where section heading starts
  endLine: number   // exclusive end line index for section content
};

export type PageInfo = {
  key: string,          // e.g. "s2/Button"
  name: string,         // from top-level heading
  description?: string, // first paragraph after name
  filePath: string,     // absolute path to markdown file
  sections: SectionInfo[]
};

export type Library = 's2' | 'react-aria';
