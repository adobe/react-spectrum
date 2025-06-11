'use client';

import React, { useMemo } from "react";
import { focusRing, style } from "@react-spectrum/s2/style" with { type: "macro" };
import { Card, CardPreview, Content, Text, Image } from "@react-spectrum/s2";
import { Link } from "react-aria-components";
import { Page } from "@parcel/rsc";

interface IExampleSection {
  id: string,
  name: string,
  children?: IExampleItem[]
}

interface IExampleItem {
  id: string,
  name: string,
  description?: string,
  href: string,
  thumbnail?: URL | string,
}

interface CardListProps {
  selectedLibrary: 'react-spectrum' | 'react-aria' | 'internationalized';
  pages?: Page[]
}

const linkCardStyles = style({
  textDecoration: 'none',
  borderRadius: 'default',
  ...focusRing()
});

export function CardList({ selectedLibrary, pages }: CardListProps) {
  let sectionsData = useMemo(() => {
    if (!pages || !Array.isArray(pages)) {
      return [];
    }

    const components = pages
      .filter(page => {
        if (!page.url || !page.url.endsWith('.html')) {
          return false;
        }

        let library: 'react-spectrum' | 'react-aria' | 'internationalized' = 'react-spectrum';
        if (page.url.includes('react-aria')) {
          library = 'react-aria';
        } else if (page.url.includes('react-internationalized')) {
          library = 'internationalized';
        }
        
        return library === selectedLibrary;
      })
      .map(page => {
        const name = page.url.replace(/^\//, '').replace(/\.html$/, '');
        const title = page.tableOfContents?.[0]?.title || name;
        
        return {
          id: name,
          name: title,
          description: `${title} documentation`,
          href: page.url
        };
      });

    const section: IExampleSection = {
      id: 'components',
      name: 'Components',
      children: components
    };

    return [section];
  }, [pages, selectedLibrary]);

  return (
    <nav className={style({ 
      maxHeight: '[80vh]',
      overflow: 'auto',
      margin: 16,
      padding: 16,
    })}>
      {sectionsData.map((section: IExampleSection) => (
        <div key={section.id}>
          <h3 
            id={section.id} 
            className={style({
              font: 'heading',
              marginTop: 32,
              position: 'relative',
              scrollMarginTop: 16
            })}
          >
            {section.name}
          </h3>
          
          <div className={style({ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, 192px)',
            columnGap: 16,
            rowGap: 16
          })}>
            {section.children && section.children.map((item) => (
              <Link href={item.href} key={item.id} className={linkCardStyles}>
                <Card
                  id={item.id}
                  textValue={item.name}
                  size="S"
                >
                  <CardPreview>
                    <Image
                      alt={item.name}
                      src={item.thumbnail?.toString() ?? 'https://placehold.co/600x400'}
                      styles={style({
                        width: 'full',
                        pointerEvents: 'none'
                      })} />
                  </CardPreview>
                  <Content>
                    <Text slot="title">{item.name}</Text>
                    {item.description && <Text slot="description">{item.description}</Text>}
                  </Content>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default CardList;