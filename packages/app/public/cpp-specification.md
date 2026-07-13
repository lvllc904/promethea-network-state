# Conversational Pivot Protocol (CPP) v1.0.0
## Developer Specification & WebSocket Frame Schema

This specification details the standardized transport layers, WebSocket frames, and control sequences used to coordinate non-linear human-AI dialog under the Conversational Pivot Protocol (CPP).

---

### 1. Architectural Philosophy
The Conversational Pivot Protocol models dialogue as a **Directed Semantic Graph (DSG)** instead of a linear queue. When a user submits an interrupt or pivot, the backend must immediately halt current generation, preserve the partial state, and initiate a sibling branch.

```
                  [User Root Node]
                         |
                 [Assistant Node 1] (Completed)
                         |
                 [User Prompt 2]
                         |
           [Assistant Node 2 (Interrupted)]
                    /            \
                   /              \
         (Branch Sibling 1)     (Branch Sibling 2)
         [User Pivot Input]     [User Extension input]
                 |                        |
         [Assistant Node 3]     [Assistant Node 4]
```

---

### 2. Connection Handshake
CPP sessions are initiated over a stateful secure WebSocket (WSS) endpoint.
- **WSS Path:** `/v1/cpp/session`
- **Initial Handshake Request Headers:**
  ```http
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Protocol: cpp-v1.0.0
  X-Client-Sovereign-DID: did:key:z6MkpTHR8VNs...
  ```

---

### 3. WebSocket Frame Schemas

All payloads are serialized as JSON. Every frame must include a `type` envelope and a `timestamp`.

#### 3.1 Client-to-Server Control Frames

##### A. Initiate Pivot Frame (`CPP_PIVOT_INIT`)
Sent when a user types while generation is active and clicks "Pivot Mid-Stream". This commands the backend to halt generation immediately.

```json
{
  "type": "CPP_PIVOT_INIT",
  "timestamp": 1781100000000,
  "payload": {
    "interruptedNodeId": "msg_01h8v...",
    "activeThreadId": "thread_abc123",
    "userPrompt": "Wait, let's pivot and focus on the Rust implementation instead of Clojure.",
    "newBranchNodeId": "msg_01h8w..."
  }
}
```

##### B. Anchor Head-Pointer Frame (`CPP_ANCHOR_HEAD`)
Sent when a user clicks "Anchor" on a historical message node, retroactively setting that node as the head pointer for all future submissions.

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

#### 3.2 Server-to-Client Streaming & Control Frames

##### A. Generation Halted Frame (`CPP_STREAM_HALTED`)
Sent by the server to confirm that LLM stream generation was successfully halted, confirming the final length and character count of the partially generated node.

```json
{
  "type": "CPP_STREAM_HALTED",
  "timestamp": 1781100001200,
  "payload": {
    "interruptedNodeId": "msg_01h8v...",
    "finalContentLength": 324,
    "lastChunkReceived": "We can see that the SNN LIF..."
  }
}
```

##### B. DSG Tree Sync Frame (`CPP_SYNC_GRAPH`)
Dispatched by the server to synchronize the client state on connection or after structural modifications.

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
        "content": "Explain spiking neural networks."
      },
      "msg_01h8v1": {
        "id": "msg_01h8v1",
        "parentId": "msg_01h8v0",
        "childrenIds": ["msg_01h8w_p1", "msg_01h8w_p2"],
        "role": "assistant",
        "content": "Spiking Neural Networks are...",
        "status": "completed"
      }
    }
  }
}
```

---

### 4. Backend Cancellation & Splicing Algorithmic Logic

When the server receives a `CPP_PIVOT_INIT` frame:

1. **Active Stream Abort:**
   - Locate the active generation task/Promise corresponding to the `activeThreadId`.
   - Invoke `AbortController.abort()` or native thread interrupt on the model fetch task.
2. **Commit Partially Generated Node:**
   - Update the DB/Firestore record for `interruptedNodeId`:
     - Set `status = "interrupted"`
     - Trim text content to match the last synchronized chunk.
3. **Insert Branch Node:**
   - Create a new User node with `id = newBranchNodeId`, mapping `parentId = interruptedNodeId`.
   - Update `childrenIds` of `interruptedNodeId` to append `newBranchNodeId`.
4. **Instantly Spawn Sibling Assistant Node:**
   - Create a new Assistant node with parent `newBranchNodeId`.
   - Fire a new LLM generation stream and pipe responses back to the client.

---

### 5. SDK Quick Start

#### `@promethea/cpp-client`
```javascript
import { CPPClient } from '@promethea/cpp-client';

const client = new CPPClient({
  endpoint: 'wss://lvhllc.org/v1/cpp/session',
  did: 'did:key:z6MkpTHR8VNs...'
});

// Intercept streaming generation
client.pivot({
  userPrompt: 'Let us pivot to Rust implementation instead.',
  onStream: (chunk) => {
    console.log('Streaming new branch:', chunk);
  }
});
```

#### `@promethea/cpp-server`
```javascript
import { CPPServer } from '@promethea/cpp-server';

const server = new CPPServer({ port: 8080 });

server.on('pivot', async (context) => {
  console.log('Halting active stream for thread:', context.threadId);
  await context.abortActiveStream();
  
  console.log('Splicing thread tree and spawning sibling...');
  await context.spawnSiblingStream();
});
```
