# Conversational Pivot Protocol (CPP) v1.1.0
## Implementation & Integration Manual for depthOS

This document provides the technical specifications, data models, state-store handlers, and client/server implementation templates required to integrate the **Conversational Pivot Protocol (CPP)** into the `depthOS` system.

---

## 1. Architectural Blueprint: Directed Semantic Graph (DSG)

Traditional chat applications are architecturally constrained by linear arrays of messages. When a response is active, the user cannot redirect, modify, or branch their thought without starting a fresh conversation or destroying the previous history. 

CPP models dialog as a **Directed Semantic Graph (DSG)**. Nodes in the graph represent discrete speech acts (prompts, completions, system logs, or user-initiated pivots). Relationships are defined as parental ancestry (`parentId`) and branching futures (`childrenIds[]`).

```
                    [User Root Node]
                           |
                     [AI Node 1] (Completed)
                           |
                     [User Prompt 2]
                           |
             [AI Node 2 (Interrupted @ Chk 4)]
                      /            \
                     /              \
         (Branch Sibling 1)      (Branch Sibling 2)
         [User Pivot Input]      [User Extension Input]
                 |                         |
         [AI Node 3 (Active)]    [AI Node 4 (Unexplored)]
```

### Key Interactive Primitives:
1. **Mid-Stream Hot-Halting (⚡ PIVOT):** Immediate model stream cancellation coupled with local/remote text truncation and branching.
2. **Retroactive Visual Anchoring (⚓ ANCHOR):** Overriding the conversational head pointer (`activeHeadMessageId`) to branch any future prompts from a historical node.
3. **Multi-Thread Sibling Traversal:** Swapping active rendering paths between concurrent sibling nodes.

---

## 2. Core State Schema & Traversal Algorithms

The following schemas and helpers represent the mathematical modeling of the graph. It is recommended to place these types inside your state management module (e.g., Zustand, Redux, or depthOS Kernel Core).

### 2.1 TypeScript Interfaces

```typescript
export interface ChatMessage {
  id: string;
  sender: string;
  role: 'user' | 'assistant' | 'system' | 'peer';
  content: string;
  timestamp: string;
  signature?: string; // Cryptographic DID signature proof for sovereign verification
  parentId: string | null;
  status: 'completed' | 'generating' | 'interrupted';
  childrenIds: string[];
}

export interface ChatThread {
  id: string;
  name: string;
  type: 'agent' | 'p2p' | 'group';
  peers: string[]; // Sovereign DIDs or names in the thread
  messages: ChatMessage[];
  activeHeadMessageId?: string; // Tracks the current active terminal leaf of the DSG path
}
```

### 2.2 Depth-First Ancestral Path Reconstruction

To render a linear-looking scrollback panel from a complex DSG branch, the application traverses backwards from the `activeHeadMessageId` to the root of the dialogue tree and reverses the array for chronological display.

```typescript
/**
 * Resolves the active linear dialogue path from a branch-enabled ChatThread.
 * Falls back to legacy sequential message display if no active pointer is present.
 */
export function getActivePath(thread: ChatThread): ChatMessage[] {
  if (!thread || !thread.messages || thread.messages.length === 0) return [];
  
  const messages = thread.messages;
  const msgMap = new Map<string, ChatMessage>();
  messages.forEach(m => msgMap.set(m.id, m));

  let headId = thread.activeHeadMessageId;
  // Fallback to the final chronological message if head pointer is corrupt/missing
  if (!headId || !msgMap.has(headId)) {
    headId = messages[messages.length - 1].id;
  }

  const path: ChatMessage[] = [];
  let currentId: string | null | undefined = headId;
  const visited = new Set<string>();

  // Trace ancestors up to the root node
  while (currentId && msgMap.has(currentId) && !visited.has(currentId)) {
    visited.add(currentId);
    const msg = msgMap.get(currentId)!;
    path.push(msg);
    currentId = msg.parentId;
  }

  // Reverse path to render chronologically (root -> active leaf)
  if (path.length > 0) {
    return path.reverse();
  }

  return messages;
}
```

### 2.3 Auto-Healing Backward Compatibility (Data Migration)

When loading legacy flat-array chat logs from disk or databases, this transformer reconstructs the DSG parent-child indices dynamically.

