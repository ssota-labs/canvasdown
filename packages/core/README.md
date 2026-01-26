# @ssota-labs/canvasdown

**The framework-independent core of Canvasdown** — Parse DSL text, register custom types, and generate graph data with automatic layout.

[![npm version](https://img.shields.io/npm/v/@ssota-labs/canvasdown)](https://www.npmjs.com/package/@ssota-labs/canvasdown)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## Overview

`@ssota-labs/canvasdown` is the foundation of Canvasdown. It provides:

- **DSL Parser** — Chevrotain-based parser for Canvasdown DSL
- **Type Registry** — Dynamic block and edge type registration
- **Graph Builder** — Convert AST to graph data structures
- **Auto Layout** — dagre-based automatic node positioning
- **Patch Support** — Incremental updates via Patch DSL

This package is **framework-independent** — no React, no DOM, just pure TypeScript. Use it with any rendering framework or build your own adapter.

## Installation

```bash
npm install @ssota-labs/canvasdown
```

## Quick Start

```typescript
import { CanvasdownCore } from '@ssota-labs/canvasdown';

// 1. Create core instance
const core = new CanvasdownCore();

// 2. Register block types
core.registerBlockType({
  name: 'shape',
  defaultProperties: { shapeType: 'rectangle', color: 'blue' },
  defaultSize: { width: 200, height: 100 },
});

core.registerBlockType({
  name: 'text',
  defaultProperties: { content: '' },
  defaultSize: { width: 300, height: 150 },
});

// 3. Parse and layout DSL
const dsl = `
canvas LR

@shape start "Start" { shapeType: ellipse, color: green }
@text process "Process Data"
@shape end "End" { shapeType: ellipse, color: red }

start -> process : "begins"
process -> end : "completes"
`;

const result = core.parseAndLayout(dsl);

// result.nodes - Array of positioned graph nodes
// result.edges - Array of graph edges
// result.metadata - Layout metadata (direction, engine, etc.)
```

## Core Concepts

### Block Type Registration

Register custom block types with default properties and sizes:

```typescript
core.registerBlockType({
  name: 'kanban-card',
  defaultProperties: {
    status: 'todo',
    assignee: null,
    priority: 'medium',
  },
  defaultSize: { width: 300, height: 200 },
  validate: (props) => {
    // Optional validation function
    return props.status in ['todo', 'in-progress', 'done'];
  },
  propertySchema: {
    // Optional: Define property constraints for validation and LLM templates
    status: {
      type: 'enum',
      enum: ['todo', 'in-progress', 'done'],
      description: 'Task status',
    },
    priority: {
      type: 'enum',
      enum: ['low', 'medium', 'high'],
    },
  },
});
```

### Edge Type Registration

Register custom edge types with default styles:

```typescript
core.registerEdgeType({
  name: 'flow',
  defaultShape: 'default',
  defaultStyle: { stroke: '#333', strokeWidth: 2 },
  defaultData: { animated: false },
});
```

### Custom Properties

Define custom properties using `@schema` or inline:

```typescript
// Using @schema
const dsl = `
@schema kanban-card {
  status: string
  assignee: string | null
  priority: "low" | "medium" | "high"
}

@kanban-card task1 "Implement Login" {
  status: "in-progress"
  assignee: "alice"
  priority: "high"
}
`;

// Inline properties (no schema needed)
const dsl2 = `
@shape node1 "Node" {
  customProp: "value"
  nested: { key: "value" }
}
`;
```

### Patch DSL

Update diagrams incrementally without regenerating the entire diagram:

```typescript
// Initial diagram
const initialDsl = `
canvas LR
@shape a "Node A"
@shape b "Node B"
a -> b
`;

const result = core.parseAndLayout(initialDsl);

// Apply patch
const patchDsl = `
@add [shape:c] "Node C" { color: purple }
@connect b -> c
@update a { color: red }
@delete b
`;

const patchedResult = core.parseAndLayout(patchDsl, {
  baseGraph: result, // Use previous result as base
});
```

## API Reference

### `CanvasdownCore`

Main class for parsing and layout.

#### Methods

##### `registerBlockType(definition: BlockTypeDefinition)`

Register a new block type.

```typescript
core.registerBlockType({
  name: 'my-block',
  defaultProperties: { /* ... */ },
  defaultSize: { width: 200, height: 100 },
  validate?: (props) => boolean,
  propertySchema?: Record<string, PropertySchema>,
});
```

##### `getBlockTypeSchema(name: string)`

Get property schema for a block type. Useful for generating LLM template prompts.

```typescript
const schema = core.getBlockTypeSchema('shape');
// Returns: { shapeType: { type: 'enum', enum: [...] }, ... }
```

##### `registerEdgeType(definition: EdgeTypeDefinition)`

Register a new edge type.

```typescript
core.registerEdgeType({
  name: 'my-edge',
  defaultShape: 'default' | 'straight' | 'step' | 'smoothstep' | 'simplebezier',
  defaultStyle?: { stroke: string; strokeWidth: number },
  defaultData?: Record<string, unknown>,
});
```

##### `parseAndLayout(dsl: string, options?: ParseOptions)`

Parse DSL text and apply automatic layout.

```typescript
const result = core.parseAndLayout(dsl, {
  baseGraph?: GraphOutput, // For patch mode
  direction?: 'LR' | 'RL' | 'TB' | 'BT',
});
```

Returns:
```typescript
{
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    direction: string;
    layoutEngine: 'dagre';
  };
}
```

##### `parse(dsl: string)`

Parse DSL text only (no layout).

```typescript
const ast = core.parse(dsl);
```

##### `layout(graph: GraphOutput, direction?: Direction)`

Apply layout to an existing graph.

```typescript
const laidOut = core.layout(graph, 'LR');
```

## Type Definitions

### `BlockTypeDefinition`

```typescript
interface BlockTypeDefinition<TProps = Record<string, unknown>> {
  name: string;
  defaultProperties: TProps;
  defaultSize: { width: number; height: number };
  validate?: (props: TProps) => boolean;
  propertySchema?: Record<string, PropertySchema>;
}
```

### `PropertySchema`

Define property constraints for validation and LLM template generation.

```typescript
interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'enum';
  enum?: string[];           // Required when type is 'enum'
  min?: number;              // For number type
  max?: number;              // For number type
  pattern?: string;           // Regex pattern for string type
  description?: string;       // Description for template prompts
}
```

### `EdgeTypeDefinition`

```typescript
interface EdgeTypeDefinition<TData = Record<string, unknown>> {
  name: string;
  defaultShape: 'default' | 'straight' | 'step' | 'smoothstep' | 'simplebezier';
  defaultStyle?: { stroke: string; strokeWidth: number };
  defaultData?: TData;
}
```

### `GraphNode`

```typescript
interface GraphNode<TNodeData = Record<string, unknown>> {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  data: TNodeData;
}
```

### `GraphEdge`

```typescript
interface GraphEdge<TEdgeData = Record<string, unknown>> {
  id: string;
  source: string;
  target: string;
  label?: string;
  shape?: string;
  style?: { stroke: string; strokeWidth: number };
  data: TEdgeData;
}
```

## Architecture

```
core/
├── parser/          # Chevrotain-based DSL parser
│   ├── lexer.ts     # Tokenizer
│   ├── parser.ts    # Grammar parser
│   ├── visitor.ts   # AST visitor
│   └── patch-parser.ts  # Patch DSL parser
├── registry/        # Type registration
│   ├── block-type-registry.ts
│   └── edge-type-registry.ts
├── builder/         # AST → Graph conversion
│   └── graph-builder.ts
└── layout/          # Auto layout
    └── dagre-layout.ts
```

## Framework Independence

This package has **zero framework dependencies**. It's pure TypeScript and can be used with:

- React (via `@ssota-labs/canvasdown-reactflow`)
- Vue (build your own adapter)
- Svelte (build your own adapter)
- Vanilla JavaScript
- Node.js
- Any other framework or runtime

The output is simple graph data structures (`{ nodes, edges }`) that any rendering system can consume.

## Examples

### Basic Flowchart

```typescript
const dsl = `
canvas LR

@shape start "Start" { shapeType: ellipse, color: green }
@shape process "Process" { color: blue }
@shape decision "Decision?" { shapeType: diamond, color: yellow }
@shape end "End" { shapeType: ellipse, color: red }

start -> process
process -> decision
decision -> end : "Yes"
decision -> process : "No"
`;

const result = core.parseAndLayout(dsl);
```

### With Custom Properties

```typescript
const dsl = `
@schema task {
  status: "todo" | "in-progress" | "done"
  assignee: string | null
  dueDate: string
}

@task task1 "Implement Feature" {
  status: "in-progress"
  assignee: "alice"
  dueDate: "2025-01-20"
}

@task task2 "Write Tests" {
  status: "todo"
  assignee: null
  dueDate: "2025-01-25"
}

task1 -> task2
`;
```

### Edge Labels and Properties

```typescript
const dsl = `
canvas TB

@shape a "Node A"
@shape b "Node B"

a -> b : "main flow" {
  sourceLabel: "from"
  targetLabel: "to"
  animated: true
  style: { stroke: "#ff0000", strokeWidth: 3 }
}
`;
```

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

- [`@ssota-labs/canvasdown-reactflow`](../adapter/react-flow/README.md) — React Flow adapter and hooks
- [Main Canvasdown README](../../README.md) — Full documentation

## License

MIT
