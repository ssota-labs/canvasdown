'use client';

import { memo, useMemo } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { renderToReactElement } from '@tiptap/static-renderer/pm/react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { useConnectedHandles } from '@/hooks/use-connected-handles';
import { markdownToTipTapJson } from '@/lib/tiptap-transform';
import { cn } from '@/lib/utils';

interface MarkdownBlockData {
  content?: string;
  contentJson?: { type: 'doc'; content?: Array<Record<string, unknown>> };
  title?: string;
}

const visibleHandleStyle = {
  width: 12,
  height: 12,
  backgroundColor: 'rgba(96, 165, 250, 0.8)',
  border: '2px solid #1e40af',
};

const hiddenHandleStyle = {
  width: 1,
  height: 1,
  backgroundColor: 'transparent',
  border: 'none',
  opacity: 0,
  pointerEvents: 'none' as const,
};

const STARTER_KIT_EXTENSIONS = [StarterKit];

export const MarkdownBlock = memo(function MarkdownBlock({
  id,
  data,
  selected,
}: NodeProps) {
  const blockData = data as MarkdownBlockData;
  const content = blockData?.content || '';
  const contentJson = blockData?.contentJson;
  const connected = useConnectedHandles(id);

  const rendered = useMemo(() => {
    if (!content && !contentJson) return null;
    const doc = contentJson ?? (content ? markdownToTipTapJson(content) : null);
    if (!doc) return null;
    try {
      return renderToReactElement({
        content: doc,
        extensions: STARTER_KIT_EXTENSIONS,
      });
    } catch {
      return null;
    }
  }, [content, contentJson]);

  return (
    <>
      {/* Left - Source & Target */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={connected.left ? visibleHandleStyle : hiddenHandleStyle}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={connected.left ? visibleHandleStyle : hiddenHandleStyle}
      />

      {/* Right - Source & Target */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={connected.right ? visibleHandleStyle : hiddenHandleStyle}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        style={connected.right ? visibleHandleStyle : hiddenHandleStyle}
      />

      {/* Top - Source & Target */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        style={connected.top ? visibleHandleStyle : hiddenHandleStyle}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={connected.top ? visibleHandleStyle : hiddenHandleStyle}
      />

      {/* Bottom - Source & Target */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={connected.bottom ? visibleHandleStyle : hiddenHandleStyle}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        style={connected.bottom ? visibleHandleStyle : hiddenHandleStyle}
      />

      {/* Content */}
      <div
        className={cn(
          'w-full h-full p-4 rounded-lg bg-white border-2 overflow-auto text-sm leading-relaxed transition-all duration-200',
          selected
            ? 'border-blue-400 shadow-[0_0_0_2px_#60a5fa,0_10px_25px_rgba(0,0,0,0.15)]'
            : 'border-gray-200 shadow-md'
        )}
      >
        {rendered !== null ? (
          <div className="prose prose-sm max-w-none [&_p]:my-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:text-gray-800 [&_code]:font-mono [&_code]:text-xs">
            {rendered}
          </div>
        ) : (
          <p className="text-gray-400">Empty markdown</p>
        )}
      </div>
    </>
  );
});