```typescript
/**
 * Upgrades legacy flat chat thread arrays into valid Directed Semantic Graphs.
 * Enforces parent-child mappings and initializes branch pointers.
 */
export function ensureDSGStructure(threads: ChatThread[]): ChatThread[] {
  return threads.map(thread => {
    if (!thread.messages || thread.messages.length === 0) {
      return {
        ...thread,
        activeHeadMessageId: undefined
      };
    }

    // Clone and sanitize original messages
    const messagesCopy = thread.messages.map(m => ({
      ...m,
      parentId: m.parentId !== undefined ? m.parentId : null,
      status: m.status !== undefined ? m.status : 'completed' as const,
      childrenIds: m.childrenIds ? [...m.childrenIds] : []
    }));

    // Reconstruct linear relationships if zero graph markers exist
    const allParentsAreNull = thread.messages.every(m => m.parentId === undefined || m.parentId === null);
    if (allParentsAreNull) {
      for (let j = 0; j < messagesCopy.length; j++) {
        messagesCopy[j].parentId = j === 0 ? null : messagesCopy[j - 1].id;
      }
    }

    // Reset children arrays to avoid duplicate entries during mapping reconstruction
    messagesCopy.forEach(m => {
      m.childrenIds = [];
    });

    // Re-index children arrays based on parent pointers
    messagesCopy.forEach(m => {
      const pId = m.parentId;
      if (pId) {
        const parentMsg = messagesCopy.find(p => p.id === pId);
        if (parentMsg) {
          if (!parentMsg.childrenIds.includes(m.id)) {
            parentMsg.childrenIds.push(m.id);
          }
        }
      }
    });

    // Enforce valid active head message ID
    let activeHeadId = thread.activeHeadMessageId;
    if (!activeHeadId || !messagesCopy.some(m => m.id === activeHeadId)) {
      activeHeadId = messagesCopy[messagesCopy.length - 1].id;
    }

    return {
      ...thread,
      messages: messagesCopy,
      activeHeadMessageId: activeHeadId
    };
  });
}
```

---

## 3. Client State-Store Handlers (Zustand Implementation)

This state-store snippet handles user inputs, anchors, and pivots. Integrate these actions directly into your primary React/Zustand slice.

