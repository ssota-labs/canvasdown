# Canvasdown Demo

**Next.js 16 + shadcn/ui demo application** showcasing Canvasdown DSL capabilities.

## Overview

This is a Next.js 16 App Router implementation of the Canvasdown examples app, using shadcn/ui components for a modern, accessible UI.

## Features

- **DSL Editor** — Edit Canvasdown DSL in real-time with shadcn Textarea
- **Patch DSL Editor** — Apply incremental updates with Patch commands
- **Live Preview** — See parsed DSL rendered as React Flow diagram
- **Block Types** — Examples of custom block components (Shape, Markdown, Image, YouTube)
- **Modern UI** — Built with shadcn/ui components and Tailwind CSS

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

Open `http://localhost:3000` in your browser.

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Tech Stack

- **Next.js 16** — App Router
- **React 19** — UI library
- **shadcn/ui** — Component library
- **Tailwind CSS** — Styling
- **@canvasdown/core** — DSL parser
- **@canvasdown/react-flow** — React Flow adapter
- **@xyflow/react** — React Flow rendering

## Project Structure

```
examples-next/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles + Tailwind
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── blocks/             # Block components
│   ├── canvas-preview.tsx  # React Flow canvas
│   ├── dsl-editor.tsx      # DSL editor
│   ├── patch-editor.tsx    # Patch editor
│   └── canvasdown-demo.tsx # Main demo component
├── hooks/
│   └── use-connected-handles.ts
├── lib/
│   ├── utils.ts
│   └── register-block-types.ts
└── components.json         # shadcn config
```

## Differences from Vite Version

- **Framework**: Vite → Next.js 16 App Router
- **Styling**: Inline styles → Tailwind CSS + shadcn components
- **Components**: Custom divs → shadcn/ui components (Card, Tabs, Textarea, Button, Alert)
- **Build**: Vite → Next.js build system
- **Client Components**: Uses `'use client'` directives

## License

MIT
