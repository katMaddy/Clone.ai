"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  language?: string;
  children?: FileItem[];
  isOpen?: boolean;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: Date;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Integration {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  color: string;
}

interface Agent {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: "idle" | "working" | "ready";
}

const defaultFiles: FileItem[] = [
  {
    id: "1",
    name: "src",
    type: "folder",
    isOpen: true,
    children: [
      {
        id: "2",
        name: "app.js",
        type: "file",
        language: "javascript",
        content: `// Welcome to Duplit!
// Your AI-Powered Development OS

function greet(name) {
  return \`Hello, \${name}! Welcome to Duplit.\`;
}

const app = {
  name: "Duplit",
  version: "1.0.0",
  features: ["AI Code", "GitHub", "Tasks", "Extensions"],
  init: () => {
    console.log(\`\${app.name} v\${app.version} initialized!\`);
    console.log("Features:", app.features.join(", "));
  }
};

app.init();
console.log(greet("Developer"));`,
      },
      {
        id: "3",
        name: "utils.js",
        type: "file",
        language: "javascript",
        content: `// Utility functions for Duplit

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 11);
};`,
      },
      {
        id: "4",
        name: "styles.css",
        type: "file",
        language: "css",
        content: `/* Duplit Styles */

:root {
  --primary: #00f0ff;
  --secondary: #8b5cf6;
  --background: #0a0a0f;
}

body {
  font-family: system-ui, sans-serif;
  background: var(--background);
  color: white;
  margin: 0;
  padding: 20px;
}

.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}`,
      },
    ],
  },
  {
    id: "5",
    name: "package.json",
    type: "file",
    language: "json",
    content: `{
  "name": "duplit-project",
  "version": "1.0.0",
  "description": "AI-Powered Development OS",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "node src/app.js"
  },
  "dependencies": {}
}`,
  },
  {
    id: "6",
    name: "README.md",
    type: "file",
    language: "markdown",
    content: `# Duplit Project

Welcome to your AI-powered development environment!

## Features

- **AI Code Assistant** - Generate, debug, and optimize code
- **GitHub Integration** - Clone, push, pull seamlessly
- **Task Management** - Kanban boards with AI automation
- **Extensions** - Customize your workflow
- **Offline Mode** - Works without internet

## Getting Started

1. Create new files in the explorer
2. Write code in the editor
3. Click Run to execute
4. Ask AI for help in the chat

## AI Agents

Duplit has intelligent agents that can:
- Write code for you
- Debug issues
- Explain concepts
- Optimize performance
- Manage tasks`,
  },
];

const defaultTasks: Task[] = [
  { id: "1", title: "Set up project structure", completed: true, priority: "high", createdAt: new Date() },
  { id: "2", title: "Implement user authentication", completed: false, priority: "high", createdAt: new Date() },
  { id: "3", title: "Add glassmorphism UI", completed: false, priority: "medium", createdAt: new Date() },
  { id: "4", title: "Integrate GitHub API", completed: false, priority: "medium", createdAt: new Date() },
  { id: "5", title: "Write documentation", completed: false, priority: "low", createdAt: new Date() },
];

const integrationsList: Integration[] = [
  { id: "github", name: "GitHub", icon: "🐙", connected: false, color: "#ffffff" },
  { id: "vercel", name: "Vercel", icon: "▲", connected: false, color: "#ffffff" },
  { id: "netlify", name: "Netlify", icon: "⚡", connected: false, color: "#00f0ff" },
  { id: "openai", name: "OpenAI", icon: "🧠", connected: false, color: "#10b981" },
  { id: "anthropic", name: "Anthropic", icon: "🧬", connected: false, color: "#8b5cf6" },
  { id: "ollama", name: "Local LLM", icon: "💻", connected: false, color: "#ff00aa" },
];

