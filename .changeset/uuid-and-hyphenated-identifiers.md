---
'@ssota-labs/canvasdown': minor
'@ssota-labs/canvasdown-reactflow': patch
---

Support UUID and hyphenated identifiers in DSL and Patch

- **Lexer**: Identifier accepts UUIDs (8-4-4-4-12 hex) and hyphenated IDs (e.g. `thesis-ddd`, `node-a`). Classic IDs allow hyphens only between segments so `->` (Arrow) is unchanged.
- **Token order**: Identifier and NumberLiteral are tried before Arrow so UUIDs and hyphenated IDs parse correctly in Patch DSL (fixes "unexpected character" on `-`).
- **Patch DSL**: Parsing and validation work with UUID and hyphenated node IDs; no parse errors for `@update`, `@connect`, `@add`, etc. when using such IDs.
