export interface Page {
  url: string,
  name: string,
  meta: any
}

export interface PageProps {
  pages: Page[],
  currentPage: Page
}
