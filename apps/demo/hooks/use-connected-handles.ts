/**
 * Hook to determine which handles are connected to edges
 */
import { useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';

export interface ConnectedHandles {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
}

/**
 * Returns which handles are currently connected to edges for a given node
 */
export function useConnectedHandles(nodeId: string): ConnectedHandles {
  const { getEdges } = useReactFlow();

  return useMemo(() => {
    const edges = getEdges();
    const connected: ConnectedHandles = {
      left: false,
      right: false,
      top: false,
      bottom: false,
    };

    edges.forEach(edge => {
      // Check if this edge connects to/from this node
      if (edge.source === nodeId) {
        // This node is the source - check which handle is used
        if (edge.sourceHandle === 'left') connected.left = true;
        if (edge.sourceHandle === 'right') connected.right = true;
        if (edge.sourceHandle === 'top') connected.top = true;
        if (edge.sourceHandle === 'bottom') connected.bottom = true;
      }

      if (edge.target === nodeId) {
        // This node is the target - check which handle is used
        if (edge.targetHandle === 'left') connected.left = true;
        if (edge.targetHandle === 'right') connected.right = true;
        if (edge.targetHandle === 'top') connected.top = true;
        if (edge.targetHandle === 'bottom') connected.bottom = true;
      }
    });

    return connected;
  }, [getEdges, nodeId]);
}
