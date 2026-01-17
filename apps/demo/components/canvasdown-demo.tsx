'use client';

import { useMemo, useState } from 'react';
import { CanvasdownCore, type CanvasdownOutput } from '@ssota-labs/canvasdown';
import {
  toReactFlowEdges,
  toReactFlowNodes,
  useCanvasdownPatch,
} from '@ssota-labs/canvasdown-reactflow';
import { ReactFlowProvider } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Example } from '@/lib/examples';
import { registerBlockTypes } from '@/lib/register-block-types';
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
    const c = new CanvasdownCore();
    registerBlockTypes(c);
    return c;
  }, []);

  // Parse and layout DSL - keep this pure, no side effects
  const { nodes, edges, parseError, rawResult } = useMemo(() => {
    try {
      const result = core.parseAndLayout(dsl);
      return {
        nodes: toReactFlowNodes(result.nodes),
        edges: toReactFlowEdges(result.edges, result.metadata.direction),
        parseError: null,
        rawResult: result,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        nodes: [],
        edges: [],
        parseError: errorMessage,
        rawResult: null,
      };
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
  initialNodes: ReturnType<typeof toReactFlowNodes>;
  initialEdges: ReturnType<typeof toReactFlowEdges>;
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
  const { applyPatch } = useCanvasdownPatch(core, {
    preservePositions: true,
    direction: 'LR',
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