```typescript
import { create } from 'zustand';

interface HUDStore {
  chatThreads: ChatThread[];
  activeThreadId: string;
  userDid: string;
  setHUDState: (state: Partial<HUDStore>) => void;
  sendMessageInThread: (threadId: string, content: string, senderRole?: ChatMessage['role'], parentId?: string | null) => string;
  pivotChatStream: (threadId: string, modifier: string, interruptedContent?: string) => void;
  anchorChatThread: (threadId: string, targetNodeId: string) => void;
}

export const useHUD = create<HUDStore>((set, get) => ({
  chatThreads: [],
  activeThreadId: '',
  userDid: 'did:sovereign:citizen:0x9f1d2b8a3e1c0d4f',

  setHUDState: (newState) => set((state) => ({ ...state, ...newState })),

  sendMessageInThread: (threadId, content, senderRole = 'user', parentId) => {
    const cleanContent = content.trim();
    const newMessageId = `${threadId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    if (!cleanContent) return '';

    set((state) => {
      const timestamp = new Date().toISOString();
      let signature = undefined;

      // Cryptographic DID packaging simulation for Sovereign Citizens
      if (senderRole === 'user') {
        const messageHash = Array.from(cleanContent).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        signature = `sig:0x${((messageHash * 31) & 0xffffffff).toString(16).padEnd(8, '0')}`;
      }

      const updatedThreads = state.chatThreads.map((t) => {
        if (t.id === threadId) {
          // Resolve the true parent
          let resolvedParentId: string | null = null;
          if (parentId !== undefined) {
            resolvedParentId = parentId;
          } else if (t.activeHeadMessageId) {
            resolvedParentId = t.activeHeadMessageId;
          } else if (t.messages.length > 0) {
            resolvedParentId = t.messages[t.messages.length - 1].id;
          }

          const newMessage: ChatMessage = {
            id: newMessageId,
            sender: senderRole === 'user' ? 'user' : senderRole,
            role: senderRole,
            content: cleanContent,
            timestamp,
            signature,
            parentId: resolvedParentId,
            status: 'completed',
            childrenIds: []
          };

          const updatedMessages = t.messages.map(m => {
            if (m.id === resolvedParentId) {
              return {
                ...m,
                childrenIds: [...(m.childrenIds || []), newMessageId]
              };
            }
            return m;
          });

          return {
            ...t,
            messages: [...updatedMessages, newMessage],
            activeHeadMessageId: newMessageId
          };
        }
        return t;
      });

      return { chatThreads: updatedThreads };
    });

    return newMessageId;
  },

  pivotChatStream: (threadId, modifier, interruptedContent) => {
    const cleanModifier = modifier.trim();
    if (!cleanModifier) return;

    set((state) => {
      const updatedThreads = state.chatThreads.map((t) => {
        if (t.id === threadId) {
          const headId = t.activeHeadMessageId;
          const messages = t.messages.map(m => ({ ...m }));
          const activeMsg = messages.find(m => m.id === headId);

          // 1. Interrupt & halt active node content
          if (activeMsg) {
            activeMsg.status = 'interrupted';
            if (interruptedContent !== undefined) {
              activeMsg.content = interruptedContent;
            }
          }

          // 2. Insert User's Pivot Prompt as a child node
          const pivotUserId = `${threadId}-pivot-usr-${Date.now()}`;
          const pivotUserMsg: ChatMessage = {
            id: pivotUserId,
            sender: 'user',
            role: 'user',
            content: `⚡ PIVOT MODIFIER: ${cleanModifier}`,
            timestamp: new Date().toISOString(),
            parentId: headId || null,
            status: 'completed',
            childrenIds: []
          };

          if (activeMsg) {
            activeMsg.childrenIds = [...(activeMsg.childrenIds || []), pivotUserId];
          }

          messages.push(pivotUserMsg);

          return {
            ...t,
            messages,
            activeHeadMessageId: pivotUserId
          };
        }
        return t;
      });

      return { chatThreads: updatedThreads };
    });
  },

  anchorChatThread: (threadId, targetNodeId) => {
    set((state) => {
      const updatedThreads = state.chatThreads.map((t) => {
        if (t.id === threadId) {
          const exists = t.messages.some(m => m.id === targetNodeId);
          if (exists) {
            return {
              ...t,
              activeHeadMessageId: targetNodeId
            };
          }
        }
        return t;
      });

      return { chatThreads: updatedThreads };
    });
  }
}));
```

---

## 4. WebSocket Communication Protocol (WSS Frame Schema)

For distributed depthOS clients communicating with high-performance inference servers, the session occurs over a low-latency secure WebSocket pipeline.

* **WSS Path Target:** `/v1/cpp/session`
* **Sec-WebSocket-Protocol Header:** `cpp-v1.1.0`

### 4.1 Client-to-Server Control Payloads

#### A. `CPP_PIVOT_INIT` (Interrupt & Sub-Branch Generation)
Dispatched immediately when the client types a modifier mid-generation.

```json
{
  "type": "CPP_PIVOT_INIT",
  "timestamp": 1781100000000,
  "payload": {
    "interruptedNodeId": "msg_01h8v...",
    "activeThreadId": "thread_abc123",
    "userPrompt": "Wait, halt and let's explore the Rust implementation instead.",
    "newBranchNodeId": "msg_01h8w..."
  }
}
```

#### B. `CPP_ANCHOR_HEAD` (Retroactive Pointer Reset)
Dispatched when setting a historical graph node as the retroactive branch origin.

```json
{
  "type": "CPP_ANCHOR_HEAD",
  "timestamp": 1781100010000,
  "payload": {
    "activeThreadId": "thread_abc123",
    "targetNodeId": "msg_01h8v1..."
  }
}
```

---

### 4.2 Server-to-Client Control Payloads

#### A. `CPP_STREAM_HALTED` (Acknowledge Stream Interruption)
Server confirms it has broken the generation loop and states the final chunk contents saved to the dataset.

```json
{
  "type": "CPP_STREAM_HALTED",
  "timestamp": 1781100001200,
  "payload": {
    "interruptedNodeId": "msg_01h8v...",
    "finalContentLength": 182,
    "lastChunkReceived": "We can see that the SNN LIF..."
  }
}
```

#### B. `CPP_SYNC_GRAPH` (Tree Graph Hydration/Re-sync)
Server outputs the state of the DSG Mind Map on initial connection or major transformations.

```json
{
  "type": "CPP_SYNC_GRAPH",
  "timestamp": 1781100001500,
  "payload": {
    "threadId": "thread_abc123",
    "rootNodeId": "msg_01h8v0...",
    "activeHeadMessageId": "msg_01h8w...",
    "nodes": {
      "msg_01h8v0": {
        "id": "msg_01h8v0",
        "parentId": null,
        "childrenIds": ["msg_01h8v1"],
        "role": "user",
        "content": "Explain neural architectures."
      },
      "msg_01h8v1": {
        "id": "msg_01h8v1",
        "parentId": "msg_01h8v0",
        "childrenIds": ["msg_01h8w_p1"],
        "role": "assistant",
        "content": "SNN structures use threshold-based spike firing...",
        "status": "completed"
      }
    }
  }
}
```

---

## 5. Halt-and-Splice Server Stream Engine (Node.js/TypeScript)

This server template listens for client WebSocket connections and orchestrates stream termination on the LLM client before injecting a sibling branch into the DSG.

```typescript
import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';

