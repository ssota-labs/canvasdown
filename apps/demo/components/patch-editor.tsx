'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface PatchEditorProps {
  onApply: (patchDsl: string) => void;
  error: string | null;
}

const PATCH_EXAMPLES = `@update start { color: blue }
@update process { content: "# Updated Content" }
@add [shape:newNode] "New Node" { color: purple }
@connect process -> newNode : "connects to"
@move newNode { x: 300, y: 200 }
`;

export function PatchEditor({ onApply, error }: PatchEditorProps) {
  const [patchDsl, setPatchDsl] = useState('');

  const handleApply = () => {
    if (patchDsl.trim()) {
      onApply(patchDsl);
      setPatchDsl(''); // Clear after applying
    }
  };

  const handleLoadExample = () => {
    setPatchDsl(PATCH_EXAMPLES);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <Card className="rounded-none border-b border-x-0 border-t-0 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Patch DSL</CardTitle>
          <CardDescription className="text-xs">
            Apply patch operations to modify the canvas
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert
          variant="destructive"
          className="rounded-none border-x-0 border-t-0"
        >
          <AlertDescription className="font-mono text-xs">
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="border-b border-border bg-card px-4 py-3 flex gap-2">
        <Button onClick={handleApply} disabled={!patchDsl.trim()} size="sm">
          Apply Patch
        </Button>
        <Button onClick={handleLoadExample} variant="outline" size="sm">
          Load Example
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <Textarea
          value={patchDsl}
          onChange={e => setPatchDsl(e.target.value)}
          className="h-full w-full resize-none border-0 rounded-none font-mono text-sm leading-relaxed focus-visible:ring-0"
          placeholder={`Enter patch commands here...

Examples (based on current canvas):
@update start { color: blue }
@update process { content: "# Updated" }
@add [shape:newNode] "New Node" { color: purple }
@connect process -> newNode : "connects"
@move newNode { x: 300, y: 200 }
@resize newNode { width: 400, height: 300 }

Available node IDs: start, process, video1, image1, end`}
        />
      </div>
    </div>
  );
}
