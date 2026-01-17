'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Edge, Node } from '@xyflow/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Dynamic import for Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.Editor),
  { ssr: false }
);

interface DataViewerProps {
  nodes: Node[];
  edges: Edge[];
  metadata: Record<string, unknown>;
  parseError: string | null;
}

export function DataViewer({
  nodes,
  edges,
  metadata,
  parseError,
}: DataViewerProps) {
  const [isMounted] = useState(true);

  const jsonData = useMemo(() => {
    return JSON.stringify(
      {
        nodes,
        edges,
        metadata,
      },
      null,
      2
    );
  }, [nodes, edges, metadata]);

  const nodesJson = useMemo(() => {
    return JSON.stringify(nodes, null, 2);
  }, [nodes]);

  const edgesJson = useMemo(() => {
    return JSON.stringify(edges, null, 2);
  }, [edges]);

  const metadataJson = useMemo(() => {
    return JSON.stringify(metadata, null, 2);
  }, [metadata]);

  if (!isMounted) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Data Viewer</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (parseError) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Data Viewer</CardTitle>
          <CardDescription>Error parsing DSL</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive font-mono">{parseError}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Data Viewer</CardTitle>
        <CardDescription>View parsed graph data</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <TabsList>
            <TabsTrigger value="all">All Data</TabsTrigger>
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="edges">Edges</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-hidden mt-4">
            <TabsContent value="all" className="h-full m-0">
              <MonacoEditor
                height="100%"
                language="json"
                value={jsonData}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
                theme="vs"
              />
            </TabsContent>
            <TabsContent value="nodes" className="h-full m-0">
              <MonacoEditor
                height="100%"
                language="json"
                value={nodesJson}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
                theme="vs"
              />
            </TabsContent>
            <TabsContent value="edges" className="h-full m-0">
              <MonacoEditor
                height="100%"
                language="json"
                value={edgesJson}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
                theme="vs"
              />
            </TabsContent>
            <TabsContent value="metadata" className="h-full m-0">
              <MonacoEditor
                height="100%"
                language="json"
                value={metadataJson}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
                theme="vs"
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