interface ActiveTask {
  abortController: AbortController;
  currentNodeId: string;
}

export class CPPServerEngine extends EventEmitter {
  private wss: WebSocketServer;
  private activeStreams: Map<string, ActiveTask> = new Map(); // threadId -> ActiveTask

  constructor(port: number) {
    super();
    this.wss = new WebSocketServer({ port });
    this.init();
  }

  private init() {
    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', async (messageData: string) => {
        try {
          const frame = JSON.parse(messageData);
          this.emit('frame', frame);

          switch (frame.type) {
            case 'CPP_PIVOT_INIT':
              await this.handlePivotInit(ws, frame.payload);
              break;
            case 'CPP_ANCHOR_HEAD':
              await this.handleAnchorHead(ws, frame.payload);
              break;
            default:
              console.log('Unknown protocol frame received:', frame.type);
          }
        } catch (e) {
          ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Invalid payload compilation' } }));
        }
      });
    });
  }

  private async handlePivotInit(ws: WebSocket, payload: any) {
    const { activeThreadId, interruptedNodeId, userPrompt, newBranchNodeId } = payload;
    
    // 1. Hot Halt Active LLM Task
    const activeStream = this.activeStreams.get(activeThreadId);
    if (activeStream) {
      console.log(`[⚡ CPP HALT] Halting active generation task for thread: ${activeThreadId}`);
      activeStream.abortController.abort(); // Abort active LLM completion promise
      this.activeStreams.delete(activeThreadId);
    }

    // 2. Transmit Halt Confirmation Acknowledgement Frame
    ws.send(JSON.stringify({
      type: 'CPP_STREAM_HALTED',
      timestamp: Date.now(),
      payload: {
        interruptedNodeId,
        finalContentLength: 100, // Sync with length of stored string at interruption
        lastChunkReceived: "[Halted via Conversational Pivot Protocol]"
      }
    }));

    // 3. Database Sync / Tree Injection (Concept code)
    console.log(`[📁 DSG SPLICING] Injecting child branch: ${newBranchNodeId} as child of ${interruptedNodeId}`);
    // await db.messages.update({ id: interruptedNodeId }, { status: 'interrupted' });
    // await db.messages.create({ id: newBranchNodeId, parentId: interruptedNodeId, content: userPrompt });

    // 4. Instantly Spawn Sibling AI Stream Thread
    const nextAbortController = new AbortController();
    const nextNodeId = `ai-completion-${Date.now()}`;
    this.activeStreams.set(activeThreadId, { abortController: nextAbortController, currentNodeId: nextNodeId });

    // Initiate next sibling stream asynchronously
    this.triggerSiblingInference(ws, activeThreadId, nextNodeId, userPrompt, nextAbortController);
  }

  private async handleAnchorHead(ws: WebSocket, payload: any) {
    const { activeThreadId, targetNodeId } = payload;
    console.log(`[⚓ ANCHOR] Moving head pointer for thread: ${activeThreadId} retroactively to: ${targetNodeId}`);
    // await db.threads.update({ id: activeThreadId }, { activeHeadMessageId: targetNodeId });
  }

  private async triggerSiblingInference(ws: WebSocket, threadId: string, nodeId: string, prompt: string, controller: AbortController) {
    try {
      // Stream simulation mimicking real API stream chunk transport
      const mockChunks = [
        "Acknowledging conversational pivot. ",
        "Terminated legacy linear context path. ",
        "Initializing secure Rust sibling routine. ",
        "All depthOS modules online and isolated."
      ];

      for (const chunk of mockChunks) {
        if (controller.signal.aborted) {
          console.log(`[❌ HALT ACK] Sibling stream aborted for node: ${nodeId}`);
          return;
        }

        ws.send(JSON.stringify({
          type: 'CPP_CHUNK_EMIT',
          payload: {
            threadId,
            nodeId,
            chunk,
            status: 'generating'
          }
        }));

        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      this.activeStreams.delete(threadId);
      ws.send(JSON.stringify({
        type: 'CPP_CHUNK_EMIT',
        payload: { threadId, nodeId, chunk: '', status: 'completed' }
      }));
    } catch (e) {
      console.error('Error during active inference stream:', e);
    }
  }
}
```

---

## 6. Client Interface UI Integration (React Component)

This component demonstrates how to hook up your UI input bar to support hot-halting and visual sibling branch traversing with elegant glassmorphic layouts.

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { useHUD, getActivePath, ChatMessage } from './hud-store'; // Path to Zustand store

export const DepthOSConversationalConsole = () => {
  const { 
    chatThreads, 
    activeThreadId, 
    sendMessageInThread, 
    pivotChatStream, 
    anchorChatThread, 
    setHUDState 
  } = useHUD();

  const [chatInput, setChatInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [anchorTargetNodeId, setAnchorTargetNodeId] = useState<string | null>(null);

  const activeThread = chatThreads.find(t => t.id === activeThreadId) || chatThreads[0];
  const activePath = getActivePath(activeThread);
  const activeTimeoutsRef = useRef<number[]>([]);

  // Deepest leaf resolution utility
  const getDeepestLeafId = (nodeId: string, messages: ChatMessage[]): string => {
    const msgMap = new Map(messages.map(msg => [msg.id, msg]));
    let currentId = nodeId;
    while (true) {
      const msg = msgMap.get(currentId);
      if (msg && msg.childrenIds && msg.childrenIds.length > 0) {
        currentId = msg.childrenIds[msg.childrenIds.length - 1];
      } else {
        break;
      }
    }
    return currentId;
  };

  // Mock streamer with client cancellation hooks
  const simulateInteractiveStream = (promptText: string) => {
    setIsAiGenerating(true);
    const textId = sendMessageInThread(activeThread.id, '▋', 'assistant', anchorTargetNodeId);
    setAnchorTargetNodeId(null); // Reset anchor target after sending prompt

    let currentText = '';
    const answer = `Interpreting sibling context request. Staging isolated container parameters inside depthOS matrix.`;
    const tokens = answer.split(' ');
    let tokenIndex = 0;

    const streamToken = () => {
      if (tokenIndex < tokens.length) {
        currentText += (tokenIndex === 0 ? '' : ' ') + tokens[tokenIndex];
        tokenIndex++;

        // Update in-flight message state in store
        const updated = useHUD.getState().chatThreads.map(t => {
          if (t.id === activeThread.id) {
            return {
              ...t,
              messages: t.messages.map(m => {
                if (m.id === textId) {
                  return { ...m, content: currentText + ' ▋', status: 'generating' as const };
                }
                return m;
              })
            };
          }
          return t;
        });
        setHUDState({ chatThreads: updated });

        const delay = window.setTimeout(streamToken, 80 + Math.random() * 50);
        activeTimeoutsRef.current.push(delay);
      } else {
        setIsAiGenerating(false);
        finalizeMessage(textId, currentText);
      }
    };

    streamToken();
  };

  const finalizeMessage = (msgId: string, content: string) => {
    const updated = useHUD.getState().chatThreads.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          messages: t.messages.map(m => m.id === msgId ? { ...m, content, status: 'completed' as const } : m)
        };
      }
      return t;
    });
    setHUDState({ chatThreads: updated });
  };

  const cancelActiveUIInference = () => {
    activeTimeoutsRef.current.forEach(id => clearTimeout(id));
    activeTimeoutsRef.current = [];
    setIsAiGenerating(false);
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    sendMessageInThread(activeThread.id, chatInput.trim(), 'user', anchorTargetNodeId);
    setChatInput('');
    simulateInteractiveStream(chatInput);
  };

  const handlePivot = () => {
    if (!chatInput.trim()) return;
    const modifierText = chatInput.trim();
    setChatInput('');

    // 1. Terminate client-side UI simulation loops
    cancelActiveUIInference();

    // 2. Modify node states inside DSG store
    pivotChatStream(activeThread.id, modifierText);

    // 3. Kickoff sibling branch generation on the new sub-tree branch
    simulateInteractiveStream(modifierText);
  };

  return (
    <div className="flex flex-col h-full max-h-[500px] w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl font-sans">
      {/* Thread Header */}
      <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-white">depthOS Conversational Port</span>
        <span className="text-[9px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase">
          DSG active
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
        {activePath.map((m) => {
          const isUser = m.role === 'user';
          const siblings = activeThread.messages.filter(x => x.parentId === m.parentId).map(x => x.id);
          const currentSiblingIndex = siblings.indexOf(m.id);

          return (
            <div key={m.id} className={`p-3 rounded-lg border text-xs relative group ${
              isUser 
                ? 'bg-amber-950/20 border-amber-500/20 text-amber-100 ml-8' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-100 mr-8'
            }`}>
              <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 mb-1">
                <span>{isUser ? 'CITIZEN SENDER' : 'depthOS CORE'}</span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAnchorTargetNodeId(m.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-400 hover:underline text-[8px] font-bold"
                  >
                    ⚓ ANCHOR FUTURE
                  </button>
                  {m.status === 'interrupted' && (
                    <span className="text-red-400 font-bold">[INTERRUPTED]</span>
                  )}
                </div>
              </div>
              <p>{m.content}</p>

              {/* Sibling Branch Swapper Controls */}
              {siblings.length > 1 && (
                <div className="mt-2 flex items-center gap-1.5 text-[8px] font-mono bg-black/40 px-2 py-0.5 rounded border border-zinc-800 w-max text-zinc-400 select-none">
                  <button 
                    disabled={currentSiblingIndex === 0}
                    onClick={() => anchorChatThread(activeThread.id, getDeepestLeafId(siblings[currentSiblingIndex - 1], activeThread.messages))}
                    className="hover:text-amber-400 disabled:opacity-30 disabled:hover:text-zinc-400"
                  >
                    [←
                  </button>
                  <span>Branch {currentSiblingIndex + 1} of {siblings.length}</span>
                  <button 
                    disabled={currentSiblingIndex === siblings.length - 1}
                    onClick={() => anchorChatThread(activeThread.id, getDeepestLeafId(siblings[currentSiblingIndex + 1], activeThread.messages))}
                    className="hover:text-amber-400 disabled:opacity-30 disabled:hover:text-zinc-400"
                  >
                    →]
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {isAiGenerating && (
          <div className="p-3 bg-zinc-900 border border-purple-500/20 rounded-lg text-xs mr-8 animate-pulse text-purple-400 font-mono">
            Generating completion stream...
          </div>
        )}
      </div>

      {/* Input Tray */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800 space-y-2">
        {isAiGenerating && (
          <div className="p-1 px-2 bg-purple-950/20 border border-purple-500/20 text-purple-400 font-mono text-[8px] uppercase tracking-wider rounded flex justify-between items-center animate-pulse">
            <span>⚡ Stream actively piping. Input modifier to PIVOT stream.</span>
          </div>
        )}
        {anchorTargetNodeId && (
          <div className="p-1 px-2 bg-amber-950/20 border border-amber-500/20 text-amber-400 font-mono text-[8px] uppercase tracking-wider rounded flex justify-between items-center">
            <span>⚓ Next prompt anchored to historical node: {anchorTargetNodeId.slice(0, 15)}...</span>
            <button onClick={() => setAnchorTargetNodeId(null)} className="hover:text-white">[CLEAR]</button>
          </div>
        )}
        <div className="flex gap-2">
          <input 
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                isAiGenerating ? handlePivot() : handleSend();
              }
            }}
            placeholder={isAiGenerating ? "Enter pivot modifier (e.g. 'explain with more Rust details')..." : "Broadcast packet to active matrix channel..."}
            className="flex-1 bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/40"
          />
          {isAiGenerating ? (
            <button 
              onClick={handlePivot}
              className="px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
            >
              Pivot
            </button>
          ) : (
            <button 
              onClick={handleSend}
              className="px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors"
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 7. Strategic Implementation Milestones & Audit Checklist

To roll out the Conversational Pivot Protocol successfully within `depthOS`:

- [ ] **Phase 1: Database Scheme Transition:** Migrating table rows from standard sequential chat indexes to support nullable parent keys (`parentId`) and child array links.
- [ ] **Phase 2: AbortController Hook Insertion:** Equipping your backend model dispatcher with request abort triggers mapped cleanly to incoming pipeline requests.
- [ ] **Phase 3: State-Store Hydration Audit:** Injecting the `ensureDSGStructure` migration script into your persistence layer startup loop to safeguard retrofitted history logs.
- [ ] **Phase 4: Sibling Traversal UI Rollout:** Placing the visual sibling swappers underneath your message bubbles inside your dashboard panel.
- [ ] **Phase 5: Spatial DSG Visualization (Optional Canvas Overlay):** Mapping node relationships to interactive floating canvas structures using standard SVG render streams for complete mental model transparency.
