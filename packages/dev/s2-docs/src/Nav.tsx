import type {PageProps} from '../types';
import React from 'react';
import { Link } from './Link';

export function Nav({pages, currentPage}: PageProps) {
  return (
    <nav>
      <ul>
        {pages.map(page => (
          <li key={page.url}>
            <Link
              href={page.url}
              aria-current={page.url === currentPage.url ? 'page' : undefined}>
              {page.name.replace('.html', '')}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
