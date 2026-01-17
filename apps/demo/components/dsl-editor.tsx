'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { editor } from 'monaco-editor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Dynamic import for Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.Editor),
  { ssr: false }
);

interface DSLEditorProps {
  dsl: string;
  onDslChange: (dsl: string) => void;
  error: string | null;
}

export function DSLEditor({ dsl, onDslChange, error }: DSLEditorProps) {
  const [isMounted] = useState(true);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Configure Monaco Editor for DSL
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      tabSize: 2,
      formatOnPaste: true,
      formatOnType: true,
    });

    // Register DSL language (basic configuration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monaco = (window as any).monaco;
    if (monaco) {
      monaco.languages.register({ id: 'canvasdown' });
      monaco.languages.setMonarchTokensProvider('canvasdown', {
        tokenizer: {
          root: [
            [/@\w+/, 'keyword'],
            [/canvas\s+\w+/, 'keyword'],
            [/"[^"]*"/, 'string'],
            [/:\s*/, 'delimiter'],
            [/\{/, 'delimiter.bracket'],
            [/\}/, 'delimiter.bracket'],
            [/->/, 'operator'],
            [/\/\/.*$/, 'comment'],
            [/\d+/, 'number'],
            [/[\w$]+/, 'identifier'],
          ],
        },
      });

      // Set theme colors
      monaco.editor.defineTheme('canvasdown-theme', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '0066CC', fontStyle: 'bold' },
          { token: 'string', foreground: '008000' },
          { token: 'comment', foreground: '808080', fontStyle: 'italic' },
          { token: 'operator', foreground: '0000FF' },
          { token: 'number', foreground: '098658' },
        ],
        colors: {},
      });

      monaco.editor.setTheme('canvasdown-theme');
    }
  };

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      onDslChange(value);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col h-full bg-background">
        <Card className="rounded-none border-b border-x-0 border-t-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">DSL Editor</CardTitle>
            <CardDescription className="text-xs">
              Loading editor...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <Card className="rounded-none border-b border-x-0 border-t-0 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">DSL Editor</CardTitle>
          <CardDescription className="text-xs">
            Edit the DSL below to see the preview update
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert
          variant="destructive"
          className="rounded-none border-x-0 border-t-0"
        >
          <AlertDescription className="font-mono text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language="canvasdown"
          value={dsl}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          theme="canvasdown-theme"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
}
