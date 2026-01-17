# @canvasdown/react-flow

**React Flow adapter for Canvasdown** — Render Canvasdown DSL diagrams in React Flow with your custom components.

[![npm version](https://img.shields.io/npm/v/@canvasdown/react-flow)](https://www.npmjs.com/package/@canvasdown/react-flow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## Overview

`@canvasdown/react-flow` provides React hooks and components to integrate Canvasdown DSL with React Flow. It converts Canvasdown graph data into React Flow nodes and edges, allowing you to use your existing React Flow node components.

## Installation

```bash
npm install @canvasdown/react-flow @canvasdown/core @xyflow/react react react-dom
```

**Peer Dependencies:**
- `react` ^19.0.0
- `react-dom` ^19.0.0
- `@xyflow/react` ^12.8.2

## Quick Start

```tsx
import { useCanvasdown } from '@canvasdown/react-flow';
import { ReactFlow } from '@xyflow/react';
import { CanvasdownCore } from '@canvasdown/core';
import { ShapeBlock } from './components/ShapeBlock';
import { MarkdownBlock } from './components/MarkdownBlock';

// 1. Set up core with block types
const core = new CanvasdownCore();
core.registerBlockType({
  name: 'shape',
  defaultProperties: { shapeType: 'rectangle', color: 'blue' },
  defaultSize: { width: 200, height: 100 },
});

// 2. Map block types to your React components
const nodeTypes = {
  shape: ShapeBlock,
  markdown: MarkdownBlock,
};

function MyCanvas() {
  const dsl = `
    canvas LR
    
    @shape start "Start" { color: green }
    @markdown content "# Hello" { theme: dark }
    
    start -> content
  `;

  const { nodes, edges, error } = useCanvasdown(dsl, { core });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
```

## Features

- **`useCanvasdown` Hook** — Parse DSL and get React Flow nodes/edges
- **`useCanvasdownPatch` Hook** — Incrementally update canvas with Patch DSL
- **Custom Edge Component** — `CustomEdge` with label support
- **State Management** — `CanvasStateManager` for advanced use cases
- **Type Safety** — Full TypeScript support

## Hooks

### `useCanvasdown`

Parse DSL and get React Flow nodes and edges.

```tsx
import { useCanvasdown } from '@canvasdown/react-flow';

function MyCanvas() {
  const { nodes, edges, error } = useCanvasdown(dsl, {
    core: canvasdownCore,
    direction: 'LR', // Optional: override DSL direction
  });

  return <ReactFlow nodes={nodes} edges={edges} />;
}
```

**Options:**
- `core: CanvasdownCore` — Core instance with registered types
- `direction?: 'LR' | 'RL' | 'TB' | 'BT'` — Override layout direction

**Returns:**
- `nodes: Node[]` — React Flow nodes
- `edges: Edge[]` — React Flow edges
- `error: Error | null` — Parsing error if any

### `useCanvasdownPatch`

Incrementally update canvas with Patch DSL.

```tsx
import { useCanvasdownPatch } from '@canvasdown/react-flow';

function MyCanvas() {
  const initialDsl = `
    canvas LR
    @shape a "Node A"
    @shape b "Node B"
    a -> b
  `;

  const { nodes, edges, applyPatch, error } = useCanvasdownPatch(initialDsl, {
    core: canvasdownCore,
  });

  const handleAddNode = () => {
    applyPatch(`
      @add [shape:c] "Node C" { color: purple }
      @connect b -> c
    `);
  };

  return (
    <>
      <button onClick={handleAddNode}>Add Node</button>
      <ReactFlow nodes={nodes} edges={edges} />
    </>
  );
}
```

**Options:**
- `core: CanvasdownCore` — Core instance with registered types
- `direction?: 'LR' | 'RL' | 'TB' | 'BT'` — Override layout direction

**Returns:**
- `nodes: Node[]` — React Flow nodes
- `edges: Edge[]` — React Flow edges
- `applyPatch: (patchDsl: string) => void` — Apply patch DSL
- `error: Error | null` — Parsing error if any

## Components

### `CustomEdge`

Custom edge component with label support.

```tsx
import { CustomEdge } from '@canvasdown/react-flow';

const edgeTypes = {
  default: CustomEdge,
};

<ReactFlow
  nodes={nodes}
  edges={edges}
  edgeTypes={edgeTypes}
/>
```

The `CustomEdge` component automatically handles:
- Edge labels
- Source/target labels
- Custom edge styles
- Animated edges

## Advanced Usage

### State Manager

For more control over canvas state:

```tsx
import { CanvasStateManager, toReactFlowGraph } from '@canvasdown/react-flow';
import { CanvasdownCore } from '@canvasdown/core';

const core = new CanvasdownCore();
// ... register types

const manager = new CanvasStateManager(core);

// Parse DSL
const result = core.parseAndLayout(dsl);

// Convert to React Flow
const { nodes, edges } = toReactFlowGraph(result);

// Update with patch
const patchResult = manager.applyPatch(result, patchDsl);
const { nodes: newNodes, edges: newEdges } = toReactFlowGraph(patchResult);
```

### Manual Conversion

Convert Canvasdown graph data to React Flow format:

```tsx
import { toReactFlowNodes, toReactFlowEdges } from '@canvasdown/react-flow';
import { CanvasdownCore } from '@canvasdown/core';

const core = new CanvasdownCore();
const result = core.parseAndLayout(dsl);

const nodes = toReactFlowNodes(result.nodes);
const edges = toReactFlowEdges(result.edges);
```

### Using Your React Components

Your React Flow node components receive Canvasdown properties via the `data` prop:

```tsx
// DSL
@kanban-card task1 "Implement Login" {
  status: "in-progress"
  assignee: "alice"
  priority: "high"
}
```

```tsx
// Your component
import { NodeProps } from '@xyflow/react';

function KanbanCard({ data }: NodeProps) {
  const { status, assignee, priority } = data;
  
  return (
    <Card className={`status-${status} priority-${priority}`}>
      <h3>{data.label}</h3>
      <Badge>{status}</Badge>
      <Avatar user={assignee} />
    </Card>
  );
}

// Register and use
const nodeTypes = {
  'kanban-card': KanbanCard,
};
```

## Patch Operations

Supported Patch DSL commands:

```
@add [blockType:id] "Label" { ... }   // Add new block
@update id { property: newValue }       // Update block properties
@delete id                              // Delete block
@connect source -> target               // Add edge
@disconnect source -> target            // Remove edge
@move id { x: 100, y: 200 }            // Move block
@resize id { width: 300, height: 200 }  // Resize block
```

## TypeScript

Full TypeScript support with type inference:

```tsx
import type { UseCanvasdownOptions, UseCanvasdownReturn } from '@canvasdown/react-flow';

const options: UseCanvasdownOptions = {
  core: canvasdownCore,
  direction: 'LR',
};

const { nodes, edges }: UseCanvasdownReturn = useCanvasdown(dsl, options);
```

## Examples

### Basic Flowchart

```tsx
function Flowchart() {
  const dsl = `
    canvas LR
    
    @shape start "Start" { shapeType: ellipse, color: green }
    @shape process "Process" { color: blue }
    @shape end "End" { shapeType: ellipse, color: red }
    
    start -> process -> end
  `;

  const { nodes, edges } = useCanvasdown(dsl, { core });

  return <ReactFlow nodes={nodes} edges={edges} />;
}
```

### Interactive Canvas with Patches

```tsx
function InteractiveCanvas() {
  const [dsl, setDsl] = useState(initialDsl);
  const { nodes, edges, applyPatch } = useCanvasdownPatch(dsl, { core });

  const addNode = () => {
    applyPatch(`@add [shape:newNode] "New" { color: purple }`);
  };

  const updateNode = (id: string, color: string) => {
    applyPatch(`@update ${id} { color: "${color}" }`);
  };

  return (
    <>
      <button onClick={addNode}>Add Node</button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(e) => updateNode(e.node.id, 'red')}
      />
    </>
  );
}
```

### Custom Edge Labels

```tsx
const dsl = `
canvas TB

@shape a "Node A"
@shape b "Node B"

a -> b : "main flow" {
  sourceLabel: "from"
  targetLabel: "to"
  animated: true
}
`;

// CustomEdge automatically handles labels
const edgeTypes = {
  default: CustomEdge,
};
```

## API Reference

### `useCanvasdown(dsl: string, options: UseCanvasdownOptions)`

Parse DSL and return React Flow nodes/edges.

### `useCanvasdownPatch(initialDsl: string, options: UseCanvasdownPatchOptions)`

Initialize canvas and return patch function.

### `toReactFlowNodes(graphNodes: GraphNode[])`

Convert Canvasdown nodes to React Flow nodes.

### `toReactFlowEdges(graphEdges: GraphEdge[])`

Convert Canvasdown edges to React Flow edges.

### `toReactFlowGraph(graph: GraphOutput)`

Convert entire Canvasdown graph to React Flow format.

### `CanvasStateManager`

State manager for advanced canvas operations.

### `CustomEdge`

React Flow edge component with label support.

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test

# Test with coverage
pnpm test:coverage

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Related Packages

- [`@canvasdown/core`](../core/README.md) — Core DSL parser and layout engine
- [Main Canvasdown README](../../README.md) — Full documentation

## License

MIT
