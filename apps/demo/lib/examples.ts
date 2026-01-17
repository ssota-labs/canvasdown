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
];

export function getExampleById(id: string): Example | undefined {
  return EXAMPLES.find(ex => ex.id === id);
}

export function getExamplesByCategory(
  category: Example['category']
): Example[] {
  return EXAMPLES.filter(ex => ex.category === category);
}
