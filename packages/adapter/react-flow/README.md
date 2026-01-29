# @ssota-labs/canvasdown-reactflow

**React Flow adapter for Canvasdown** — Render Canvasdown DSL diagrams in React Flow with your custom components.

[![npm version](https://img.shields.io/npm/v/@ssota-labs/canvasdown-reactflow)](https://www.npmjs.com/package/@ssota-labs/canvasdown-reactflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## Overview

`@ssota-labs/canvasdown-reactflow` provides React hooks and components to integrate Canvasdown DSL with React Flow. It converts Canvasdown graph data into React Flow nodes and edges, allowing you to use your existing React Flow node components.

## Installation

```bash
npm install @ssota-labs/canvasdown-reactflow @ssota-labs/canvasdown @xyflow/react react react-dom
```

**Peer Dependencies:**

- `react` ^19.0.0
- `react-dom` ^19.0.0
- `@xyflow/react` ^12.8.2

## Quick Start

```tsx
import { CanvasdownCore } from '@ssota-labs/canvasdown';
import { useCanvasdown } from '@ssota-labs/canvasdown-reactflow';
import { ReactFlow } from '@xyflow/react';
import { MarkdownBlock } from './components/MarkdownBlock';
import { ShapeBlock } from './components/ShapeBlock';
import { ZoneBlock } from './components/ZoneBlock';

// 1. Set up core with block types
const core = new CanvasdownCore({
  defaultExtent: 'parent', // Optional: constrain zone children to parent bounds
});

core.registerBlockType({
  name: 'shape',
  defaultProperties: { shapeType: 'rectangle', color: 'blue' },
  defaultSize: { width: 200, height: 100 },
});

// Register zone type (group node)
core.registerBlockType({
  name: 'zone',
  isGroup: true, // Mark as group node
  defaultProperties: {
    direction: 'TB',
    color: 'gray',
    padding: 20,
  },
  defaultSize: { width: 400, height: 300 },
});

// 2. Map block types to your React components
const nodeTypes = {
  shape: ShapeBlock,
  markdown: MarkdownBlock,
  zone: ZoneBlock, // Group node component
};

function MyCanvas() {
  const dsl = `
    canvas LR
    
    @shape start "Start" { color: green }
    @markdown content "# Hello" { theme: dark }
    
    start -> content
  `;

  // Or with zones
  const dslWithZones = `
    canvas TB
    
    @zone thesis "Core Thesis" {
      direction: TB,
      color: blue
    }
      @shape main_thesis "Main Argument" { shapeType: ellipse, color: blue }
    @end
    
    @zone claims "Supporting Claims" {
      direction: LR,
      color: green
    }
      @shape claim1 "Claim 1" { shapeType: rectangle, color: green }
      @shape claim2 "Claim 2" { shapeType: rectangle, color: green }
    @end
    
    main_thesis -> claim1
  `;

  const { nodes, edges, error } = useCanvasdown(dslWithZones, { core });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
      <Background />
      <Controls />
    </ReactFlow>
  );
}
```

## Features

- **`parseCanvasdown` Function** — Synchronous DSL parsing without React hooks
- **`useCanvasdown` Hook** — Parse DSL and get React Flow nodes/edges
- **NodeTypes generic** — Type-safe node types: pass `nodeTypes` to constrain `nodes[].type` to your registered keys
- **`useCanvasdownPatch` Hook** — Incrementally update canvas with Patch DSL
- **Custom Edge Component** — `CustomEdge` with label and marker (arrow) support
- **Edge markers** — Configure `markerEnd` / `markerStart` in DSL or via edge type `edgePropertySchema`
- **State Management** — `CanvasStateManager` for advanced use cases
- **Type Safety** — Full TypeScript support
- **Zone/Group Support** — Automatic conversion of zones to React Flow group nodes with `parentId` and `extent`

## Functions

### `parseCanvasdown`

Parse DSL synchronously and convert to React Flow nodes/edges without React hooks. Useful when you need direct control over parsing or when working outside React components.

```tsx
import { useMemo } from 'react';
import { parseCanvasdown } from '@ssota-labs/canvasdown-reactflow';

function MyCanvas() {
  const dsl = `
    canvas LR
    @shape start "Start" { color: green }
    @shape end "End" { color: red }
    start -> end
  `;

  const { nodes, edges, error } = useMemo(() => {
    return parseCanvasdown(dsl, {
      core: canvasdownCore,
      direction: 'LR', // Optional: override DSL direction
      nodeTypes: nodeTypes, // Optional: for type safety
    });
  }, [dsl, core]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <ReactFlow nodes={nodes} edges={edges} />;
}
```

**Options:**

- `core: CanvasdownCore` — Core instance with registered types
- `direction?: 'LR' | 'RL' | 'TB' | 'BT'` — Override layout direction
- `nodeTypes?: TNodeTypes` — Optional. Pass your React Flow `nodeTypes` object for type safety

**Returns:**

- `nodes: Node[]` — React Flow nodes
- `edges: Edge[]` — React Flow edges (include `sourceHandle` / `targetHandle` from layout direction)
- `error: string | null` — Parsing error message if any

**When to use `parseCanvasdown` vs `useCanvasdown`:**

- Use `parseCanvasdown` when you need synchronous parsing without React render cycle dependencies
- Use `parseCanvasdown` when working outside React components or in event handlers
- Use `useCanvasdown` when you want automatic memoization based on dependencies

## Hooks

### `useCanvasdown`

Parse DSL and get React Flow nodes and edges.

```tsx
import { useCanvasdown } from '@ssota-labs/canvasdown-reactflow';

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
- `nodeTypes?: TNodeTypes` — Optional. Pass your React Flow `nodeTypes` object for type safety (see below)

**Returns:**

- `nodes: Node[]` — React Flow nodes
- `edges: Edge[]` — React Flow edges (include `sourceHandle` / `targetHandle` from layout direction)
- `error: string | null` — Parsing error message if any

#### Type-safe node types (NodeTypes generic)

Pass `nodeTypes` so that returned `nodes` have `type` constrained to your registered keys. Fully backward compatible.

```tsx
const nodeTypes = {
  shape: ShapeBlock,
  markdown: MarkdownBlock,
  zone: ZoneBlock,
} as const;

const { nodes, edges } = useCanvasdown(dsl, {
  core,
  nodeTypes, // nodes[].type is now 'shape' | 'markdown' | 'zone'
});

// TypeScript knows the exact node type keys
<ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} />;
```

### `useCanvasdownPatch`

Incrementally update canvas with Patch DSL.

```tsx
import { useCanvasdownPatch } from '@ssota-labs/canvasdown-reactflow';

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

Custom edge component with label and marker support.

```tsx
import { CustomEdge } from '@ssota-labs/canvasdown-reactflow';

const edgeTypes = {
  default: CustomEdge,
};

<ReactFlow nodes={nodes} edges={edges} edgeTypes={edgeTypes} />;
```

The `CustomEdge` component automatically handles:

- Edge labels (center, start, end)
- **Edge markers** — Renders SVG markers for `markerEnd` / `markerStart` when set (e.g. `arrowclosed`, `arrow`)
- Custom edge styles
- Selection styling

## Advanced Usage

### State Manager

For more control over canvas state:

```tsx
import { CanvasdownCore } from '@ssota-labs/canvasdown';
import {
  CanvasStateManager,
  toReactFlowGraph,
} from '@ssota-labs/canvasdown-reactflow';

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
import { CanvasdownCore } from '@ssota-labs/canvasdown';
import {
  toReactFlowEdges,
  toReactFlowNodes,
} from '@ssota-labs/canvasdown-reactflow';

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

### Zone/Group Nodes

Zones are automatically converted to React Flow group nodes. Create a group node component:

```tsx
import { Handle, NodeProps, Position } from '@xyflow/react';

function ZoneBlock({ data, selected }: NodeProps) {
  const { label, color, padding } = data;

  return (
    <div
      style={{
        border: `2px solid ${color}`,
        borderRadius: '8px',
        padding: `${padding}px`,
        backgroundColor: `${color}20`,
        minWidth: '200px',
        minHeight: '100px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{label}</div>
      {/* Children will be rendered inside this group */}
    </div>
  );
}

// Register zone type
core.registerBlockType({
  name: 'zone',
  isGroup: true,
  defaultProperties: { direction: 'TB', color: 'gray', padding: 20 },
  defaultSize: { width: 400, height: 300 },
});

const nodeTypes = {
  zone: ZoneBlock,
};
```

**Zone Features:**

- Children automatically get `parentId` set to the zone's ID
- `extent` property controls whether children are constrained within zone boundaries
- Set `defaultExtent: 'parent'` in `CanvasdownCore` constructor to constrain all zone children
- Or set `extent: 'parent'` per-node in DSL to override default
- Set `extent: undefined` or omit it to allow free movement of children

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
import type {
  UseCanvasdownOptions,
  UseCanvasdownReturn,
} from '@ssota-labs/canvasdown-reactflow';

const options: UseCanvasdownOptions = {
  core: canvasdownCore,
  direction: 'LR',
};

const { nodes, edges }: UseCanvasdownReturn = useCanvasdown(dsl, options);
```

**Generic node types:** Use the `NodeTypes` generic to get type-safe `nodes[].type`:

```tsx
const nodeTypes = {
  shape: ShapeBlock,
  markdown: MarkdownBlock,
} as const;

const { nodes, edges } = useCanvasdown(dsl, {
  core,
  nodeTypes,
});
// nodes[].type is 'shape' | 'markdown'
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

### With Zones (Groups)

```tsx
function ZoneCanvas() {
  const core = new CanvasdownCore({
    defaultExtent: 'parent', // Constrain zone children
  });

  core.registerBlockType({
    name: 'zone',
    isGroup: true,
    defaultProperties: { direction: 'TB', color: 'gray', padding: 20 },
    defaultSize: { width: 400, height: 300 },
  });

  const dsl = `
    canvas TB
    
    @zone thesis "Core Thesis" {
      direction: TB,
      color: blue
    }
      @shape main_thesis "Main Argument" { shapeType: ellipse, color: blue }
    @end
    
    @zone claims "Supporting Claims" {
      direction: LR,
      color: green
    }
      @shape claim1 "Claim 1" { shapeType: rectangle, color: green }
      @shape claim2 "Claim 2" { shapeType: rectangle, color: green }
      @shape claim3 "Claim 3" { shapeType: rectangle, color: green }
    @end
    
    main_thesis -> claim1 : "supports"
    claim1 -> claim2
    claim2 -> claim3
  `;

  const { nodes, edges } = useCanvasdown(dsl, { core });

  const nodeTypes = {
    shape: ShapeBlock,
    zone: ZoneBlock,
  };

  return (
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView />
  );
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
        onNodeClick={e => updateNode(e.node.id, 'red')}
      />
    </>
  );
}
```

### Edge labels and markers

**Labels (center, start, end):**

```tsx
const dsl = `
canvas TB

@shape a "Node A"
@shape b "Node B"

a -> b : "main flow" {
  startLabel: "→"
  endLabel: "✓"
}
`;
```

**Markers (arrows at source/target):**  
Register edge type with `edgePropertySchema` and set markers in DSL.

In your Canvasdown core setup (e.g. `register-block-types.ts`):

```tsx
core.registerEdgeType({
  name: 'default',
  defaultShape: 'default',
  defaultStyle: { stroke: '#b1b1b7', strokeWidth: 2 },
  edgePropertySchema: {
    markerEnd: {
      type: 'enum',
      enum: ['arrow', 'arrowclosed'],
      description: 'Marker at the end of the edge (target side)',
    },
    markerStart: {
      type: 'enum',
      enum: ['arrow', 'arrowclosed'],
      description: 'Marker at the start of the edge (source side)',
    },
  },
});
```

In DSL:

```tsx
a -> b { markerEnd: "arrowclosed" }
a -> b { markerStart: "arrow", markerEnd: "arrowclosed" }
```

`CustomEdge` renders SVG marker definitions and passes `url(#id)` to React Flow’s `BaseEdge`, so arrows appear without extra setup.

## API Reference

### `parseCanvasdown(dsl: string, options: ParseCanvasdownOptions)`

Synchronously parse DSL and return React Flow nodes/edges. Does not depend on React render cycles.

### `useCanvasdown(dsl: string, options: UseCanvasdownOptions)`

Parse DSL and return React Flow nodes/edges. Internally uses `parseCanvasdown` with `useMemo` for automatic memoization.

### `useCanvasdownPatch(initialDsl: string, options: UseCanvasdownPatchOptions)`

Initialize canvas and return patch function.

### `toReactFlowNodes(graphNodes: GraphNode[])` / `toReactFlowNodes<TNodeTypes>(graphNodes: GraphNode[])`

Convert Canvasdown nodes to React Flow nodes. When using `useCanvasdown` with the `nodeTypes` option, the generic constrains returned nodes’ `type` to your registered keys.

### `toReactFlowEdges(graphEdges: GraphEdge[], direction?: 'LR' | 'RL' | 'TB' | 'BT')`

Convert Canvasdown edges to React Flow edges. Sets `sourceHandle` / `targetHandle` from `direction` and passes through `markerEnd` / `markerStart` when present.

### `toReactFlowGraph(graph: GraphOutput)`

Convert entire Canvasdown graph to React Flow format.

### `CanvasStateManager`

State manager for advanced canvas operations.

### `CustomEdge`

React Flow edge component with label and marker (arrow) support. Renders SVG marker definitions for `markerEnd` / `markerStart` when provided by the edge data.

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

- [`@ssota-labs/canvasdown`](../core/README.md) — Core DSL parser and layout engine
- [Main Canvasdown README](../../README.md) — Full documentation

## License

MIT
