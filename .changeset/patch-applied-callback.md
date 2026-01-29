---
'@ssota-labs/canvasdown-reactflow': minor
---

Add patch applied callback API for server sync and side effects

- **onPatchApplied**: Optional callback invoked after a patch is successfully applied (setNodes/setEdges done). Receives `PatchAppliedResult` (`operations`, `nodes`, `edges`, optional `patchDsl`). Use for server sync (e.g. filter update ops and call updateBlockContentByMountId). Async callbacks are fire-and-forget; rejections are logged.
- **onPatchError**: Optional callback invoked when validation or apply fails. Use for toasts/alerts.
- **PatchAppliedResult**: New type exported for `onPatchApplied` result. Re-exported from package and types.
