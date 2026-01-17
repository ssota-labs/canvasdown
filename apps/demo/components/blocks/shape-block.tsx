'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { useConnectedHandles } from '@/hooks/use-connected-handles';
import { cn } from '@/lib/utils';

interface ShapeBlockData {
  shapeType?: string;
  color?: string;
  content?: string;
  borderStyle?: string;
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

const colorMap: Record<string, string> = {
  green: '#10b981',
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#f59e0b',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

export const ShapeBlock = memo(function ShapeBlock({
  id,
  data,
  selected,
}: NodeProps) {
  const blockData = data as ShapeBlockData;
  const shapeType = blockData?.shapeType || 'rectangle';
  const color = blockData?.color || 'blue';
  const content = blockData?.content || blockData?.title || '';

  const connected = useConnectedHandles(id);
  const bgColor = colorMap[color] || color || '#3b82f6';

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
          'w-full h-full flex items-center justify-center text-white font-medium text-sm p-2 text-center transition-all duration-200',
          shapeType === 'ellipse' ? 'rounded-full' : 'rounded-lg',
          selected
            ? 'shadow-[0_0_0_2px_#60a5fa,0_10px_25px_rgba(0,0,0,0.15)]'
            : 'shadow-md'
        )}
        style={{ backgroundColor: bgColor }}
      >
        <div className="break-words">{content}</div>
      </div>
    </>
  );
});
