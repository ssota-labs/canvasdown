'use client';

import { useMemo, useState } from 'react';
import {
  CanvasdownCore,
  type CanvasdownCoreOptions,
  type CanvasdownOutput,
  type UpdateOperation,
} from '@ssota-labs/canvasdown';
import {
  parseCanvasdown,
  useCanvasdownPatch,
} from '@ssota-labs/canvasdown-reactflow';
import type { Edge, Node } from '@xyflow/react';
import { ReactFlowProvider } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Example } from '@/lib/examples';
import { CANVAS_NODE_TYPES } from '@/lib/node-types';
import { registerBlockTypes } from '@/lib/register-block-types';
import { markdownToTipTapJson } from '@/lib/tiptap-transform';
import { APIDSLWriter } from './api-dsl-writer';
import { CanvasPreview } from './canvas-preview';
import { DataViewer } from './data-viewer';
import { DSLEditor } from './dsl-editor';
import { ExampleSelector } from './example-selector';
import { PatchEditor } from './patch-editor';

interface CanvasdownDemoProps {
  dsl: string;
  onDslChange: (dsl: string) => void;
}

type EditorMode = 'dsl' | 'patch' | 'api' | 'data';

export function CanvasdownDemo({ dsl, onDslChange }: CanvasdownDemoProps) {
  const [mode, setMode] = useState<EditorMode>('dsl');
  const [patchError, setPatchError] = useState<string | null>(null);
  const [currentExampleId, setCurrentExampleId] = useState<
    string | undefined
  >();

  // Initialize core and register block types
  const core = useMemo(() => {
    const options: CanvasdownCoreOptions = {
      // defaultExtent: 'parent', // Constrain zone children to parent bounds by default
    };
    const c = new CanvasdownCore(options);
    registerBlockTypes(c);
    return c;
  }, []);

  // Parse and layout DSL using parseCanvasdown function with nodeTypes for type safety
  // nodeTypes를 전달하면 nodes의 type 필드가 'shape' | 'markdown' | 'image' | 'youtube' | 'zone'으로 제한됨
  const {
    nodes,
    edges,
    error: parseError,
  } = useMemo(() => {
    return parseCanvasdown(dsl, {
      core,
      nodeTypes: CANVAS_NODE_TYPES, // 타입 안정성을 위한 nodeTypes 전달
    });
  }, [dsl, core]);

  // Get raw result for data viewer
  const rawResult = useMemo(() => {
    try {
      return core.parseAndLayout(dsl);
    } catch {
      return null;
    }
  }, [dsl, core]);

  const handleExampleSelect = (example: Example) => {
    onDslChange(example.dsl);
    setCurrentExampleId(example.id);
    setMode('dsl');
  };

  const handleAPIDSLGenerated = (generatedDsl: string) => {
    onDslChange(generatedDsl);
    setMode('dsl');
  };

  return (
    <ReactFlowProvider>
      <CanvasdownDemoInner
        mode={mode}
        setMode={setMode}
        dsl={dsl}
        onDslChange={onDslChange}
        initialNodes={nodes}
        initialEdges={edges}
        parseError={parseError}
        patchError={patchError}
        setPatchError={setPatchError}
        core={core}
        rawResult={rawResult}
        onExampleSelect={handleExampleSelect}
        currentExampleId={currentExampleId}
        onAPIDSLGenerated={handleAPIDSLGenerated}
      />
    </ReactFlowProvider>
  );
}

interface CanvasdownDemoInnerProps {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  dsl: string;
  onDslChange: (dsl: string) => void;
  initialNodes: Node[];
  initialEdges: Edge[];
  parseError: string | null;
  patchError: string | null;
  setPatchError: (error: string | null) => void;
  core: CanvasdownCore;
  rawResult: CanvasdownOutput | null;
  onExampleSelect: (example: Example) => void;
  currentExampleId?: string;
  onAPIDSLGenerated: (dsl: string) => void;
}

