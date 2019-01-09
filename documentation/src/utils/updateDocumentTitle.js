const SITE_TITLE = 'React Spectrum';
export default function updateDocumentTitle(title) {
  if (!document) return;
  // If title is not being explicitly set, use textContent of first H1 on the page.
  if (!title) {
    const h1 = document.querySelector('h1');
    title = !h1 ? '' : h1.textContent.trim();
  }
  if (title && title !== SITE_TITLE && title !== '') {
    document.title = `${title} | ${SITE_TITLE}`;
  } else if (document.title !== SITE_TITLE) {
    document.title = SITE_TITLE;
  }
}
