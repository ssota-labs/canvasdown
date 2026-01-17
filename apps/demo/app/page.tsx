'use client';

import { useState } from 'react';
import { CanvasdownDemo } from '@/components/canvasdown-demo';

const DEFAULT_DSL = `canvas LR

@schema category {
  type: select,
  options: ["tutorial", "demo", "reference"]
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
`;

export default function Home() {
  const [dsl, setDsl] = useState(DEFAULT_DSL);

  return (
    <div className="w-screen h-screen flex">
      <CanvasdownDemo dsl={dsl} onDslChange={setDsl} />
    </div>
  );
}
