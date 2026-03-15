# Duplit - The Ultimate AI-Powered Development OS

## Project Overview

**Project Name:** Duplit  
**Type:** Web Application (Next.js) - AI Development Operating System  
**Core Functionality:** A futuristic, glassmorphic AI-powered development environment that combines the best of Replit, GitHub, Kilo, Taskade, and Loveable. Features AI agents that automate everything, works online/offline, and provides zero-code experience.  
**Target Users:** Zero-code users, developers, and anyone who wants to build applications without touching code.

---

## Visual Design - Sci-Fi Glassmorphism OS

### Color Palette

**Base Colors (Dark Sci-Fi):**
- Background Deep: `#0a0a0f`
- Background Mid: `#12121a`
- Glass Primary: `rgba(255, 255, 255, 0.06)`
- Glass Secondary: `rgba(255, 255, 255, 0.1)`
- Glass Tertiary: `rgba(255, 255, 255, 0.15)`
- Glass Border: `rgba(255, 255, 255, 0.12)`

**Accent Colors (Neon/Cyberpunk):**
- Cyan Neon: `#00f0ff`
- Magenta Neon: `#ff00aa`
- Purple Neon: `#8b5cf6`
- Green Neon: `#10b981`
- Yellow Neon: `#fbbf24`
- Orange Neon: `#f97316`

**Text Colors:**
- Text Primary: `rgba(255, 255, 255, 0.95)`
- Text Secondary: `rgba(255, 255, 255, 0.7)`
- Text Muted: `rgba(255, 255, 255, 0.5)`
- Text Cyan: `#00f0ff`

### Glassmorphism Effects

1. **Panels:** `backdrop-filter: blur(24px); background: rgba(255,255,255,0.08);`
2. **Cards:** Gradient overlays with shimmer animation
3. **Borders:** 1px solid with gradient glow
4. **Shadows:** Multi-layer colored glows

### Animated Background

- Floating holographic orbs (cyan, magenta, purple)
- Particle field (subtle dots)
- Grid pattern (very subtle)
- Scanline effect (optional)
- Smooth transitions between colors

### Shiny Cards

- Diagonal gradient overlay
- Animated light sweep effect
- Reflection on hover
- Glow intensifies on interaction

---

## Layout Structure

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Ultra | >1920px | Full 4-panel + dock |
| Desktop | 1200-1920px | 3-panel + dock |
| Tablet | 768-1199px | 2-panel, collapsible |
| Mobile | <768px | Single panel + bottom nav |

### OS Detection Features

- Detect OS (Windows, macOS, Linux, iOS, Android)
- Adjust UI for touch vs mouse
- Show OS-appropriate keyboard shortcuts
- Adaptive panel positions

### Main Layout Areas

1. **Top Bar** (48px): Menu, search, user
2. **Left Sidebar** (280px): Files, Tasks, GitHub, Extensions
3. **Main Area**: Editor + Console + Chat
4. **Right Panel** (360px): AI Assistant / GitHub
5. **Bottom Dock** (64px): App launcher
6. **Chat Overlay**: Above dock, Replit-style

---

## Core Features (Lego Blocks)

### 1. Code Editor Module
- Monaco Editor with custom themes
- Multi-file tabs
- Syntax highlighting (all languages)
- Auto-complete
- Error detection
- Code formatting

### 2. File System Module
- Virtual file tree
- Create/rename/delete files
- Drag & drop (visual)
- File icons by type

### 3. Task Manager Module
- Create tasks
- Set priorities (Low/Medium/High)
- Due dates
- Kanban view
- AI task generation

### 4. GitHub Integration Module
- Clone repos (simulated)
- View files
- Commit history
- Branch selector
- Issues view

### 5. AI Agent Module
- Code generation
- Bug fixing
- Code explanation
- Optimization suggestions
- Natural language commands

### 6. Chat Interface Module
- Replit-style chat
- Code execution results
- Collaboration indicators
- Voice-ready UI

### 7. Extensions Module
- Extension marketplace UI
- Installed extensions
- Enable/disable toggles

### 8. Settings Module
- Theme selection
- Keybindings
- AI preferences
- Account settings
- Integrations management

---

## AI Agents System

### Agent Types

1. **Code Agent**: Generates, fixes, optimizes code
2. **Task Agent**: Creates and manages tasks
3. **GitHub Agent**: Handles Git operations
4. **Design Agent**: Suggests UI improvements
5. **Research Agent**: Finds solutions

### Automation Features

- Auto-detect user intent
- Suggest next actions
- One-click integrations
- Background processing
- Progress notifications

---

## Integration System

### Connect Services (One-Click)

- GitHub
- GitLab
- Vercel
- Netlify
- OpenAI
- Anthropic
- Local LLM (Ollama)

### OAuth Flow (Simulated)

1. User clicks "Connect GitHub"
2. Modal shows "Authorize Duplit"
3. User clicks "Allow"
4. AI agent auto-configures
5. Ready to use

---

## Acceptance Criteria

1. ✅ Glassmorphism UI with blur effects
2. ✅ Animated background with floating orbs
3. ✅ Shiny cards with light sweep animation
4. ✅ Auto-detect OS and adjust UI
5. ✅ Auto-detect screen size, responsive layout
6. ✅ Top menu bar with hamburger
7. ✅ Bottom dock (macOS style)
8. ✅ Chat box above dock
9. ✅ All lego block modules present
10. ✅ AI agents panel with automation suggestions
11. ✅ Integration connection UI (one-click)
12. ✅ Works offline (localStorage)
13. ✅ No console errors
