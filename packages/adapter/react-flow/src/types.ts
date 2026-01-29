import type { NodeTypes } from '@xyflow/react';

/**
 * Layout direction type
 */
export type Direction = 'LR' | 'RL' | 'TB' | 'BT';

/**
 * Extract node type keys from NodeTypes as string union
 *
 * @example
 * ```typescript
 * const nodeTypes = {
 *   shape: ShapeBlock,
 *   markdown: MarkdownBlock,
 * } as const;
 *
 * type NodeType = ExtractNodeType<typeof nodeTypes>; // 'shape' | 'markdown'
 * ```
 */
export type ExtractNodeType<TNodeTypes extends NodeTypes> = keyof TNodeTypes &
  string;

// Re-export NodeTypes from @xyflow/react for convenience
export type { NodeTypes } from '@xyflow/react';

// Re-export hook types for convenience
export type {
  UseCanvasdownOptions,
  UseCanvasdownReturn,
} from './hooks/useCanvasdown';
export type {
  PatchAppliedResult,
  UseCanvasdownPatchOptions,
  UseCanvasdownPatchReturn,
} from './hooks/useCanvasdownPatch';

// Re-export patch types
export type {
  ApplyPatchOptions,
  TransformUpdateNode,
} from './patch/patch-applier';
