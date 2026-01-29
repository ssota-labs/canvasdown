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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { PATCH_EXAMPLES } from '@/lib/examples';

interface PatchEditorProps {
  onApply: (patchDsl: string) => void;
  error: string | null;
}

export function PatchEditor({ onApply, error }: PatchEditorProps) {
  const [patchDsl, setPatchDsl] = useState('');

  const handleApply = () => {
    if (patchDsl.trim()) {
      onApply(patchDsl);
      setPatchDsl(''); // Clear after applying
    }
  };

  const handleLoadExample = (ex: (typeof PATCH_EXAMPLES)[number]) => {
    setPatchDsl(ex.patchDsl);
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Load Example
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            {PATCH_EXAMPLES.map(ex => (
              <DropdownMenuItem
                key={ex.id}
                onClick={() => handleLoadExample(ex)}
                className="flex flex-col items-start gap-1 py-3"
              >
                <div className="font-medium">{ex.name}</div>
                <div className="text-xs text-muted-foreground">
                  {ex.description}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-hidden">
        <Textarea
          value={patchDsl}
          onChange={e => setPatchDsl(e.target.value)}
          className="h-full w-full resize-none border-0 rounded-none font-mono text-sm leading-relaxed focus-visible:ring-0"
          placeholder={`Enter patch commands here...

Load Example: Basic (start, process) or UUID (use with "UUID IDs" canvas).
Use current canvas node IDs.`}
        />
      </div>
    </div>
  );
}
