/**
 * HTML sanitizer for user-generated content.
 * Allows only safe formatting tags, strips everything else.
 * Prevents XSS attacks from AI responses or user input.
 */

const ALLOWED_TAGS = ['strong', 'em', 'b', 'i', 'br', 'p', 'ul', 'ol', 'li', 'a'];
const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ['href'],
};

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Convert safe markdown-like formatting to HTML and sanitize.
 * Only allows: **bold**, *italic*, newlines → <br>
 * All other HTML is escaped.
 */
export function sanitizeMarkdownToHtml(text: string): string {
  // First, escape all HTML
  let result = escapeHtml(text);

  // Convert **bold** to <strong>
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert *italic* to <em>
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert newlines to <br>
  result = result.replace(/\n/g, '<br>');

  return result;
}

/**
 * Sanitize raw HTML by stripping all tags except safe ones.
 */
export function sanitizeHtml(unsafeHtml: string): string {
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  const openStack: string[] = [];
  let result = unsafeHtml;

  // Simple tag stripper — remove all tags not in allowlist
  result = result.replace(tagRegex, (match, tagName) => {
    const lower = tagName.toLowerCase();
    if (ALLOWED_TAGS.includes(lower)) {
      // For anchor tags, only allow safe hrefs
      if (lower === 'a') {
        const hrefMatch = match.match(/href=["']([^"']*)["']/);
        if (hrefMatch) {
          const href = hrefMatch[1];
          if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/')) {
            return match;
          }
          return '';
        }
      }
      return match;
    }
    return '';
  });

  return result;
}
