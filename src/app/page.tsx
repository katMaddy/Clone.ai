"use client";

import { useState, useEffect, useRef } from "react";
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
        name: "app.js",
        type: "file",
        language: "javascript",
        content: `// Welcome to Duplit!
// Your AI Development Platform

function greet(name) {
  return \`Hello, \${name}! Welcome to Duplit.\`;
}

const app = {
  name: "Duplit",
  version: "1.0.0",
  features: ["AI Code", "GitHub", "Tasks"],
  init: () => {
    console.log(\`\${app.name} v\${app.version} initialized!\`);
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
        content: `// Utility functions

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US').format(date);
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
        content: `/* Main Styles */

:root {
  --primary: #6366f1;
  --background: #0d0d0f;
}

body {
  font-family: system-ui, sans-serif;
  background: var(--background);
  color: white;
  margin: 0;
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
  "main": "src/app.js"
}`,
  },
];

const defaultTasks: Task[] = [
  { id: "1", title: "Set up project structure", completed: true },
  { id: "2", title: "Add user authentication", completed: false },
  { id: "3", title: "Implement dark mode", completed: false },
];

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

export default function Duplit() {
  const [files, setFiles] = useState<FileItem[]>(defaultFiles);
  const [activeFileId, setActiveFileId] = useState<string>("2");
  const [openTabs, setOpenTabs] = useState<string[]>(["2"]);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm Duplit AI. Tell me what you want to build, and I'll create it for you.\n\nTry saying things like:\n- Build a todo app\n- Create a landing page\n- Add user authentication",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [leftTab, setLeftTab] = useState<"files" | "tasks">("files");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const savedFiles = localStorage.getItem("duplit_files");
    const savedTasks = localStorage.getItem("duplit_tasks");
    const savedChat = localStorage.getItem("duplit_chat");
    if (savedFiles) setFiles(JSON.parse(savedFiles));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedChat) setChatMessages(JSON.parse(savedChat));
  }, []);

  useEffect(() => {
    localStorage.setItem("duplit_files", JSON.stringify(files));
    localStorage.setItem("duplit_tasks", JSON.stringify(tasks));
    localStorage.setItem("duplit_chat", JSON.stringify(chatMessages));
  }, [files, tasks, chatMessages]);

  const handleFileClickWrapper = (file: FileItem) => {
    if (file.type === "folder") {
      const toggleFolder = (items: FileItem[]): FileItem[] =>
        items.map((item) => {
          if (item.id === file.id) {
            return { ...item, isOpen: !item.isOpen };
          }
          if (item.children) {
            return { ...item, children: toggleFolder(item.children) };
          }
          return item;
        });
      setFiles(toggleFolder(files));
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
    const updateContent = (items: FileItem[]): FileItem[] =>
      items.map((item) => {
        if (item.id === activeFileId) {
          return { ...item, content: value };
        }
        if (item.children) {
          return { ...item, children: updateContent(item.children) };
        }
        return item;
      });
    setFiles(updateContent(files));
  };

  const handleAddFile = () => {
    const newFile: FileItem = {
      id: generateId(),
      name: "new-file.js",
      type: "file",
      language: "javascript",
      content: "// New file\n",
    };
    setFiles([...files, newFile]);
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

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const runCode = () => {
    if (!activeFile || activeFile.language !== "javascript") {
      setConsoleOutput(["Error: Only JavaScript files can be executed"]);
      return;
    }
    setConsoleOutput([`Running ${activeFile.name}...`]);

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
      setConsoleOutput((prev) => [...prev, ...logs, "Done"]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setConsoleOutput((prev) => [...prev, `Error: ${errorMessage}`]);
    }

    console.log = originalLog;
  };

  const sendMessage = () => {
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
        "I'll build that for you! Here's a start:\n\n```javascript\n// Your requested feature:\nfunction feature() {\n  // Implementation\n  return true;\n}\n```",
        "Great idea! Let me create that:\n\n```javascript\nasync function createApp() {\n  const app = {};\n  // Your logic here\n  return app;\n}\n```",
        "I can help with that! Here's a basic implementation:\n\n```javascript\nconst solution = () => {\n  // Implementation\n  return { success: true };\n};\n```",
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
          onClick={() => handleFileClickWrapper(item)}
        >
          <span className={`file-icon ${item.type === "folder" ? "folder" : item.language || "file"}`}>
            {item.type === "folder" ? (item.isOpen ? ">" : "+") : (item.language || "JS").toUpperCase().slice(0, 2)}
          </span>
          <span className="file-name">{item.name}</span>
          {item.type === "file" && (
            <button
              className="file-delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFile(item.id);
              }}
            >
              x
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
    <div className="app-container">
      {/* Left Panel - Chat */}
      <aside className="left-panel">
        <div className="left-panel-header">
          <div className="logo">
            <div className="logo-icon">D</div>
            <span>Duplit</span>
          </div>
          <div className="header-actions">
            <button className="icon-btn tooltip" data-tooltip="Settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-avatar">{msg.role === "user" ? "U" : "AI"}</div>
              <div className="message-content">
                <div className="message-bubble">{msg.content}</div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message assistant">
              <div className="message-avatar">AI</div>
              <div className="message-content">
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="quick-actions">
          <button className="quick-action-btn" onClick={() => setChatInput("Build a todo app")}>
            <span>+</span> Todo App
          </button>
          <button className="quick-action-btn" onClick={() => setChatInput("Create a landing page")}>
            <span>+</span> Landing Page
          </button>
          <button className="quick-action-btn" onClick={() => setChatInput("Add authentication")}>
            <span>+</span> Auth
          </button>
        </div>

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-textarea"
              placeholder="Ask AI to build anything..."
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
            <button className="send-btn" onClick={sendMessage} disabled={!chatInput.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="top-bar">
          <div className="top-bar-left">
            <button className="project-selector">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              my-project
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          <div className="top-bar-center">
            <button className="tab-btn active">Canvas</button>
            <button className="tab-btn">Files</button>
            <button className="tab-btn">Agents</button>
          </div>

          <div className="top-bar-right">
            <div className="agent-indicator">
              <span className="agent-dot"></span>
              Agent Ready
            </div>
            <button className="run-btn" onClick={runCode}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Run
            </button>
          </div>
        </div>

        <div className="workspace">
          <div className="canvas-tabs">
            {openTabs.map((tabId) => {
              const file = findFile(files, tabId);
              if (!file) return null;
              return (
                <div
                  key={tabId}
                  className={`canvas-tab ${tabId === activeFileId ? "active" : ""}`}
                  onClick={() => setActiveFileId(tabId)}
                >
                  <span>{(file.language || "JS").toUpperCase().slice(0, 2)}</span>
                  {file.name}
                  <span className="canvas-tab-close" onClick={(e) => handleTabClose(e, tabId)}>
                    x
                  </span>
                </div>
              );
            })}
            <button className="canvas-tab" onClick={handleAddFile}>
              +
            </button>
          </div>

          <div className="editor-container">
            {activeFile ? (
              <div className="editor-area">
                <Editor
                  height="100%"
                  language={activeFile.language || "javascript"}
                  theme="vs-dark"
                  value={activeFile.content || ""}
                  onChange={handleCodeChange}
                  options={{
                    fontSize: 14,
                    fontFamily: "var(--font-mono)",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16 },
                    lineNumbers: "on",
                    renderLineHighlight: "all",
                    cursorBlinking: "smooth",
                    tabSize: 2,
                    wordWrap: "on",
                  }}
                />
              </div>
            ) : (
              <div className="empty-canvas">
                <div className="empty-canvas-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <h2>Start Building</h2>
                <p>Tell Duplit what you want to create</p>
              </div>
            )}
          </div>

          <div className="console-panel">
            <div className="console-header">
              <span className="console-title">Console</span>
              <button className="icon-btn" onClick={() => setConsoleOutput([])}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
            <div className="console-output">
              {consoleOutput.length === 0 ? (
                <span style={{ color: "var(--text-muted)" }}>Click Run to execute your code</span>
              ) : (
                consoleOutput.map((line, i) => (
                  <div
                    key={i}
                    className={`console-line ${line.startsWith("Error") ? "error" : ""} ${line === "Done" ? "success" : ""}`}
                  >
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-tabs">
          <button className={`sidebar-tab ${leftTab === "files" ? "active" : ""}`} onClick={() => setLeftTab("files")}>
            Files
          </button>
          <button className={`sidebar-tab ${leftTab === "tasks" ? "active" : ""}`} onClick={() => setLeftTab("tasks")}>
            Tasks
          </button>
        </div>

        <div className="sidebar-content">
          {leftTab === "files" && <div className="file-tree">{renderFileTree(files)}</div>}

          {leftTab === "tasks" && (
            <div className="task-list">
              {tasks.map((task) => (
                <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                  />
                  <span className="task-title">{task.title}</span>
                  <button className="icon-btn" onClick={() => handleDeleteTask(task.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                className="quick-action-btn"
                style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                onClick={() => {
                  const newTask: Task = {
                    id: generateId(),
                    title: "New task",
                    completed: false,
                  };
                  setTasks([...tasks, newTask]);
                }}
              >
                + Add Task
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
