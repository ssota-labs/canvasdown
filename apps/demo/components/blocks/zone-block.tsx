'use client';

import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

interface ZoneBlockData {
  direction?: string;
  color?: string;
  padding?: number;
  label?: string;
  collapsed?: boolean;
  title?: string;
}

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  red: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: '#ef4444',
    text: '#ef4444',
  },
  orange: {
    bg: 'rgba(249, 115, 22, 0.1)',
    border: '#f97316',
    text: '#f97316',
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: '#f59e0b',
    text: '#f59e0b',
  },
  green: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: '#10b981',
    text: '#10b981',
  },
  blue: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: '#3b82f6',
    text: '#3b82f6',
  },
  purple: {
    bg: 'rgba(139, 92, 246, 0.1)',
    border: '#8b5cf6',
    text: '#8b5cf6',
  },
  pink: {
    bg: 'rgba(236, 72, 153, 0.1)',
    border: '#ec4899',
    text: '#ec4899',
  },
  gray: {
    bg: 'rgba(107, 114, 128, 0.1)',
    border: '#6b7280',
    text: '#6b7280',
  },
};

/**
 * Zone Block Component
 *
 * 다른 노드들을 시각적으로 그룹화하는 컨테이너 블록
 * React Flow의 Parent-Child 관계를 활용하여 자식 노드들을 포함
 */
export const ZoneBlock = memo(function ZoneBlock({
  id,
  data,
  selected,
}: NodeProps) {
  if (!data) {
    console.error('ZoneBlock: data is required');
    return null;
  }

  const zoneData = data as ZoneBlockData;
  const {
    color = 'gray',
    label = '',
    title = '',
    collapsed = false,
    padding = 20,
  } = zoneData;

  const colors = colorMap[color] || colorMap.gray;
  const displayTitle = title || label || 'Zone';

  // Collapsed view
  if (collapsed) {
    return (
      <div
        className={cn(
          'w-full h-full flex items-center justify-center rounded-lg border-2 transition-all duration-200',
          selected && 'ring-2 ring-offset-2 ring-blue-500'
        )}
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        <div className="text-sm font-medium px-4">{displayTitle}</div>
      </div>
    );
  }

  // Expanded view
  return (
    <div
      className={cn(
        'w-full h-full flex flex-col rounded-lg border-2 transition-all duration-200',
        selected && 'ring-2 ring-offset-2 ring-blue-500 shadow-lg'
      )}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        padding: `${padding}px`,
      }}
    >
      {/* Header */}
      <div
        className="text-sm font-semibold mb-2"
        style={{ color: colors.text }}
      >
        {displayTitle}
      </div>

      {/* Content Area - 자식 노드들이 여기에 렌더링됨 */}
      <div className="flex-1 relative">
        {/* 빈 공간 표시 (자식 노드가 없을 때) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: 0.3,
            color: colors.text,
          }}
        >
          <span className="text-xs">Drag nodes here to group</span>
        </div>
      </div>
    </div>
  );
});
