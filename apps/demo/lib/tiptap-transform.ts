import { generateJSON } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import { marked } from 'marked';

/** TipTap ProseMirror doc shape (minimal type for demo) */
export interface TipTapDoc {
  type: 'doc';
  content?: Array<Record<string, unknown>>;
}

/**
 * Converts markdown to TipTap/ProseMirror JSON.
 * Uses marked for markdown → HTML, then @tiptap/html generateJSON for HTML → JSON.
 */
export function markdownToTipTapJson(markdown: string): TipTapDoc {
  const html = marked.parse(markdown, { async: false }) as string;
  const json = generateJSON(html, [StarterKit]) as TipTapDoc;
  return json;
}
