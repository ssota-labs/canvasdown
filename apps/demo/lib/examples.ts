export interface Example {
  id: string;
  name: string;
  description: string;
  dsl: string;
  category: 'basic' | 'advanced' | 'workflow' | 'custom';
}

export const EXAMPLES: Example[] = [
  {
    id: 'basic-flow',
    name: 'Basic Flow',
    description: 'Simple start-to-end workflow',
    category: 'basic',
    dsl: `canvas LR

@shape start "Start" {
  shapeType: ellipse,
  color: green
}

@markdown process "Process Data" {
  content: "# Hello World"
}

@shape end "End" {
  shapeType: ellipse,
  color: red
}

start -> process : "begins"
process -> end : "completes"
`,
  },
  {
    id: 'custom-properties',
    name: 'Custom Properties',
    description: 'Example with custom properties and schemas',
    category: 'advanced',
    dsl: `canvas LR

@schema category {
  type: select,
  options: ["tutorial", "demo", "reference"]
}

@schema priority {
  type: number,
  min: 1,
  max: 5
}

@shape start "Start" {
  shapeType: ellipse,
  color: green
}

@markdown process "Process Data" {
  content: "# Hello World"
}

@youtube video1 "Tutorial Video" {
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  $category: "tutorial"
}

@image image1 "Image Block" {
  imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
  $category: "demo",
  $priority: number(3, { min: 1, max: 5 })
}

@shape end "End" {
  shapeType: ellipse,
  color: red
}

start -> process : "begins"
process -> video1 : "watch"
video1 -> image1 : "shows"
image1 -> end {
  label: "completes",
  startLabel: "→",
  endLabel: "✓"
}
`,
  },
  {
    id: 'complex-workflow',
    name: 'Complex Workflow',
    description: 'Multi-step workflow with branches',
    category: 'workflow',
    dsl: `canvas TB

@shape init "Initialize" {
  shapeType: rectangle,
  color: blue
}

@markdown step1 "Step 1: Analysis" {
  content: "## Analysis Phase\\n\\nAnalyze requirements"
}

@markdown step2 "Step 2: Design" {
  content: "## Design Phase\\n\\nCreate design documents"
}

@markdown step3a "Step 3a: Implementation A" {
  content: "## Implementation A"
}

@markdown step3b "Step 3b: Implementation B" {
  content: "## Implementation B"
}

@markdown step4 "Step 4: Testing" {
  content: "## Testing Phase"
}

@shape done "Done" {
  shapeType: ellipse,
  color: green
}

init -> step1 : "start"
step1 -> step2 : "next"
step2 -> step3a : "path A"
step2 -> step3b : "path B"
step3a -> step4 : "merge"
step3b -> step4 : "merge"
step4 -> done : "complete"
`,
  },
  {
    id: 'minimal',
    name: 'Minimal Example',
    description: 'Simplest possible DSL',
    category: 'basic',
    dsl: `canvas LR

@shape node1 "Node 1" {
  color: blue
}

@shape node2 "Node 2" {
  color: red
}

node1 -> node2 : "connects"
`,
  },
  {
    id: 'zone-example',
    name: 'Zone Example',
    description: 'Example with zones (groups) containing child nodes',
    category: 'advanced',
    dsl: `canvas TB

@zone thesis "Core Thesis" {
  direction: TB,
  color: blue
}
  @shape main_thesis "Video's Main Argument" {
    shapeType: ellipse,
    color: blue
  }
@end

@zone claims "Supporting Claims" {
  direction: LR,
  color: green
}
  @shape claim1 "Claim 1" {
    shapeType: rectangle,
    color: green
  }
  @shape claim2 "Claim 2" {
    shapeType: rectangle,
    color: green
  }
  @shape claim3 "Claim 3" {
    shapeType: rectangle,
    color: green
  }
@end

@zone evidence "Evidence" {
  direction: TB,
  color: gray
}
  @shape ev1 "Evidence 1" {
    shapeType: rectangle,
    borderStyle: dashed,
    color: gray
  }
  @shape ev2 "Evidence 2" {
    shapeType: rectangle,
    borderStyle: dashed,
    color: gray
  }
@end

main_thesis -> claim1 : "supports"
main_thesis -> claim2 : "supports"
claim1 -> ev1 : "based on"
`,
  },
  {
    id: 'edge-markers',
    name: 'Edge Markers',
    description: 'Example with edge markers (arrows) using property schema',
    category: 'advanced',
    dsl: `canvas LR

@shape start "Start" {
  shapeType: ellipse,
  color: green
}

@shape step1 "Step 1" {
  shapeType: rectangle,
  color: blue
}

@shape step2 "Step 2" {
  shapeType: rectangle,
  color: purple
}

@shape end "End" {
  shapeType: ellipse,
  color: red
}

start -> step1 {
  markerEnd: "arrowclosed"
}

step1 -> step2 {
  markerStart: "arrow",
  markerEnd: "arrowclosed"
}

step2 -> end : "completes"
`,
  },
  {
    id: 'uuid-ids',
    name: 'UUID IDs',
    description:
      'Nodes use UUID ids (React Flow–style). Use with "Load Example" → "UUID" in Patch to try patching by UUID.',
    category: 'advanced',
    dsl: `canvas LR

@shape 550e8400-e29b-41d4-a716-446655440000 "Start" {
  shapeType: ellipse,
  color: green
}

@markdown a1b2c3d4-e5f6-7890-abcd-ef1234567890 "Process" {
  content: "# Hello"
}

@shape deadbeef-e29b-41d4-a716-446655440000 "End" {
  shapeType: ellipse,
  color: red
}

550e8400-e29b-41d4-a716-446655440000 -> a1b2c3d4-e5f6-7890-abcd-ef1234567890 : "begins"
a1b2c3d4-e5f6-7890-abcd-ef1234567890 -> deadbeef-e29b-41d4-a716-446655440000 : "completes"
`,
  },
];

