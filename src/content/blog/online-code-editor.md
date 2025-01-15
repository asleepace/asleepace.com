---
title: 'Online Code Editor'
description: 'a simple online code editor which can compile and run typescript code.'
pubDate: 'Jan 15 2025'
heroImage: '/images/online-editor-cover.jpg'
slug: 'online-code-editor'
---

Introducing my **Online Code Editor** (v1.0) a simple online code editor which can compile and run typescript code!

<h3 style="text-align: center; color: white; background-color: #222432; padding: 10px; border-radius: 16px;"><a alt="Code Editor" style="color: white;" href="/code"> Click here to try it out!</a></h3>

## Technical Overview

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

Note: This appears to be a custom implementation rather than using existing libraries like Monaco or CodeMirror. Without more context, it's difficult to determine the full feature set, but the code suggests it handles basic editor functionality with custom selection and syntax management.

### What's next?

Note this is still a work in progress and mainly just something I wanted to build for myself. At some point I'll add some more quality of life features like syntax highlighting, auto-completion, and more. Either way, this was a fun project to build and I'm glad I was able to share it with you all!
