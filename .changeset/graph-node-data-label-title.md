---
'@ssota-labs/canvasdown': patch
'@ssota-labs/canvasdown-reactflow': patch
demo: patch
---

Expose @shape quoted string as data.label and data.title in graph nodes

- **GraphBuilder**: When building graph node `data`, set `data.label` to the AST node label (the quoted string in `@shape id "..."`) and `data.title` to the body's `title` if present, otherwise to the label.
- Ensures downstream adapters (e.g. `@ssota-labs/canvasdown-reactflow`) receive a non-empty `data.title` so block titles show the label text instead of falling back to node id (e.g. "claim_1").

React Flow adapter: customize @update application

- **transformUpdateNode**: Optional `ApplyPatchOptions.transformUpdateNode` and `UseCanvasdownPatchOptions.transformUpdateNode` let you control how `@update` is applied (e.g. merge into `data.properties`, or convert `content` from markdown to TipTap JSON). When set, the default merge into `node.data` is skipped for that update.
- **Types**: Export `TransformUpdateNode` from the adapter package.
