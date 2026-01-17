'use client';

import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { useConnectedHandles } from '@/hooks/use-connected-handles';
import { cn } from '@/lib/utils';

interface YouTubeBlockData {
  url?: string;
  videoId?: string;
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

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export const YouTubeBlock = memo(function YouTubeBlock({
  id,
  data,
  selected,
}: NodeProps) {
  const blockData = data as YouTubeBlockData;
  const url = blockData?.url || '';
  const title = blockData?.title || 'YouTube Video';

  const connected = useConnectedHandles(id);
  const videoId = blockData?.videoId || extractVideoId(url);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;

  const [imageError, setImageError] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  const handlePlayClick = () => {
    if (videoId) {
      setShowPlayer(true);
    }
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
          'w-full h-full flex flex-col rounded-lg overflow-hidden bg-white border-2 transition-all duration-200',
          selected
            ? 'border-blue-400 shadow-[0_0_0_2px_#60a5fa,0_10px_25px_rgba(0,0,0,0.15)]'
            : 'border-gray-200 shadow-md'
        )}
      >
        {/* Video Area */}
        <div className="flex-1 relative bg-black z-0">
          {showPlayer && videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-none relative z-0"
            />
          ) : thumbnailUrl && !imageError ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt={title}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover relative z-0"
              />
              {/* Play Button Overlay */}
              <div
                onClick={handlePlayClick}
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
              >
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    width="32"
                    height="32"
                    fill="white"
                    viewBox="0 0 24 24"
                    className="ml-1"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center text-gray-400">
                <svg
                  width="48"
                  height="48"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="mx-auto mb-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs">
                  {imageError ? 'Thumbnail unavailable' : 'No video URL'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Title Bar */}
        <div className="px-3 py-2 bg-white border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap m-0">
            {title}
          </p>
          {videoId && (
            <p className="text-xs text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap m-0">
              youtu.be/{videoId}
            </p>
          )}
        </div>
      </div>
    </>
  );
});
