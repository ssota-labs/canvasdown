---
'@ssota-labs/canvasdown-reactflow': minor
demo: patch
---

Add NodeTypes generic type support to useCanvasdown hook for type safety.

**Features:**

- `useCanvasdown` hook now accepts optional `nodeTypes` parameter
- Generic type support: `useCanvasdown<TNodeTypes>(dsl, { core, nodeTypes })`
- Type-safe node types: returned `nodes` have `type` field constrained to `NodeTypes` keys
- `ExtractNodeType<TNodeTypes>` utility type for extracting node type keys
- `toReactFlowNodes` function now supports generic types
- Demo app updated with `CANVAS_NODE_TYPES` configuration example

**Breaking Changes:**

None - fully backward compatible. Existing code without `nodeTypes` continues to work.

**Example:**

```typescript
const nodeTypes = {
  shape: ShapeBlock,
  markdown: MarkdownBlock,
} as const;

const { nodes, edges } = useCanvasdown(dsl, {
  core,
  nodeTypes, // nodes.type is now 'shape' | 'markdown'
});
```