function CanvasdownDemoInner({
  mode,
  setMode,
  dsl,
  onDslChange,
  initialNodes,
  initialEdges,
  parseError,
  patchError,
  setPatchError,
  core,
  rawResult,
  onExampleSelect,
  currentExampleId,
  onAPIDSLGenerated,
}: CanvasdownDemoInnerProps) {
  const transformUpdateNode = useMemo(() => {
    return (node: Node, operation: UpdateOperation) => {
      const nextData = { ...node.data };
      if (operation.properties) {
        const { content, ...rest } = operation.properties;
        Object.assign(nextData, rest);
        if (content != null && typeof content === 'string') {
          // Patch DSL strings may have literal \n (backslash+n); normalize so markdown renders correctly
          const normalizedContent = content.replace(/\\n/g, '\n');
          nextData.content = normalizedContent;
          try {
            nextData.contentJson = markdownToTipTapJson(normalizedContent);
          } catch {
            nextData.contentJson = undefined;
          }
        }
      }
      if (operation.customProperties?.length) {
        const arr = [
          ...((nextData.customProperties as Array<{
            schemaId: string;
            value: unknown;
          }>) ?? []),
        ];
        for (const { key, value } of operation.customProperties) {
          const i = arr.findIndex(c => c.schemaId === key);
          const entry = { schemaId: key, value };
          if (i >= 0) arr[i] = entry;
          else arr.push(entry);
        }
        nextData.customProperties = arr;
      }
      return { ...node, data: nextData };
    };
  }, []);

  const { applyPatch } = useCanvasdownPatch(core, {
    preservePositions: true,
    direction: 'LR',
    transformUpdateNode,
  });

  const handlePatchApply = (patchDsl: string) => {
    try {
      setPatchError(null);
      applyPatch(patchDsl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setPatchError(errorMessage);
    }
  };

  return (
    <div className="flex w-full h-full">
      {/* Left: DSL/Patch/API/Data Editor */}
      <div className="w-[40%] h-full border-r border-border flex flex-col">
        <div className="flex flex-col h-full">
          <Tabs
            value={mode}
            onValueChange={v => setMode(v as EditorMode)}
            className="flex flex-col h-full"
          >
            <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
              <TabsList className="h-auto">
                <TabsTrigger value="dsl" className="text-xs">
                  DSL
                </TabsTrigger>
                <TabsTrigger value="patch" className="text-xs">
                  Patch
                </TabsTrigger>
                <TabsTrigger value="api" className="text-xs">
                  API
                </TabsTrigger>
                <TabsTrigger value="data" className="text-xs">
                  Data
                </TabsTrigger>
              </TabsList>
              <ExampleSelector
                onSelect={onExampleSelect}
                currentExampleId={currentExampleId}
              />
            </div>

            {/* Editor Content */}
            <TabsContent
              value="dsl"
              className="flex-1 m-0 flex flex-col overflow-hidden data-[state=inactive]:hidden"
            >
              <DSLEditor
                dsl={dsl}
                onDslChange={onDslChange}
                error={parseError}
              />
            </TabsContent>
            <TabsContent
              value="patch"
              className="flex-1 m-0 flex flex-col overflow-hidden data-[state=inactive]:hidden"
            >
              <PatchEditor onApply={handlePatchApply} error={patchError} />
            </TabsContent>
            <TabsContent
              value="api"
              className="flex-1 m-0 flex flex-col overflow-hidden data-[state=inactive]:hidden"
            >
              <APIDSLWriter onDSLGenerated={onAPIDSLGenerated} />
            </TabsContent>
            <TabsContent
              value="data"
              className="flex-1 m-0 flex flex-col overflow-hidden data-[state=inactive]:hidden"
            >
              <DataViewer
                nodes={rawResult?.nodes || []}
                edges={rawResult?.edges || []}
                metadata={rawResult?.metadata || {}}
                parseError={parseError}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right: Canvas Preview */}
      <div className="w-[60%] h-full">
        <CanvasPreview
          error={parseError}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
        />
      </div>
    </div>
  );
}
