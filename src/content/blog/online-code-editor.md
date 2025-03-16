---
title: 'Online Code Editor'
description: 'a simple online code editor which can compile and run typescript code.'
pubDate: 'Jan 15 2025'
heroImage: '/images/online-editor-cover.jpg'
slug: 'online-code-editor'
---

Introducing my **Online Code Editor** (v1.0) a simple online code editor which can compile and run typescript code!

<button href="/code" className="bg-blue-500 hover:bg-blue-400 hover:underline w-full py-4 rounded-xl text-white">Click to open online text editor!</button>

### Technical Overview

The code editor appears to be a custom React-based implementation that likely provides in-browser code editing capabilities. It's built using TypeScript and seems to handle several key features:

### Core Components

- `Code.tsx`: Main editor component
- `useSyntax.ts`: Custom hook for syntax handling

### Key Features

1. **Selection Management**

   - Tracks cursor position and text selection
   - Handles range selection with `Selection` API
   - Includes safety checks for editor reference and anchor nodes

2. **Text Content Handling**

   - Manages code content through `innerText`
   - Tracks total text length and code length separately
   - Includes debug logging for content management

3. **Client-Side Rendering**
   - Uses `prerender = false` flag, indicating it's meant to run purely on the client side
   - This makes sense for a code editor as it needs direct DOM access

### Technical Implementation Notes

- Uses React refs (`editorRef`) to maintain direct DOM access
- Implements selection range management for cursor positioning
- Includes debug logging with '[caret]' prefix for tracking selection and content states

Note: This is still a work in progress and is mainly just an exploration of how to implement an online code editor with React, HTML, CSS and Tailwind. The hardest part was handling the text selection along with copy / paste.

### What's next?

Note this is still a work in progress and mainly just something I wanted to build for myself. At some point I'll add some more quality of life features like syntax highlighting, auto-completion, and more. Either way, this was a fun project to build and I'm glad I was able to share it with you all!
