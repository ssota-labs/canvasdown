/**
 * Custom Edge Component
 *
 * Simplified version of SSOTA's custom edge.
 * - Custom path rendering
 * - Read-only label display
 * - No toolbar
 */
import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

export const CustomEdge = memo(function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  selected,
  style,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Visual styling based on selection
  const strokeColor = selected ? '#3b82f6' : '#b1b1b7';
  const strokeWidth = selected ? 2 : 1.5;

  // Extract startLabel and endLabel from data
  const startLabel = data?.startLabel as string | undefined;
  const endLabel = data?.endLabel as string | undefined;

  const labelStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    backgroundColor: '#fff',
    border: selected ? '1px solid #60a5fa' : '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    color: selected ? '#374151' : '#6b7280',
    transition: 'all 0.2s ease-out',
  };

  return (
    <>
      {/* Edge Path */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />

      <EdgeLabelRenderer>
        {/* Start Label (at source position) */}
        {startLabel && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, 0%) translate(${sourceX}px, ${sourceY}px)`,
              pointerEvents: 'none',
            }}
          >
            <div style={labelStyle}>{startLabel}</div>
          </div>
        )}

        {/* Center Label (middle of edge) */}
        {label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
            }}
          >
            <div style={labelStyle}>{label}</div>
          </div>
        )}

        {/* End Label (at target position) */}
        {endLabel && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -100%) translate(${targetX}px, ${targetY}px)`,
              pointerEvents: 'none',
            }}
          >
            <div style={labelStyle}>{endLabel}</div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
});
