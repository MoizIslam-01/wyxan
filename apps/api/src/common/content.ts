import sanitizeHtml from 'sanitize-html';
import { isValidAddress, normalizeAddress } from './address.js';

const allowedTags = [
  'a',
  'article',
  'aside',
  'b',
  'blockquote',
  'br',
  'code',
  'dd',
  'div',
  'dl',
  'dt',
  'em',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'header',
  'hr',
  'i',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
];

export function prepareSiteContent(html: string): {
  safeHtml: string;
  searchableText: string;
} {
  const safeHtml = sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: { a: ['href', 'title'] },
    disallowedTagsMode: 'discard',
    transformTags: {
      a: (_tagName, attributes) => {
        const address = normalizeAddress(attributes.href ?? '');
        return {
          tagName: 'a',
          attribs: {
            ...(attributes.title ? { title: attributes.title } : {}),
            ...(isValidAddress(address) ? { href: address } : {}),
          },
        };
      },
    },
  });

  const searchableText = sanitizeHtml(safeHtml, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, ' ')
    .trim();

  return { safeHtml, searchableText };
}
