/**
 * Node Types Configuration
 *
 * React Flow의 nodeTypes 정의를 한 곳에서 관리
 * - 실제 Canvas와 Landing Canvas에서 공통으로 사용
 * - 새로운 블록 타입 추가 시 이곳만 수정
 * - useCanvasdown 훅에 전달하여 타입 안정성 확보
 */

'use client';

import type { NodeTypes } from '@xyflow/react';
import { ImageBlock } from '@/components/blocks/image-block';
import { MarkdownBlock } from '@/components/blocks/markdown-block';
import { ShapeBlock } from '@/components/blocks/shape-block';
import { YouTubeBlock } from '@/components/blocks/youtube-block';
import { ZoneBlock } from '@/components/blocks/zone-block';

/**
 * React Flow Node Types
 *
 * 모든 블록 타입을 React Flow 노드로 등록
 * useCanvasdown 훅에 전달하면 nodes의 type 필드가 타입 안정성을 갖게 됨
 */
export const CANVAS_NODE_TYPES = {
  shape: ShapeBlock,
  markdown: MarkdownBlock,
  image: ImageBlock,
  youtube: YouTubeBlock,
  zone: ZoneBlock,
} as const satisfies NodeTypes;
