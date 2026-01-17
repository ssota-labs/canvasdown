import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to generate DSL from natural language prompts
 * This is a placeholder implementation - in production, you would integrate
 * with an AI service like OpenAI, Anthropic, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // TODO: Integrate with AI service (OpenAI, Anthropic, etc.)
    // For now, return a simple example based on the prompt
    const generatedDSL = generateSimpleDSL(prompt);

    return NextResponse.json({
      success: true,
      dsl: generatedDSL,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    );
  }
}

/**
 * Simple DSL generator based on prompt keywords
 * In production, replace this with actual AI integration
 */
function generateSimpleDSL(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  // Detect workflow keywords
  const hasStart =
    lowerPrompt.includes('start') || lowerPrompt.includes('begin');
  const hasEnd = lowerPrompt.includes('end') || lowerPrompt.includes('finish');
  const hasProcess =
    lowerPrompt.includes('process') || lowerPrompt.includes('step');
  const hasVideo =
    lowerPrompt.includes('video') || lowerPrompt.includes('youtube');
  const hasImage =
    lowerPrompt.includes('image') || lowerPrompt.includes('picture');

  let dsl = 'canvas LR\n\n';

  if (hasStart) {
    dsl += `@shape start "Start" {\n  shapeType: ellipse,\n  color: green\n}\n\n`;
  }

  if (hasProcess) {
    dsl += `@markdown process "Process" {\n  content: "# Process Step"\n}\n\n`;
  }

  if (hasVideo) {
    dsl += `@youtube video1 "Video" {\n  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"\n}\n\n`;
  }

  if (hasImage) {
    dsl += `@image image1 "Image" {\n  imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131"\n}\n\n`;
  }

  if (hasEnd) {
    dsl += `@shape end "End" {\n  shapeType: ellipse,\n  color: red\n}\n\n`;
  }

  // Add connections
  if (hasStart && hasProcess) {
    dsl += 'start -> process : "begins"\n';
  }
  if (hasProcess && hasVideo) {
    dsl += 'process -> video1 : "watch"\n';
  }
  if (hasVideo && hasImage) {
    dsl += 'video1 -> image1 : "shows"\n';
  }
  if (hasImage && hasEnd) {
    dsl += 'image1 -> end : "completes"\n';
  } else if (hasProcess && hasEnd) {
    dsl += 'process -> end : "completes"\n';
  } else if (hasStart && hasEnd) {
    dsl += 'start -> end : "completes"\n';
  }

  // If no specific keywords found, return a basic example
  if (dsl === 'canvas LR\n\n') {
    dsl = `canvas LR

@shape start "Start" {
  shapeType: ellipse,
  color: green
}

@markdown process "Process" {
  content: "# ${prompt}"
}

@shape end "End" {
  shapeType: ellipse,
  color: red
}

start -> process : "begins"
process -> end : "completes"
`;
  }

  return dsl;
}