const agentsList: Agent[] = [
  { id: "code", name: "Code Agent", icon: "⚡", description: "Generates and fixes code", status: "ready" },
  { id: "task", name: "Task Agent", icon: "📋", description: "Manages your tasks", status: "ready" },
  { id: "github", name: "GitHub Agent", icon: "🐙", description: "Handles git operations", status: "ready" },
  { id: "design", name: "Design Agent", icon: "🎨", description: "Suggests UI improvements", status: "idle" },
  { id: "research", name: "Research Agent", icon: "🔍", description: "Finds solutions", status: "idle" },
];

const fileIcons: Record<string, string> = {
  javascript: "JS",
  typescript: "TS",
  python: "PY",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  markdown: "MD",
  folder: "📁",
};

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

function detectOS(): string {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "windows";
  if (ua.includes("Mac")) return "macos";
  if (ua.includes("Linux")) return "linux";
  if (ua.includes("iPad") || ua.includes("iPhone")) return "ios";
  if (ua.includes("Android")) return "android";
  return "unknown";
}

function detectScreenSize(): string {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 480) return "mobile";
  if (width < 768) return "tablet";
  if (width < 1200) return "laptop";
  return "desktop";
}

export default function Duplit() {
  const [os, setOs] = useState("unknown");
  const [screenSize, setScreenSize] = useState("desktop");
  const [files, setFiles] = useState<FileItem[]>(defaultFiles);
  const [activeFileId, setActiveFileId] = useState<string>("2");
  const [openTabs, setOpenTabs] = useState<string[]>(["2"]);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "✨ Welcome to **Duplit** - Your AI Development OS!\n\nI'm here to help you build anything. Just tell me what you want to create!\n\nTry asking:\n• \"Build a todo app\"\n• \"Fix this bug\"\n• \"Explain this code\"\n• \"Deploy to Vercel\"",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [leftTab, setLeftTab] = useState<"files" | "tasks" | "github" | "extensions">("files");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [integrations, setIntegrations] = useState(integrationsList);
  const [agents, setAgents] = useState(agentsList);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOs(detectOS());
    setScreenSize(detectScreenSize());
    
    const handleResize = () => {
      setScreenSize(detectScreenSize());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const savedFiles = localStorage.getItem("duplit_files");
    const savedTasks = localStorage.getItem("duplit_tasks");
    const savedChat = localStorage.getItem("duplit_chat");
    const savedActiveFile = localStorage.getItem("duplit_activeFile");
    const savedOpenTabs = localStorage.getItem("duplit_openTabs");

    if (savedFiles) setFiles(JSON.parse(savedFiles));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedChat) setChatMessages(JSON.parse(savedChat));
    if (savedActiveFile) setActiveFileId(savedActiveFile);
    if (savedOpenTabs) setOpenTabs(JSON.parse(savedOpenTabs));
  }, []);

  useEffect(() => {
    localStorage.setItem("duplit_files", JSON.stringify(files));
    localStorage.setItem("duplit_tasks", JSON.stringify(tasks));
    localStorage.setItem("duplit_chat", JSON.stringify(chatMessages));
    localStorage.setItem("duplit_activeFile", activeFileId);
    localStorage.setItem("duplit_openTabs", JSON.stringify(openTabs));
  }, [files, tasks, chatMessages, activeFileId, openTabs]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const findFile = (items: FileItem[], id: string): FileItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findFile(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const activeFile = findFile(files, activeFileId);

  const handleFileClick = (file: FileItem) => {
    if (file.type === "folder") {
      const updateFiles = (items: FileItem[]): FileItem[] =>
        items.map((item) => {
          if (item.id === file.id) {
            return { ...item, isOpen: !item.isOpen };
          }
          if (item.children) {
            return { ...item, children: updateFiles(item.children) };
          }
          return item;
        });
      setFiles(updateFiles(files));
    } else {
      setActiveFileId(file.id);
      if (!openTabs.includes(file.id)) {
        setOpenTabs([...openTabs, file.id]);
      }
    }
  };

  const handleTabClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newTabs = openTabs.filter((tabId) => tabId !== id);
    setOpenTabs(newTabs);
    if (activeFileId === id && newTabs.length > 0) {
      setActiveFileId(newTabs[newTabs.length - 1]);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!value || !activeFile) return;
    const updateFiles = (items: FileItem[]): FileItem[] =>
      items.map((item) => {
        if (item.id === activeFileId) {
          return { ...item, content: value };
        }
        if (item.children) {
          return { ...item, children: updateFiles(item.children) };
        }
        return item;
      });
    setFiles(updateFiles(files));
  };

  const handleAddFile = (parentId: string | null = null) => {
    const newFile: FileItem = {
      id: generateId(),
      name: `new-file.${activeFile?.language || "js"}`,
      type: "file",
      language: activeFile?.language || "javascript",
      content: "// New file\n",
    };

    if (!parentId) {
      setFiles([...files, newFile]);
    } else {
      const addToParent = (items: FileItem[]): FileItem[] =>
        items.map((item) => {
          if (item.id === parentId && item.type === "folder") {
            return { ...item, children: [...(item.children || []), newFile], isOpen: true };
          }
          if (item.children) {
            return { ...item, children: addToParent(item.children) };
          }
          return item;
        });
      setFiles(addToParent(files));
    }
    setActiveFileId(newFile.id);
    setOpenTabs([...openTabs, newFile.id]);
  };

  const handleDeleteFile = (id: string) => {
    const deleteFromTree = (items: FileItem[]): FileItem[] =>
      items
        .filter((item) => item.id !== id)
        .map((item) => {
          if (item.children) {
            return { ...item, children: deleteFromTree(item.children) };
          }
          return item;
        });
    setFiles(deleteFromTree(files));
    if (openTabs.includes(id)) {
      const newTabs = openTabs.filter((tabId) => tabId !== id);
      setOpenTabs(newTabs);
      if (activeFileId === id && newTabs.length > 0) {
        setActiveFileId(newTabs[newTabs.length - 1]);
      }
    }
  };

  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    const newTask: Task = {
      id: generateId(),
      title: taskInput.trim(),
      completed: false,
      priority: "medium",
      createdAt: new Date(),
    };
    setTasks([...tasks, newTask]);
    setTaskInput("");
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handlePriorityChange = (id: string, priority: Task["priority"]) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, priority } : t)));
  };

  const runCode = useCallback(() => {
    if (!activeFile || activeFile.language !== "javascript") {
      setConsoleOutput([`❌ Error: Only JavaScript files can be executed`]);
      return;
    }
    setConsoleOutput([`▶ Running ${activeFile.name}...`]);

    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args) => {
      logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" "));
    };

    try {
      const result = eval(activeFile.content || "");
      if (result !== undefined) {
        logs.push(`=> ${result}`);
      }
      setConsoleOutput((prev) => [...prev, ...logs, "✅ Done"]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setConsoleOutput((prev) => [...prev, `❌ Error: ${errorMessage}`]);
    }

    console.log = originalLog;
    setConsoleCollapsed(false);
  }, [activeFile]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        `I'd be happy to help! Here's a code example:\n\n\`\`\`javascript\n// Your solution:\nfunction solution() {\n  // Implementation here\n  return true;\n}\n\`\`\``,
        `Great question! In ${activeFile?.language || "JavaScript"}, you can use async/await:\n\n\`\`\`javascript\nasync function fetchData() {\n  try {\n    const response = await fetch('/api/data');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}\n\`\`\``,
        `I can automate that for you! Here's what I'll do:\n\n1. ✨ Generate the code\n2. 🐛 Check for bugs\n3. ⚡ Optimize performance\n\nWould you like me to proceed?`,
        `That's a common pattern! Here's the best approach:\n\n\`\`\`javascript\n// Modern JavaScript pattern\nconst handler = async (event) => {\n  event.preventDefault();\n  // Your logic here\n};\n\`\`\`\n\nWant me to explain more?`,
      ];

      const aiResponse: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleConnectIntegration = (id: string) => {
    setIntegrations(
      integrations.map((int) =>
        int.id === id ? { ...int, connected: !int.connected } : int
      )
    );
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        <div
          className={`file-item ${item.id === activeFileId ? "active" : ""}`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => handleFileClick(item)}
        >
          <span className="file-icon">{fileIcons[item.type] || fileIcons[item.language || "javascript"]}</span>
          <span className="file-name">{item.name}</span>
          {item.type === "file" && (
            <button
              className="file-delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFile(item.id);
              }}
            >
              ×
            </button>
          )}
        </div>
        {item.type === "folder" && item.isOpen && item.children && (
          <div className="file-children">{renderFileTree(item.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  const isMobile = screenSize === "mobile";
  const isTablet = screenSize === "tablet";

  return (
    <div className="duplit-app">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="particles"></div>
      </div>

      {/* Top Menu Bar */}
      <header className="top-bar glass-panel">
        <div className="top-bar-left">
          <button className="icon-btn menu-btn" title="Menu">
            <span>≡</span>
          </button>
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">Duplit</span>
            <span className="badge badge-cyan">AI OS</span>
          </div>
          <div className="project-name dropdown">
            <span className="project-dropdown-btn">
              my-project <span className="dropdown-arrow">▾</span>
            </span>
            <div className="dropdown-menu">
              <div className="dropdown-item">📁 New Project</div>
              <div className="dropdown-item">📂 Open Project</div>
              <div className="dropdown-item">📥 Clone Repository</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item">⚙ Project Settings</div>
            </div>
          </div>
        </div>

        <div className="top-bar-center">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="glass-input search-input"
              placeholder="Search files, commands, or ask AI..."
            />
            <span className="search-shortcut">⌘K</span>
          </div>
        </div>

        <div className="top-bar-right">
          <div className="os-indicator" data-os={os}>
            {os === "windows" && "🪟 Windows"}
            {os === "macos" && "🍎 macOS"}
            {os === "linux" && "🐧 Linux"}
            {os === "ios" && "📱 iOS"}
            {os === "android" && "🤖 Android"}
            {os === "unknown" && "🖥"}
          </div>
          <button className="icon-btn" title="GitHub" onClick={() => setLeftTab("github")}>
            <span>🐙</span>
          </button>
          <button className="icon-btn" title="Extensions" onClick={() => setLeftTab("extensions")}>
            <span>🧩</span>
          </button>
          <button className="icon-btn" title="Settings" onClick={() => setShowSettings(!showSettings)}>
            <span>⚙</span>
          </button>
          <div className="avatar">D</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Sidebar */}
        {!leftSidebarCollapsed && (
          <aside className={`left-sidebar glass-panel ${isMobile ? "mobile-sidebar" : ""}`}>
            <div className="sidebar-tabs">
              {["files", "tasks", "github", "extensions"].map((tab) => (
                <button
                  key={tab}
                  className={`glass-tab ${leftTab === tab ? "active" : ""}`}
                  onClick={() => setLeftTab(tab as typeof leftTab)}
                >
                  {tab === "files" && "📁"}
                  {tab === "tasks" && "📋"}
                  {tab === "github" && "🐙"}
                  {tab === "extensions" && "🧩"}
                </button>
              ))}
            </div>

            <div className="sidebar-content">
              {leftTab === "files" && (
                <>
                  <div className="sidebar-header">
                    <span>Explorer</span>
                    <button className="icon-btn" onClick={() => handleAddFile(null)} title="New file">
                      <span>+</span>
                    </button>
                  </div>
                  <div className="file-tree">{renderFileTree(files)}</div>
                </>
              )}

              {leftTab === "tasks" && (
                <>
                  <div className="task-input-wrapper">
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="Add a task..."
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                    />
                    <button className="glow-btn" onClick={handleAddTask}>+</button>
                  </div>
                  <div className="task-list">
                    {tasks.map((task) => (
                      <div key={task.id} className={`task-card shiny-card ${task.completed ? "completed" : ""}`}>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(task.id)}
                        />
                        <span className="task-title">{task.title}</span>
                        <select
                          className={`priority-select priority-${task.priority}`}
                          value={task.priority}
                          onChange={(e) => handlePriorityChange(task.id, e.target.value as Task["priority"])}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <button className="icon-btn" onClick={() => handleDeleteTask(task.id)}>×</button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {leftTab === "github" && (
                <div className="github-panel">
                  <div className="section-title">GitHub</div>
                  <div className="github-status">
                    <span className="status-dot status-offline"></span>
                    <span>Not connected</span>
                  </div>
                  <button className="glow-btn glow-btn-magenta" onClick={() => setShowIntegrationModal(true)}>
                    Connect GitHub
                  </button>
                  <div className="github-actions">
                    <div className="action-item">📥 Clone Repo</div>
                    <div className="action-item">📤 Push Changes</div>
                    <div className="action-item">📋 Pull Request</div>
                    <div className="action-item">🐛 Issues</div>
                  </div>
                </div>
              )}

              {leftTab === "extensions" && (
                <div className="extensions-panel">
                  <div className="section-title">AI Agents</div>
                  <div className="agents-list">
                    {agents.map((agent) => (
                      <div key={agent.id} className="agent-card shiny-card">
                        <div className="agent-icon">{agent.icon}</div>
                        <div className="agent-info">
                          <div className="agent-name">{agent.name}</div>
                          <div className="agent-desc">{agent.description}</div>
                        </div>
                        <div className={`agent-status status-${agent.status}`}>
                          {agent.status === "ready" && "●"}
                          {agent.status === "working" && "◐"}
                          {agent.status === "idle" && "○"}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="section-title" style={{ marginTop: 24 }}>Integrations</div>
                  <div className="integrations-list">
                    {integrations.map((int) => (
                      <div key={int.id} className="integration-item">
                        <span className="integration-icon">{int.icon}</span>
                        <span className="integration-name">{int.name}</span>
                        <button
                          className={`toggle ${int.connected ? "active" : ""}`}
                          onClick={() => handleConnectIntegration(int.id)}
                        ></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Editor Area */}
        <div className="editor-area">
          <div className="tab-bar">
            {openTabs.map((tabId) => {
              const file = findFile(files, tabId);
              if (!file) return null;
              return (
                <div
                  key={tabId}
                  className={`tab ${tabId === activeFileId ? "active" : ""}`}
                  onClick={() => setActiveFileId(tabId)}
                >
                  <span className="tab-icon">{fileIcons[file.language || "javascript"]}</span>
                  <span className="tab-name">{file.name}</span>
                  <button className="tab-close" onClick={(e) => handleTabClose(e, tabId)}>×</button>
                </div>
              );
            })}
            <button className="tab add-tab" onClick={() => handleAddFile(null)}>+</button>
          </div>

          <div className="editor-container">
            {activeFile ? (
              <Editor
                height="100%"
                language={activeFile.language || "javascript"}
                theme="vs-dark"
                value={activeFile.content || ""}
                onChange={handleCodeChange}
                options={{
                  fontSize: 14,
                  fontFamily: "var(--font-mono)",
                  minimap: { enabled: !isMobile },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16 },
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  tabSize: 2,
                  wordWrap: "on",
                }}
              />
            ) : (
              <div className="empty-editor">
                <div className="empty-icon">◈</div>
                <p>No file selected</p>
                <p className="hint">Select a file or create a new one</p>
              </div>
            )}
          </div>

          {/* Console */}
          <div className={`console glass-panel ${consoleCollapsed ? "collapsed" : ""}`}>
            <div className="console-header" onClick={() => setConsoleCollapsed(!consoleCollapsed)}>
              <span>Console</span>
              <button className="glow-btn" onClick={(e) => { e.stopPropagation(); runCode(); }}>
                ▶ Run
              </button>
            </div>
            {!consoleCollapsed && (
              <div className="console-output" ref={consoleRef}>
                {consoleOutput.length === 0 ? (
                  <span className="console-empty">Click Run to execute your code</span>
                ) : (
                  consoleOutput.map((line, i) => (
                    <div key={i} className={`console-line ${line.startsWith("❌") ? "error" : ""} ${line.startsWith("✅") ? "success" : ""}`}>
                      {line}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Chat */}
        {!rightPanelCollapsed && (
          <aside className="right-sidebar glass-panel">
            <div className="ai-header">
              <div className="ai-title">
                <span className="ai-icon">🤖</span>
                <span>Duplit AI</span>
                <span className="badge badge-purple">Pro</span>
              </div>
              <button className="icon-btn" onClick={() => setChatMessages([chatMessages[0]])}>🗑</button>
            </div>

            <div className="chat-messages">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.role}`}>
                  <div className="message-avatar">{msg.role === "user" ? "👤" : "◈"}</div>
                  <div className="message-content">
                    <div className="message-text">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-message assistant">
                  <div className="message-avatar">◈</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-wrapper">
              <textarea
                className="glass-input chat-input"
                placeholder="Ask AI anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
              />
              <button className="glow-btn" onClick={sendMessage} disabled={!chatInput.trim()}>
                ➤
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Toggle Buttons */}
      <button className="panel-toggle left-toggle" onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}>
        {leftSidebarCollapsed ? "▶" : "◀"}
      </button>
      <button className="panel-toggle right-toggle" onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}>
        {rightPanelCollapsed ? "◀" : "▶"}
      </button>

      {/* Bottom Dock */}
      <div className="dock">
        <button className="dock-item" title="Files">
          <span>📁</span>
        </button>
        <button className="dock-item" title="Search">
          <span>🔍</span>
        </button>
        <button className="dock-item" title="GitHub">
          <span>🐙</span>
        </button>
        <div className="dock-separator"></div>
        <button className="dock-item" title="Run" onClick={runCode}>
          <span>▶</span>
        </button>
        <button className="dock-item" title="Extensions">
          <span>🧩</span>
        </button>
        <div className="dock-separator"></div>
        <button 
          className={`dock-item ${showChat ? "active" : ""}`} 
          title="AI Chat"
          onClick={() => setShowChat(!showChat)}
        >
          <span>🤖</span>
        </button>
        <button className="dock-item" title="Settings">
          <span>⚙</span>
        </button>
      </div>

      {/* Chat Overlay (Above Dock - Replit Style) */}
      {showChat && (
        <div className="chat-overlay">
          <div className="chat-overlay-header" onClick={() => setShowChat(false)}>
            <span>🤖 Duplit AI</span>
            <span className="chat-toggle">▼</span>
          </div>
          <div className="chat-overlay-messages">
            {chatMessages.slice(-5).map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                <div className="message-avatar">{msg.role === "user" ? "👤" : "◈"}</div>
                <div className="message-text">{msg.content}</div>
              </div>
            ))}
          </div>
          <div className="chat-overlay-input">
            <input
              type="text"
              className="glass-input"
              placeholder="Ask AI..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                  setShowChat(false);
                }
              }}
            />
            <button className="glow-btn" onClick={() => { sendMessage(); setShowChat(false); }}>➤</button>
          </div>
        </div>
      )}

      {/* Integration Modal */}
      {showIntegrationModal && (
        <div className="modal-overlay" onClick={() => setShowIntegrationModal(false)}>
          <div className="modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect Integration</h2>
              <button className="icon-btn" onClick={() => setShowIntegrationModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>One-click connect! Just authorize and we&apos;ll auto-configure everything.</p>
              <div className="integrations-grid">
                {integrations.map((int) => (
                  <div
                    key={int.id}
                    className={`integration-card shiny-card ${int.connected ? "connected" : ""}`}
                    onClick={() => handleConnectIntegration(int.id)}
                  >
                    <span className="integration-icon-lg">{int.icon}</span>
                    <span className="integration-name">{int.name}</span>
                    {int.connected && <span className="badge badge-green">Connected</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .duplit-app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          position: relative;
        }

        /* Top Bar */
        .top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 52px;
          padding: 0 16px;
          margin: 8px;
          margin-bottom: 0;
          z-index: 100;
        }

        .top-bar-left, .top-bar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .top-bar-center {
          flex: 1;
          max-width: 500px;
          margin: 0 20px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 18px;
        }

        .logo-icon {
          font-size: 24px;
          color: var(--accent-cyan);
          text-shadow: 0 0 10px var(--accent-cyan);
        }

        .logo-text {
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .project-name {
          margin-left: 16px;
          padding: 6px 12px;
          background: var(--glass-primary);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 13px;
        }

        .dropdown-arrow {
          margin-left: 6px;
          opacity: 0.6;
        }

        .search-box {
          display: flex;
          align-items: center;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          font-size: 14px;
          opacity: 0.6;
        }

        .search-input {
          padding-left: 36px;
          padding-right: 50px;
        }

        .search-shortcut {
          position: absolute;
          right: 12px;
          font-size: 11px;
          padding: 2px 6px;
          background: var(--glass-secondary);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
        }

        /* Main Content */
        .main-content {
          display: flex;
          flex: 1;
          padding: 8px;
          gap: 8px;
          overflow: hidden;
        }

        /* Sidebars */
        .left-sidebar {
          width: 280px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .right-sidebar {
          width: 340px;
          display: flex;
          flex-direction: column;
        }

        .sidebar-tabs {
          display: flex;
          padding: 8px;
          gap: 4px;
          border-bottom: 1px solid var(--glass-border);
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }

        /* File Tree */
        .file-tree {
          margin-top: 8px;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .file-item:hover {
          background: var(--glass-secondary);
          color: var(--text-primary);
        }

        .file-item.active {
          background: var(--glass-tertiary);
          color: var(--accent-cyan);
        }

        .file-icon {
          font-size: 14px;
          flex-shrink: 0;
        }

        .file-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-delete {
          opacity: 0;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 16px;
          transition: opacity 0.15s;
        }

        .file-item:hover .file-delete {
          opacity: 1;
        }

        /* Tasks */
        .task-input-wrapper {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .task-input-wrapper .glass-input {
          flex: 1;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          font-size: 13px;
        }

        .task-card.completed .task-title {
          text-decoration: line-through;
          opacity: 0.6;
        }

        .task-title {
          flex: 1;
        }

        .priority-select {
          background: transparent;
          border: none;
          font-size: 11px;
          cursor: pointer;
        }

        .priority-low { color: var(--text-muted); }
        .priority-medium { color: var(--accent-yellow); }
        .priority-high { color: var(--accent-red); }

        /* GitHub */
        .github-panel, .extensions-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }

        .github-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .github-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .action-item {
          padding: 10px 12px;
          background: var(--glass-primary);
          border-radius: var(--radius-md);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-item:hover {
          background: var(--glass-secondary);
          color: var(--accent-cyan);
        }

        /* Agents */
        .agents-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .agent-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
        }

        .agent-icon {
          font-size: 24px;
        }

        .agent-info {
          flex: 1;
        }

        .agent-name {
          font-weight: 600;
          font-size: 13px;
        }

        .agent-desc {
          font-size: 11px;
          color: var(--text-muted);
        }

        .agent-status {
          font-size: 12px;
        }

        .agent-status.status-ready { color: var(--accent-green); }
        .agent-status.status-working { color: var(--accent-cyan); }
        .agent-status.status-idle { color: var(--text-muted); }

        /* Integrations */
        .integrations-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .integration-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: var(--glass-primary);
          border-radius: var(--radius-md);
          font-size: 13px;
        }

        .integration-name {
          flex: 1;
        }

        /* Editor Area */
        .editor-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        .tab-bar {
          display: flex;
          background: var(--glass-primary);
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          overflow-x: auto;
          border: 1px solid var(--glass-border);
          border-bottom: none;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: transparent;
          border-right: 1px solid var(--glass-border);
          cursor: pointer;
          font-size: 13px;
          color: var(--text-secondary);
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .tab:hover {
          background: var(--glass-secondary);
        }

        .tab.active {
          background: var(--bg-primary);
          color: var(--text-primary);
          border-bottom: 2px solid var(--accent-cyan);
        }

        .tab-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 14px;
          padding: 0 4px;
          margin-left: 4px;
          opacity: 0.6;
        }

        .tab-close:hover {
          opacity: 1;
          color: var(--text-primary);
        }

        .add-tab {
          padding: 10px 16px;
          color: var(--text-muted);
        }

        .editor-container {
          flex: 1;
          overflow: hidden;
          background: var(--bg-deep);
          border: 1px solid var(--glass-border);
          border-top: none;
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
        }

        .empty-editor {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-secondary);
        }

        .empty-icon {
          font-size: 48px;
          color: var(--accent-cyan);
          opacity: 0.3;
          margin-bottom: 16px;
        }

        .hint {
          font-size: 13px;
          opacity: 0.6;
        }

        /* Console */
        .console {
          margin-top: 8px;
          max-height: 180px;
          border-radius: var(--radius-lg);
        }

        .console.collapsed {
          max-height: 40px;
        }

        .console-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }

        .console-output {
          flex: 1;
          overflow-y: auto;
          padding: 12px 16px;
          font-family: var(--font-mono);
          font-size: 13px;
          max-height: 120px;
        }

        .console-empty {
          color: var(--text-muted);
        }

        .console-line {
          padding: 4px 0;
          color: var(--text-secondary);
        }

        .console-line.error {
          color: var(--accent-red);
        }

        .console-line.success {
          color: var(--accent-green);
        }

        /* AI Chat */
        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--glass-border);
        }

        .ai-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
        }

        .ai-icon {
          font-size: 18px;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chat-message {
          display: flex;
          gap: 12px;
        }

        .chat-message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--glass-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .chat-message.assistant .message-avatar {
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
        }

        .message-content {
          max-width: 85%;
        }

        .message-text {
          padding: 10px 14px;
          border-radius: var(--radius-lg);
          font-size: 13px;
          line-height: 1.5;
          white-space: pre-wrap;
          background: var(--glass-primary);
        }

        .chat-message.user .message-text {
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
          color: white;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: var(--accent-cyan);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .chat-input-wrapper {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid var(--glass-border);
        }

        .chat-input {
          flex: 1;
          resize: none;
          min-height: 40px;
        }

        /* Panel Toggles */
        .panel-toggle {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: var(--glass-secondary);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          padding: 12px 6px;
          cursor: pointer;
          font-size: 12px;
          z-index: 50;
          border-radius: var(--radius-md);
          transition: all 0.2s ease;
        }

        .panel-toggle:hover {
          background: var(--glass-tertiary);
          color: var(--accent-cyan);
        }

        .left-toggle { left: 8px; }
        .right-toggle { right: 8px; }

        /* Chat Overlay */
        .chat-overlay {
          position: fixed;
          bottom: 90px;
          right: 24px;
          width: 360px;
          max-height: 400px;
          background: rgba(18, 18, 26, 0.95);
          backdrop-filter: blur(24px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          z-index: 999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chat-overlay-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--glass-primary);
          cursor: pointer;
          font-weight: 600;
        }

        .chat-overlay-messages {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 280px;
        }

        .chat-overlay-input {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid var(--glass-border);
        }

        .chat-overlay-input input {
          flex: 1;
        }

        /* Modal */
        .modal {
          max-width: 600px;
          width: 90%;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .modal-content p {
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .integrations-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .integration-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .integration-card.connected {
          border-color: var(--accent-green);
        }

        .integration-icon-lg {
          font-size: 32px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .left-sidebar { width: 240px; }
          .right-sidebar { width: 280px; }
          .top-bar-center { display: none; }
        }

        @media (max-width: 768px) {
          .main-content {
            flex-direction: column;
          }
          .left-sidebar, .right-sidebar {
            position: fixed;
            top: 60px;
            bottom: 80px;
            z-index: 100;
            width: 100%;
            max-width: 320px;
          }
          .left-sidebar { left: 0; }
          .right-sidebar { right: 0; }
          .mobile-sidebar {
            max-width: 100%;
          }
          .dock {
            bottom: 8px;
          }
          .chat-overlay {
            right: 8px;
            left: 8px;
            width: auto;
            bottom: 80px;
          }
          .integrations-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
