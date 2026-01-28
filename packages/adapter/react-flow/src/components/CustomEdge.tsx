/**
 * Custom Edge Component
 *
 * Simplified version of SSOTA's custom edge.
 * - Custom path rendering
 * - Read-only label display
 * - No toolbar
 * - Custom SVG markers (arrow, arrowclosed) when markerEnd/markerStart are set
 */
import { memo, type ReactNode } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

/** Marker type: string (e.g. 'arrowclosed') or object with type/color/width/height */
type MarkerValue =
  | string
  | { type?: string; width?: number; height?: number; color?: string }
  | undefined;

function hasMarker(marker: MarkerValue): boolean {
  if (!marker) return false;
  if (typeof marker === 'object') return true;
  if (typeof marker === 'string' && marker.length > 0) return true;
  return false;
}

/** Resolve marker type string for rendering (supports React Flow names: arrowclosed, arrow) */
function getMarkerType(marker: MarkerValue): string {
  if (!marker) return 'arrow';
  if (typeof marker === 'object' && marker.type) return marker.type;
  if (typeof marker === 'string') return marker;
  return 'arrow';
}

interface MarkerSvgProps {
  id: string;
  color: string;
}

/** Closed arrow (filled triangle) - React Flow "arrowclosed" */
function ArrowClosedMarker({ id, color }: MarkerSvgProps) {
  return (
    <marker
      id={id}
      markerWidth="20"
      markerHeight="20"
      viewBox="-10 -10 20 20"
      orient="auto-start-reverse"
      markerUnits="strokeWidth"
      refX="0"
      refY="0"
    >
      <polyline
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        fill={color}
        points="-5,-4 0,0 -5,4 -5,-4"
      />
    </marker>
  );
}

/** Open arrow (outline only) - React Flow "arrow" */
function ArrowOpenMarker({ id, color }: MarkerSvgProps) {
  return (
    <marker
      id={id}
      markerWidth="20"
      markerHeight="20"
      viewBox="-10 -10 20 20"
      orient="auto-start-reverse"
      markerUnits="strokeWidth"
      refX="0"
      refY="0"
    >
      <polyline
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        fill="none"
        points="-5,-4 0,0 -5,4"
      />
    </marker>
  );
}

function renderMarkerById(
  id: string,
  color: string,
  markerType: string
): ReactNode {
  const type = markerType.toLowerCase();
  if (type === 'arrowclosed') {
    return <ArrowClosedMarker id={id} color={color} />;
  }
  if (type === 'arrow') {
    return <ArrowOpenMarker id={id} color={color} />;
  }
  return <ArrowClosedMarker id={id} color={color} />;
}

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
  markerEnd: markerEndProp,
  markerStart: markerStartProp,
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

  // Markers: use props from edge (set by toReactFlowEdges)
  const markerEnd = markerEndProp as MarkerValue;
  const markerStart = markerStartProp as MarkerValue;
  const showMarkerEnd = hasMarker(markerEnd);
  const showMarkerStart = hasMarker(markerStart);
  const markerEndId = `${id}-marker-end`;
  const markerStartId = `${id}-marker-start`;

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
      <defs>
        {showMarkerEnd &&
          renderMarkerById(markerEndId, strokeColor, getMarkerType(markerEnd))}
        {showMarkerStart &&
          renderMarkerById(
            markerStartId,
            strokeColor,
            getMarkerType(markerStart)
          )}
      </defs>

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={showMarkerEnd ? `url(#${markerEndId})` : undefined}
        markerStart={showMarkerStart ? `url(#${markerStartId})` : undefined}
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
