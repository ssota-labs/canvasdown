'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface APIDSLWriterProps {
  onDSLGenerated: (dsl: string) => void;
}

export function APIDSLWriter({ onDSLGenerated }: APIDSLWriterProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedDSL, setGeneratedDSL] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedDSL(null);

    try {
      // Call API to generate DSL
      const response = await fetch('/api/dsl/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate DSL');
      }

      const data = await response.json();
      setGeneratedDSL(data.dsl);
      onDSLGenerated(data.dsl);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate DSL';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseGenerated = () => {
    if (generatedDSL) {
      onDSLGenerated(generatedDSL);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>API DSL Writer</CardTitle>
        <CardDescription>
          Generate DSL from natural language using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Describe your canvas</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g., Create a workflow with start, process, and end nodes"
            rows={4}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate DSL'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {generatedDSL && (
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Generated DSL</Label>
              <Button onClick={handleUseGenerated} variant="outline" size="sm">
                Use This DSL
              </Button>
            </div>
            <Textarea
              value={generatedDSL}
              readOnly
              className="flex-1 font-mono text-xs"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
