import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface JobDescriptionRendererProps {
  description?: string | null;
  className?: string;
}

/**
 * Normalizes backslash-escaped tags, entity-encoded markup, and markdown links
 * before sanitizing with DOMPurify.
 */
function normalizeDescription(rawText: string): string {
  if (!rawText || !rawText.trim()) {
    return '';
  }

  let text = rawText;

  // 1. Fix markdown links embedded inside HTML href attributes:
  // href="[https://example.com](https://example.com)" -> href="https://example.com"
  text = text.replace(/href=(["'])\s*\[(?:[^\]]*)\]\((https?:\/\/[^)\s"']+)\)\s*(["'])/gi, 'href=$1$2$3');

  // 2. Fix escaped link target attributes:
  // target="\_blank" or target="\\_blank" -> target="_blank"
  text = text.replace(/target=(["'])\\+(_[a-zA-Z]+)(["'])/gi, 'target=$1$2$3');

  // 3. Unescape backslash-escaped HTML tags:
  // e.g. \<div>, \<p>, \<h2>, \<ul>, \<li>, \</div\>, \</p\>
  text = text.replace(/\\<(\/?[a-zA-Z][a-zA-Z0-9:-]*(?:\s+[^>]*?)?)\\?>/g, '<$1>');
  text = text.replace(/\\<(\/?[a-zA-Z][a-zA-Z0-9:-]*)\\?>/g, '<$1>');
  text = text.replace(/\\>/g, '>');

  // 4. Detect entity-encoded HTML (like Greenhouse API: &lt;div class=&quot;description...&gt;)
  if (/&lt;\s*\/?(?:div|p|h[1-6]|ul|ol|li|strong|b|em|i|u|br|a|span|section|article|table|tr|td|th)\b/i.test(text)) {
    text = text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&');

    // Run cleanups once more in case decoded entities revealed escaped targets or tags
    text = text.replace(/href=(["'])\s*\[(?:[^\]]*)\]\((https?:\/\/[^)\s"']+)\)\s*(["'])/gi, 'href=$1$2$3');
    text = text.replace(/target=(["'])\\+(_[a-zA-Z]+)(["'])/gi, 'target=$1$2$3');
  }

  // 5. Handle pure plain-text descriptions (no HTML tags present)
  if (!/<\/?[a-zA-Z][a-zA-Z0-9:-]*(?:\s+[^>]*)?>/i.test(text)) {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const result: string[] = [];
    let currentBullets: string[] = [];
    let currentPara: string[] = [];

    const flushBullets = () => {
      if (currentBullets.length > 0) {
        result.push(`<ul>\n${currentBullets.map((b) => `  <li>${b}</li>`).join('\n')}\n</ul>`);
        currentBullets = [];
      }
    };

    const flushPara = () => {
      if (currentPara.length > 0) {
        result.push(`<p>${currentPara.join('<br>')}</p>`);
        currentPara = [];
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        flushPara();
        flushBullets();
        continue;
      }

      if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('* ')) {
        flushPara();
        const clean = line.replace(/^[•\-\*]\s*/, '').trim();
        if (clean) currentBullets.push(clean);
      } else {
        flushBullets();
        currentPara.push(line);
      }
    }
    flushPara();
    flushBullets();

    text = result.join('\n\n');
  }

  return text;
}

export default function JobDescriptionRenderer({
  description,
  className = '',
}: JobDescriptionRendererProps) {
  const sanitizedHtml = useMemo(() => {
    if (!description || !description.trim()) {
      return '';
    }

    const normalized = normalizeDescription(description);

    // Sanitize with DOMPurify
    const clean = DOMPurify.sanitize(normalized, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
        'br', 'hr', 'blockquote', 'pre', 'code', 'a', 'span', 'div',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'section', 'article'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'title', 'class', 'id', 'colspan', 'rowspan'],
      ALLOW_DATA_ATTR: false,
      ADD_ATTR: ['target', 'rel'],
    });

    // Ensure all <a> tags have target="_blank" and rel="noopener noreferrer"
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const doc = new DOMParser().parseFromString(clean, 'text/html');
        const links = doc.querySelectorAll('a[href]');
        links.forEach((a) => {
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
        });
        return doc.body.innerHTML;
      } catch {
        return clean;
      }
    }

    return clean;
  }, [description]);

  if (!sanitizedHtml) {
    return (
      <div className="py-6 text-center text-xs sm:text-sm text-[#708479] italic bg-[#fafcfb] rounded-xl border border-dashed border-[#dce7e1]">
        No detailed description provided by the employer. Please visit the official career page for complete responsibilities and qualifications.
      </div>
    );
  }

  return (
    <div
      className={`job-description-content text-[#2d4036] text-[13px] sm:text-sm leading-relaxed space-y-4 max-w-none overflow-hidden break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
