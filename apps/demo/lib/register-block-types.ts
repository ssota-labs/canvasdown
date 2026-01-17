import { CanvasdownCore } from '@canvasdown/core';

/**
 * Register SSOTA block types with Canvasdown Core
 */
export function registerBlockTypes(core: CanvasdownCore) {
  // Shape block type
  core.registerBlockType({
    name: 'shape',
    defaultProperties: {
      shapeType: 'rectangle',
      color: 'blue',
      content: '',
      borderStyle: 'solid',
    },
    defaultSize: { width: 154, height: 70 },
  });

  // Markdown block type
  core.registerBlockType({
    name: 'markdown',
    defaultProperties: {
      content: '',
    },
    defaultSize: { width: 300, height: 200 },
  });

  // Image block type
  core.registerBlockType({
    name: 'image',
    defaultProperties: {
      imageUrl: '',
      caption: '',
      isCaptionVisible: false,
      alt: '',
    },
    defaultSize: { width: 300, height: 200 },
  });

  // YouTube block type
  core.registerBlockType({
    name: 'youtube',
    defaultProperties: {
      url: '',
      videoId: '',
    },
    defaultSize: { width: 400, height: 260 },
  });

  // Edge type
  core.registerEdgeType({
    name: 'default',
    defaultShape: 'default',
    defaultStyle: {
      stroke: '#b1b1b7',
      strokeWidth: 2,
    },
  });
}
