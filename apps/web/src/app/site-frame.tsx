"use client";

import { useRef } from "react";

type SiteFrameProps = {
  html: string;
  title: string;
  onNavigate: (address: string) => void;
  getScrollY?: () => number;
  onScroll?: (position: number) => void;
};

const documentStyles = `
  :root { color-scheme: light; font-family: Georgia, 'Times New Roman', serif; color: #24322d; background: #fffef9; }
  * { box-sizing: border-box; }
  body { max-width: 720px; margin: 0 auto; padding: clamp(28px, 7vw, 72px) clamp(24px, 7vw, 64px); font-size: 18px; line-height: 1.75; }
  h1, h2, h3, h4 { color: #17231f; font-family: system-ui, sans-serif; line-height: 1.15; letter-spacing: -0.025em; }
  h1 { margin: 0 0 28px; font-size: clamp(34px, 8vw, 58px); }
  h2 { margin-top: 36px; }
  p { margin: 0 0 20px; }
  a { color: #176b51; text-decoration-thickness: 1px; text-underline-offset: 4px; }
  a:hover { color: #0e4937; }
  blockquote { margin: 28px 0; padding-left: 22px; border-left: 3px solid #e3a74f; color: #52625c; }
  pre, code { font-family: ui-monospace, monospace; }
  pre { overflow-x: auto; padding: 18px; border-radius: 10px; background: #edf1ee; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px 10px; border: 1px solid #d9dfdb; text-align: left; }
`;

export function SiteFrame({ html, title, onNavigate, getScrollY, onScroll }: SiteFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const source = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${documentStyles}</style></head><body>${html}</body></html>`;

  function connectLinks() {
    const document = frameRef.current?.contentDocument;
    if (!document) return;

    const frameWindow = frameRef.current?.contentWindow;
    frameWindow?.scrollTo(0, getScrollY?.() ?? 0);
    frameWindow?.addEventListener("scroll", () => {
      onScroll?.(frameWindow.scrollY);
    }, { passive: true });

    document.addEventListener("click", (event) => {
      const target = event.target as Element | null;
      const link = target?.closest?.<HTMLAnchorElement>("a[href]");
      const address = link?.getAttribute("href");
      if (!address) return;
      event.preventDefault();
      onNavigate(address);
    });
  }

  return (
    <iframe
      ref={frameRef}
      className="site-frame"
      title={title}
      sandbox="allow-same-origin"
      srcDoc={source}
      onLoad={connectLinks}
    />
  );
}
