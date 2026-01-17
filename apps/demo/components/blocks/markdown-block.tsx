'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { useConnectedHandles } from '@/hooks/use-connected-handles';
import { cn } from '@/lib/utils';

interface MarkdownBlockData {
  content?: string;
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

export const MarkdownBlock = memo(function MarkdownBlock({
  id,
  data,
  selected,
}: NodeProps) {
  const blockData = data as MarkdownBlockData;
  const content = blockData?.content || '';
  const connected = useConnectedHandles(id);

  // Simple markdown rendering
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('# ')) {
        return (
          <h1 key={i} className="text-2xl font-bold my-2">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="text-xl font-bold my-2">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.trim() === '') {
        return <div key={i} className="h-2" />;
      }
      return (
        <p key={i} className="my-1">
          {line}
        </p>
      );
    });
  };

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
        {content ? (
          renderMarkdown(content)
        ) : (
          <p className="text-gray-400">Empty markdown</p>
        )}
      </div>
    </>
  );
});
