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
  createdAt: Date;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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
        name: "index.js",
        type: "file",
        language: "javascript",
        content: `// Welcome to DevForge!
// A powerful AI-powered code workspace

function greet(name) {
  return \`Hello, \${name}! Welcome to DevForge.\`;
}

console.log(greet("Developer"));

// Try editing this code and click the Run button!`,
      },
      {
        id: "3",
        name: "utils.js",
        type: "file",
        language: "javascript",
        content: `// Utility functions

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US').format(date);
}

export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}`,
      },
      {
        id: "4",
        name: "styles.css",
        type: "file",
        language: "css",
        content: `/* Main Styles */

body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 20px;
  background: #1a1a2e;
  color: #eee;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #00d9ff;
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
  "name": "devforge-project",
  "version": "1.0.0",
  "description": "AI-Powered Code Workspace",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js"
  },
  "dependencies": {}
}`,
  },
  {
    id: "6",
    name: "README.md",
    type: "file",
    language: "markdown",
    content: `# DevForge Project

Welcome to your new project!

## Getting Started

1. Edit files in the left sidebar
2. Write code in the editor
3. Click the Run button to execute
4. Ask AI for help in the right panel

## Features

- Monaco Editor with syntax highlighting
- Multi-file support
- Task management
- AI Code Assistant`,
  },
];

const defaultTasks: Task[] = [
  { id: "1", title: "Set up project structure", completed: true, priority: "high", createdAt: new Date() },
  { id: "2", title: "Implement user authentication", completed: false, priority: "high", createdAt: new Date() },
  { id: "3", title: "Add dark mode support", completed: false, priority: "medium", createdAt: new Date() },
  { id: "4", title: "Write documentation", completed: false, priority: "low", createdAt: new Date() },
];

