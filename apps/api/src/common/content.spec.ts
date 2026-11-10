import { prepareSiteContent } from './content.js';

describe('prepareSiteContent', () => {
  it('removes active content and event handlers', () => {
    const result = prepareSiteContent(
      '<h1 onclick="steal()">Hello</h1><script>alert(1)</script><img src="https://evil.test/x">',
    );
    expect(result.safeHtml).toBe('<h1>Hello</h1>');
    expect(result.searchableText).toBe('Hello');
  });

  it('keeps internal links and removes external destinations', () => {
    const result = prepareSiteContent(
      '<a href="garden.zz">Garden</a><a href="https://example.com">Outside</a><a href="bad..zz">Bad</a>',
    );
    expect(result.safeHtml).toContain('href="garden.zz"');
    expect(result.safeHtml).not.toContain('https://example.com');
    expect(result.safeHtml).not.toContain('bad..zz');
  });
});
