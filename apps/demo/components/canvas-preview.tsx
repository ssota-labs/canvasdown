'use client';

import { useCallback, useEffect, useState } from 'react';
import { CustomEdge } from '@ssota-labs/canvasdown-reactflow';
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { ImageBlock } from './blocks/image-block';
import { MarkdownBlock } from './blocks/markdown-block';
import { ShapeBlock } from './blocks/shape-block';
import { YouTubeBlock } from './blocks/youtube-block';

interface CanvasPreviewProps {
  error: string | null;
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

const nodeTypes = {
  markdown: MarkdownBlock,
  shape: ShapeBlock,
  image: ImageBlock,
  youtube: YouTubeBlock,
};

const edgeTypes = {
  default: CustomEdge,
};

export function CanvasPreview({
  error,
  initialNodes,
  initialEdges,
}: CanvasPreviewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Use React Flow state hooks for controlled component
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges ?? []);

  // Update nodes/edges when initialNodes/initialEdges change (DSL changes)
  useEffect(() => {
    if (error) {
      // Clear nodes/edges on error
      setNodes([]);
      setEdges([]);
    } else if (initialNodes && initialEdges) {
      // Update when initialNodes/initialEdges change
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [initialNodes, initialEdges, setNodes, setEdges, error]);

  const selectedNode = selectedNodeId
    ? nodes.find(node => node.id === selectedNodeId)
    : null;

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertTitle className="text-lg font-semibold">
                Parse Error
              </AlertTitle>
              <AlertDescription className="font-mono text-sm mt-2">
                {error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        // Two-finger scroll for panning (like SSOTA)
        panOnScroll={true}
        panOnDrag={true}
        zoomOnScroll={false}
        zoomOnPinch={true}
        minZoom={0.1}
        maxZoom={2}
        // Selection settings
        selectionOnDrag={false}
        selectNodesOnDrag={false}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
      >
        <Background />
        <Controls />
        <MiniMap />

        {selectedNode && (
          <Panel position="top-right">
            <Card className="max-w-xs max-h-96 overflow-auto">
              <CardContent className="pt-4">
                <h4 className="text-sm font-semibold mb-2">
                  Node: {selectedNode.id}
                </h4>
                <pre className="text-xs font-mono whitespace-pre-wrap m-0">
                  {JSON.stringify(selectedNode.data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