const fileIcons: Record<string, string> = {
  javascript: "🟨",
  typescript: "🔷",
  python: "🐍",
  html: "🌐",
  css: "🎨",
  json: "📋",
  markdown: "📝",
  folder: "📁",
};

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>(defaultFiles);
  const [activeFileId, setActiveFileId] = useState<string>("2");
  const [openTabs, setOpenTabs] = useState<string[]>(["2"]);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm DevForge AI. I can help you write code, explain concepts, debug issues, or answer programming questions. What would you like to build today?",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [leftTab, setLeftTab] = useState<"files" | "tasks">("files");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const savedFiles = localStorage.getItem("devforge_files");
    const savedTasks = localStorage.getItem("devforge_tasks");
    const savedChat = localStorage.getItem("devforge_chat");
    const savedActiveFile = localStorage.getItem("devforge_activeFile");
    const savedOpenTabs = localStorage.getItem("devforge_openTabs");

    if (savedFiles) setFiles(JSON.parse(savedFiles));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedChat) setChatMessages(JSON.parse(savedChat));
    if (savedActiveFile) setActiveFileId(savedActiveFile);
    if (savedOpenTabs) setOpenTabs(JSON.parse(savedOpenTabs));
  }, []);

  useEffect(() => {
    localStorage.setItem("devforge_files", JSON.stringify(files));
    localStorage.setItem("devforge_tasks", JSON.stringify(tasks));
    localStorage.setItem("devforge_chat", JSON.stringify(chatMessages));
    localStorage.setItem("devforge_activeFile", activeFileId);
    localStorage.setItem("devforge_openTabs", JSON.stringify(openTabs));
  }, [files, tasks, chatMessages, activeFileId, openTabs]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
      content: "// New file",
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

  const handleRenameFile = (id: string, newName: string) => {
    const updateName = (items: FileItem[]): FileItem[] =>
      items.map((item) => {
        if (item.id === id) {
          const ext = newName.split(".").pop() || "js";
          const langMap: Record<string, string> = {
            js: "javascript",
            ts: "typescript",
            py: "python",
            html: "html",
            css: "css",
            json: "json",
            md: "markdown",
          };
          return { ...item, name: newName, language: langMap[ext] || "plaintext" };
        }
        if (item.children) {
          return { ...item, children: updateName(item.children) };
        }
        return item;
      });
    setFiles(updateName(files));
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
      setConsoleOutput([...consoleOutput, `> Error: Only JavaScript files can be executed`]);
      return;
    }
    setConsoleOutput((prev) => [...prev, `> Running ${activeFile.name}...`]);

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
      setConsoleOutput((prev) => [...prev, ...logs, "> Done"]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setConsoleOutput((prev) => [...prev, `> Error: ${errorMessage}`]);
    }

    console.log = originalLog;
    setConsoleCollapsed(false);
  }, [activeFile, consoleOutput]);

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
        `I can help with that! Here's a suggestion:\n\n\`\`\`javascript\n// Here's how you might approach this:\nfunction solution() {\n  // Your logic here\n  return true;\n}\n\`\`\``,
        `Great question! Let me explain:\n\nWhen working with ${activeFile?.language || "JavaScript"}, you should consider the async patterns available. Here's an example:\n\n\`\`\`javascript\nasync function fetchData() {\n  const response = await fetch('/api/data');\n  return response.json();\n}\n\`\`\``,
        `I recommend breaking this down into smaller steps:\n\n1. First, define your data structure\n2. Then implement the core logic\n3. Finally, add error handling\n\nWould you like me to show you a code example?`,
        `That's a common pattern! Here's a clean approach:\n\n\`\`\`javascript\nconst handler = (event) => {\n  event.preventDefault();\n  // Your handler logic\n};\n\`\`\`\n\nLet me know if you need more specific help!`,
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

  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        <div
          className={`file-item ${item.id === activeFileId ? "active" : ""}`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => handleFileClick(item)}
          onContextMenu={(e) => {
            e.preventDefault();
          }}
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

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">DevForge</span>
          </div>
          <button className="btn btn-success" onClick={runCode}>
            <span>▶</span> Run
            <span className="shortcut">Ctrl+Enter</span>
          </button>
        </div>
        <div className="header-center">
          <select
            className="language-select"
            value={activeFile?.language || "javascript"}
            onChange={() => {}}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>
        <div className="header-right">
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            title="Toggle sidebar"
          >
            ☰
          </button>
          <button className="btn btn-icon btn-ghost" title="Settings">
            ⚙
          </button>
          <div className="avatar">D</div>
        </div>
      </header>

      <div className="main">
        {!leftSidebarCollapsed && (
          <aside className="sidebar left-sidebar">
            <div className="sidebar-tabs">
              <button
                className={`sidebar-tab ${leftTab === "files" ? "active" : ""}`}
                onClick={() => setLeftTab("files")}
              >
                Files
              </button>
              <button
                className={`sidebar-tab ${leftTab === "tasks" ? "active" : ""}`}
                onClick={() => setLeftTab("tasks")}
              >
                Tasks
              </button>
            </div>

            {leftTab === "files" && (
              <div className="sidebar-content">
                <div className="sidebar-header">
                  <span>Explorer</span>
                  <div className="sidebar-actions">
                    <button
                      className="btn btn-icon btn-ghost"
                      onClick={() => handleAddFile(null)}
                      title="New file"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="file-tree">{renderFileTree(files)}</div>
              </div>
            )}

            {leftTab === "tasks" && (
              <div className="sidebar-content">
                <div className="task-input-wrapper">
                  <input
                    type="text"
                    className="input task-input"
                    placeholder="Add a new task..."
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  />
                  <button className="btn btn-primary" onClick={handleAddTask}>
                    Add
                  </button>
                </div>
                <div className="task-list">
                  {tasks.map((task) => (
                    <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
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
                      <button className="btn btn-icon btn-ghost" onClick={() => handleDeleteTask(task.id)}>
                        ×
                      </button>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="empty-state">No tasks yet. Add one above!</div>
                  )}
                </div>
              </div>
            )}
          </aside>
        )}

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
                  <button className="tab-close" onClick={(e) => handleTabClose(e, tabId)}>
                    ×
                  </button>
                </div>
              );
            })}
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
                  minimap: { enabled: true },
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
                <p>No file selected</p>
                <p className="hint">Select a file from the explorer or create a new one</p>
              </div>
            )}
          </div>

          <div className={`console ${consoleCollapsed ? "collapsed" : ""}`}>
            <div className="console-header" onClick={() => setConsoleCollapsed(!consoleCollapsed)}>
              <span>Console</span>
              <span className="console-toggle">{consoleCollapsed ? "▲" : "▼"}</span>
            </div>
            {!consoleCollapsed && (
              <div className="console-output" ref={consoleRef}>
                {consoleOutput.length === 0 ? (
                  <span className="console-empty">Click Run to execute your code</span>
                ) : (
                  consoleOutput.map((line, i) => (
                    <div key={i} className={`console-line ${line.startsWith("> Error") ? "error" : ""}`}>
                      {line}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {!rightPanelCollapsed && (
          <aside className="sidebar right-sidebar">
            <div className="ai-header">
              <div className="ai-title">
                <span className="ai-icon">🤖</span>
                <span>DevForge AI</span>
              </div>
              <button
                className="btn btn-icon btn-ghost"
                onClick={() => setChatMessages([chatMessages[0]])}
                title="Clear chat"
              >
                🗑
              </button>
            </div>

            <div className="chat-messages">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.role}`}>
                  <div className="message-avatar">{msg.role === "user" ? "👤" : "🤖"}</div>
                  <div className="message-content">
                    <div className="message-text">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-message assistant">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-wrapper">
              <textarea
                className="chat-input"
                placeholder="Ask AI for help..."
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
              <button className="btn btn-primary chat-send" onClick={sendMessage} disabled={!chatInput.trim()}>
                Send
              </button>
            </div>

            <div className="suggested-prompts">
              <span className="suggestions-label">Try asking:</span>
              <button onClick={() => setChatInput("Explain this code")}>Explain this code</button>
              <button onClick={() => setChatInput("How do I add a new feature?")}>How do I add a new feature?</button>
              <button onClick={() => setChatInput("Help me debug this")}>Help me debug this</button>
            </div>
          </aside>
        )}

        <button
          className="panel-toggle right-toggle"
          onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          title="Toggle AI panel"
        >
          {rightPanelCollapsed ? "◀" : "▶"}
        </button>
      </div>

      <style jsx>{`
        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 48px;
          padding: 0 16px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
        }

        .header-left,
        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 16px;
        }

        .logo-icon {
          font-size: 20px;
        }

        .shortcut {
          font-size: 10px;
          opacity: 0.7;
          margin-left: 4px;
        }

        .language-select {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 6px 12px;
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-purple);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .main {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          overflow: hidden;
        }

        .left-sidebar {
          width: 280px;
          min-width: 200px;
        }

        .right-sidebar {
          width: 360px;
          border-right: none;
          border-left: 1px solid var(--border);
        }

        .sidebar-tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
        }

        .sidebar-tab {
          flex: 1;
          padding: 12px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms;
        }

        .sidebar-tab:hover {
          color: var(--text-primary);
        }

        .sidebar-tab.active {
          color: var(--text-primary);
          border-bottom: 2px solid var(--accent-blue);
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
          transition: background 150ms;
          font-size: 13px;
        }

        .file-item:hover {
          background: var(--bg-tertiary);
        }

        .file-item.active {
          background: var(--bg-tertiary);
          color: var(--accent-blue);
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
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 16px;
          padding: 0 4px;
          transition: opacity 150ms;
        }

        .file-item:hover .file-delete {
          opacity: 1;
        }

        .file-delete:hover {
          color: var(--accent-red);
        }

        .task-input-wrapper {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .task-input {
          flex: 1;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .task-item.completed .task-title {
          text-decoration: line-through;
          color: var(--text-secondary);
        }

        .task-item input[type="checkbox"] {
          accent-color: var(--accent-green);
        }

        .task-title {
          flex: 1;
          font-size: 13px;
        }

        .priority-select {
          background: transparent;
          border: none;
          font-size: 11px;
          padding: 2px 4px;
          border-radius: var(--radius-sm);
          cursor: pointer;
        }

        .priority-low {
          color: var(--text-secondary);
        }

        .priority-medium {
          color: var(--accent-yellow);
        }

        .priority-high {
          color: var(--accent-red);
        }

        .empty-state {
          text-align: center;
          color: var(--text-secondary);
          padding: 24px;
          font-size: 13px;
        }

        .editor-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .tab-bar {
          display: flex;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
          overflow-x: auto;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--bg-primary);
          border-right: 1px solid var(--border);
          cursor: pointer;
          font-size: 13px;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .tab:hover {
          background: var(--bg-secondary);
        }

        .tab.active {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border-bottom: 2px solid var(--accent-blue);
        }

        .tab-icon {
          font-size: 12px;
        }

        .tab-close {
          background: transparent;
          border: none;
          color: var(--text-secondary);
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

        .editor-container {
          flex: 1;
          overflow: hidden;
        }

        .empty-editor {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-secondary);
        }

        .empty-editor .hint {
          font-size: 13px;
          opacity: 0.7;
        }

        .console {
          background: var(--bg-primary);
          border-top: 1px solid var(--border);
          max-height: 200px;
          display: flex;
          flex-direction: column;
        }

        .console.collapsed {
          max-height: 32px;
        }

        .console-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: var(--bg-secondary);
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }

        .console-toggle {
          font-size: 10px;
        }

        .console-output {
          flex: 1;
          overflow-y: auto;
          padding: 12px 16px;
          font-family: var(--font-mono);
          font-size: 13px;
        }

        .console-empty {
          color: var(--text-muted);
        }

        .console-line {
          padding: 2px 0;
          color: var(--text-secondary);
        }

        .console-line.error {
          color: var(--accent-red);
        }

        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
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
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .chat-message.assistant .message-avatar {
          background: var(--accent-purple);
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
        }

        .chat-message.user .message-text {
          background: var(--accent-blue);
          color: white;
        }

        .chat-message.assistant .message-text {
          background: var(--bg-tertiary);
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: var(--text-secondary);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .chat-input-wrapper {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid var(--border);
        }

        .chat-input {
          flex: 1;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          color: var(--text-primary);
          font-size: 13px;
          resize: none;
          outline: none;
          font-family: inherit;
        }

        .chat-input:focus {
          border-color: var(--accent-blue);
        }

        .chat-send {
          align-self: flex-end;
        }

        .suggested-prompts {
          padding: 12px 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          border-top: 1px solid var(--border);
        }

        .suggestions-label {
          width: 100%;
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .suggested-prompts button {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 6px 12px;
          color: var(--text-secondary);
          font-size: 12px;
          cursor: pointer;
          transition: all 150ms;
        }

        .suggested-prompts button:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .panel-toggle {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 8px 4px;
          cursor: pointer;
          font-size: 12px;
          z-index: 10;
        }

        .right-toggle {
          right: 0;
          border-radius: var(--radius-md) 0 0 var(--radius-md);
        }

        .right-toggle:hover {
          background: var(--bg-tertiary);
        }

        @media (max-width: 1024px) {
          .left-sidebar {
            width: 240px;
          }
          .right-sidebar {
            width: 300px;
          }
        }

        @media (max-width: 768px) {
          .left-sidebar,
          .right-sidebar {
            position: absolute;
            z-index: 100;
            height: 100%;
          }
          .right-toggle {
            right: 0;
          }
        }
      `}</style>
    </div>
  );
}
