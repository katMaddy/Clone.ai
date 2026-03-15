# DevForge - AI-Powered Code Workspace

## Project Overview

**Project Name:** DevForge  
**Type:** Web Application (Next.js)  
**Core Functionality:** A unified development environment combining a powerful code editor (Monaco), AI assistant for code help, and task/project management - inspired by Replit, Taskade, and Kilo.  
**Target Users:** Developers seeking an all-in-one coding workspace with AI assistance.

---

## UI/UX Specification

### Layout Structure

**Main Layout (3-panel design):**
- **Left Sidebar** (280px): File explorer + Task list (collapsible)
- **Main Content** (flexible): Monaco code editor
- **Right Panel** (360px, collapsible): AI Assistant chat

**Header:** 48px height with project name, run button, settings

**Responsive Breakpoints:**
- Desktop: Full 3-panel layout
- Tablet (< 1024px): Collapsible sidebars with toggle buttons
- Mobile (< 768px): Single panel view with bottom navigation

### Visual Design

**Color Palette (Dark Theme - IDE aesthetic):**
- Background Primary: `#0d1117` (deep dark)
- Background Secondary: `#161b22` (panels)
- Background Tertiary: `#21262d` (elevated elements)
- Border: `#30363d`
- Text Primary: `#e6edf3`
- Text Secondary: `#8b949e`
- Accent Primary: `#58a6ff` (blue - links, focus)
- Accent Success: `#3fb950` (green - run, success)
- Accent Warning: `#d29922` (yellow)
- Accent Danger: `#f85149` (red - errors)
- AI Accent: `#a371f7` (purple - AI elements)

**Typography:**
- Font Family (UI): `"IBM Plex Sans", system-ui, sans-serif`
- Font Family (Code): `"JetBrains Mono", "Fira Code", monospace`
- Heading (H1): 24px, weight 600
- Heading (H2): 18px, weight 600
- Body: 14px, weight 400
- Code: 13px
- Small/Labels: 12px

**Spacing System:**
- Base unit: 4px
- xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px, 2xl: 32px

**Visual Effects:**
- Panel shadows: `0 8px 24px rgba(0,0,0,0.4)`
- Hover transitions: 150ms ease
- Button hover: brightness increase + subtle scale
- Focus rings: 2px solid accent with 2px offset
- Scrollbars: Custom styled, thin (8px), matching theme

### Components

**1. Header Bar**
- Logo/Project name (left)
- Run button (green, with keyboard shortcut hint Ctrl+Enter)
- Language selector dropdown
- Settings gear icon
- User avatar (right)

**2. Left Sidebar (Tabbed)**
- Tab 1: Files
  - File tree with folders/files
  - Add file/folder buttons
  - File icons based on extension
- Tab 2: Tasks
  - Task list with checkboxes
  - Add task input
  - Priority indicators (colored dots)
  - Due date display

**3. Code Editor (Monaco)**
- VS Code dark theme
- Line numbers
- Minimap (right side)
- Tab bar for open files
- Status bar (bottom): Line/Column, Language, Encoding

**4. AI Assistant Panel**
- Chat header with "Ask DevForge AI" title
- Message bubbles (user vs AI differentiated)
- Code block syntax highlighting
- Input field with send button
- Suggested prompts below input

**5. Context Menus & Modals**
- Right-click file context menu
- Settings modal
- Keyboard shortcuts help modal

---

## Functionality Specification

### Core Features

**1. Code Editor**
- Monaco Editor integration
- Multi-file support with tabs
- Syntax highlighting for: JavaScript, TypeScript, Python, HTML, CSS, JSON, Markdown
- Auto-completion
- Error highlighting
- Find/Replace (Ctrl+F, Ctrl+H)
- Multiple cursor support
- Code folding

**2. File System (In-Memory)**
- Create new files/folders
- Rename files
- Delete files
- File tree navigation
- Persist to localStorage

**3. Task Management**
- Create tasks with title
- Mark complete/incomplete
- Delete tasks
- Priority levels: Low (gray), Medium (yellow), High (red)
- Filter: All, Active, Completed
- Persist to localStorage

**4. AI Assistant**
- Send messages to AI
- Receive code explanations
- Get code suggestions
- Clear chat history
- Simulated AI responses (for demo)

**5. Run Code**
- Execute JavaScript in sandbox
- Display output in console panel
- Show errors

### User Interactions

- Click file to open in editor
- Double-click folder to expand/collapse
- Drag files (visual only for now)
- Click task checkbox to toggle
- Type in AI input and press Enter or click Send
- Keyboard shortcuts displayed in tooltips

### Data Handling

- All data persisted to localStorage
- Structure:
  ```json
  {
    "devforge_files": [...],
    "devforge_tasks": [...],
    "devforge_chat": [...],
    "devforge_settings": {...}
  }
  ```

### Edge Cases

- Empty file tree: Show "No files yet" placeholder
- Empty task list: Show "No tasks yet" placeholder
- Long file names: Truncate with ellipsis
- Large code files: Monaco handles efficiently
- Network offline: AI shows offline message
- Invalid code execution: Catch errors, display in console

---

## Acceptance Criteria

1. ✅ Three-panel layout renders correctly
2. ✅ Monaco editor loads with syntax highlighting
3. ✅ Files can be created, renamed, deleted in file tree
4. ✅ Tasks can be added, checked, deleted
5. ✅ AI panel accepts input and shows responses
6. ✅ Run button executes JavaScript code
7. ✅ All data persists across page refresh
8. ✅ Responsive layout works on smaller screens
9. ✅ Keyboard shortcuts function (Ctrl+S, Ctrl+F, etc.)
10. ✅ No console errors on load
