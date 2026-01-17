'use client';

import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { useConnectedHandles } from '@/hooks/use-connected-handles';
import { cn } from '@/lib/utils';

interface ImageBlockData {
  imageUrl?: string;
  caption?: string;
  isCaptionVisible?: boolean;
  alt?: string;
  title?: string;
}

const visibleHandleStyle = {
  width: 12,
  height: 12,
  backgroundColor: 'rgba(96, 165, 250, 0.8)',
  border: '2px solid #1e40af',
  zIndex: 50,
};

const hiddenHandleStyle = {
  width: 1,
  height: 1,
  backgroundColor: 'transparent',
  border: 'none',
  opacity: 0,
  pointerEvents: 'none' as const,
  zIndex: 50,
};

export const ImageBlock = memo(function ImageBlock({
  id,
  data,
  selected,
}: NodeProps) {
  const blockData = data as ImageBlockData;
  const imageUrl = blockData?.imageUrl || '';
  const caption = blockData?.caption || '';
  const isCaptionVisible = blockData?.isCaptionVisible ?? false;
  const alt = blockData?.alt || blockData?.title || '';

  const connected = useConnectedHandles(id);
  const [imageError, setImageError] = useState(false);

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
          'w-full h-full flex flex-col rounded-lg overflow-hidden bg-gray-100 border-2 transition-all duration-200',
          selected
            ? 'border-blue-400 shadow-[0_0_0_2px_#60a5fa,0_10px_25px_rgba(0,0,0,0.15)]'
            : 'border-gray-200 shadow-md'
        )}
      >
        <div className="flex-1 flex items-center justify-center bg-gray-200 relative z-0">
          {imageUrl && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={alt}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover relative z-0"
            />
          ) : (
            <div className="text-gray-400 text-xs text-center p-4">
              {imageError ? 'Failed to load image' : 'No image URL'}
            </div>
          )}
        </div>
        {isCaptionVisible && caption && (
          <div className="px-3 py-2 bg-white border-t border-gray-200 text-xs text-gray-600">
            {caption}
          </div>
        )}
      </div>
    </>
  );
});
