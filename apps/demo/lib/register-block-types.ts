import { CanvasdownCore } from '@ssota-labs/canvasdown';

/**
 * Register SSOTA block types with Canvasdown Core
 */
export function registerBlockTypes(core: InstanceType<typeof CanvasdownCore>) {
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
    propertySchema: {
      shapeType: {
        type: 'enum',
        enum: [
          'rectangle',
          'ellipse',
          'triangle',
          'diamond',
          'hexagon',
          'parallelogram',
          'cylinder',
        ],
        description: 'Shape type for the block',
      },
      color: {
        type: 'enum',
        enum: [
          'red',
          'orange',
          'amber',
          'green',
          'blue',
          'purple',
          'pink',
          'gray',
        ],
        description: 'Color of the shape',
      },
      borderStyle: {
        type: 'enum',
        enum: ['solid', 'dashed', 'dotted'],
        description: 'Border style of the shape',
      },
    },
  });

  // Markdown block type
  core.registerBlockType({
    name: 'markdown',
    defaultProperties: {
      content: '',
    },
    defaultSize: { width: 300, height: 200 },
    propertySchema: {
      content: {
        type: 'string',
        description: 'Markdown content to display',
      },
    },
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
    propertySchema: {
      imageUrl: {
        type: 'string',
        description: 'URL of the image to display',
      },
      caption: {
        type: 'string',
        description: 'Caption text for the image',
      },
      isCaptionVisible: {
        type: 'boolean',
        description: 'Whether the caption is visible',
      },
      alt: {
        type: 'string',
        description: 'Alternative text for the image',
      },
    },
  });

  // YouTube block type
  core.registerBlockType({
    name: 'youtube',
    defaultProperties: {
      url: '',
      videoId: '',
    },
    defaultSize: { width: 400, height: 260 },
    propertySchema: {
      url: {
        type: 'string',
        description: 'Full YouTube URL',
      },
      videoId: {
        type: 'string',
        description: 'YouTube video ID',
      },
    },
  });

  // Zone block type (group/container)
  core.registerBlockType({
    name: 'zone',
    isGroup: true, // Mark as group type
    defaultProperties: {
      direction: 'TB',
      color: 'gray',
      padding: 20,
      label: '',
      collapsed: false,
    },
    defaultSize: { width: 400, height: 300 },
    propertySchema: {
      direction: {
        type: 'enum',
        enum: ['TB', 'LR', 'RL', 'BT'],
        description: 'Layout direction within the zone',
      },
      color: {
        type: 'enum',
        enum: [
          'red',
          'orange',
          'amber',
          'green',
          'blue',
          'purple',
          'pink',
          'gray',
        ],
        description: 'Zone background/border color',
      },
      padding: {
        type: 'number',
        min: 0,
        description: 'Internal padding for the zone',
      },
      collapsed: {
        type: 'boolean',
        description: 'Whether the zone is collapsed',
      },
    },
  });

  // Edge type
  core.registerEdgeType({
    name: 'default',
    defaultShape: 'default',
    defaultStyle: {
      stroke: '#b1b1b7',
      strokeWidth: 2,
    },
    edgePropertySchema: {
      markerEnd: {
        type: 'enum',
        enum: ['arrow', 'arrowclosed'],
        description: 'Marker at the end of the edge (target side)',
      },
      markerStart: {
        type: 'enum',
        enum: ['arrow', 'arrowclosed'],
        description: 'Marker at the start of the edge (source side)',
      },
    },
  });
}
