import { NextRequest, NextResponse } from 'next/server';
import {
  CanvasdownCore,
  type CanvasdownCoreOptions,
} from '@ssota-labs/canvasdown';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dsl } = body;

    if (!dsl || typeof dsl !== 'string') {
      return NextResponse.json(
        { error: 'DSL is required and must be a string' },
        { status: 400 }
      );
    }

    // Parse and validate DSL
    const options: CanvasdownCoreOptions = {
      defaultExtent: 'parent', // Constrain zone children to parent bounds by default
    };
    const core = new CanvasdownCore(options);
    const result = core.parseAndLayout(dsl);

    // Return parsed data
    return NextResponse.json({
      success: true,
      data: {
        nodes: result.nodes,
        edges: result.edges,
        metadata: result.metadata,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'DSL API endpoint',
    usage: {
      method: 'POST',
      body: { dsl: 'string' },
      response: {
        success: 'boolean',
        data: {
          nodes: 'array',
          edges: 'array',
          metadata: 'object',
        },
      },
    },
  });
}