export function getExampleById(id: string): Example | undefined {
  return EXAMPLES.find(ex => ex.id === id);
}

export function getExamplesByCategory(
  category: Example['category']
): Example[] {
  return EXAMPLES.filter(ex => ex.category === category);
}

// Patch examples for Patch Editor. UUID set matches "UUID IDs" canvas example.
export interface PatchExample {
  id: string;
  name: string;
  description: string;
  patchDsl: string;
}

export const PATCH_EXAMPLES: PatchExample[] = [
  {
    id: 'patch-basic',
    name: 'Basic',
    description:
      'start, process, newNode (use with Basic Flow / Custom Properties)',
    patchDsl: `@update start { color: blue }
@update process { content: "# Updated Content" }
@add [shape:newNode] "New Node" { color: purple }
@connect process -> newNode : "connects to"
@move newNode { x: 300, y: 200 }
`,
  },
  {
    id: 'patch-uuid',
    name: 'UUID',
    description: 'UUID node ids (use with "UUID IDs" example)',
    patchDsl: `@update 550e8400-e29b-41d4-a716-446655440000 { color: blue }
@update a1b2c3d4-e5f6-7890-abcd-ef1234567890 { content: "# Updated" }
@add [shape:cafebabe-e29b-41d4-a716-446655440000] "New Node" { color: purple }
@connect a1b2c3d4-e5f6-7890-abcd-ef1234567890 -> cafebabe-e29b-41d4-a716-446655440000 : "connects"
@move cafebabe-e29b-41d4-a716-446655440000 { x: 300, y: 200 }
`,
  },
  {
    id: 'patch-tiptap',
    name: 'TipTap',
    description:
      'Markdown → TipTap JSON via transformUpdateNode (use with Basic Flow)',
    patchDsl: `@update process { content: "# Updated section\\n\\nThis content is converted to **TipTap** JSON when you apply the patch. Check the **Data** tab to see \`contentJson\`." }
@update start { color: blue }
`,
  },
];
