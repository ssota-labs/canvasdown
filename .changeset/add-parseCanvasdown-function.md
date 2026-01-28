---
"@ssota-labs/canvasdown-reactflow": minor
---

Add `parseCanvasdown` function for synchronous parsing without React hooks

- Add `parseCanvasdown` function that provides synchronous DSL parsing and conversion to React Flow nodes/edges
- Refactor `useCanvasdown` hook to use `parseCanvasdown` internally
- Change `UseCanvasdownOptions` from interface to type alias for better type compatibility
