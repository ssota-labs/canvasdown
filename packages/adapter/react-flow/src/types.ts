/**
 * Layout direction type
 */
export type Direction = 'LR' | 'RL' | 'TB' | 'BT';

// Re-export hook types for convenience
export type {
  UseCanvasdownOptions,
  UseCanvasdownReturn,
} from './hooks/useCanvasdown';
export type {
  UseCanvasdownPatchOptions,
  UseCanvasdownPatchReturn,
} from './hooks/useCanvasdownPatch';

// Re-export patch types
export type { ApplyPatchOptions } from './patch/patch-applier';
