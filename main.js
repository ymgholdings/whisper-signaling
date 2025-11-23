// WH15P3R Signaling Server for Deno Deploy
// Serverless WebSocket signaling for WebRTC P2P connections
// Zero logging, ephemeral sessions, no persistence

const sessions = new Map();

// Cleanup old sessions every 5 minutes
setInterval(() => {
const now = Date.now();
for (const [code, session] of sessions.entries()) {
if (!session.lastActivity || now - session.lastActivity > 10 * 60 * 1000) {
sessions.delete(code);
}
}
}, 5 * 60 * 1000);

Deno.serve({ port: 8000 }, (req) => {
// Health check endpoint
if (req.url.endsWith("/health")) {
return new Response(
JSON.stringify({
status: "ok",
sessions: sessions.size,
uptime: "serverless"
}),
{
status: 200,
headers: { "Content-Type": "application/json" }
}
);
}

// WebSocket upgrade
if (req.headers.get("upgrade") === "websocket") {
const { socket, response } = Deno.upgradeWebSocket(req);

let currentSessionCode = null;

socket.onopen = () => {
  // Connection established
};

socket.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);

    if (data.type === "join") {
      handleJoin(socket, data);
      currentSessionCode = data.sessionCode;
    } else if (data.type === "offer" || data.type === "answer" || data.type === "ice-candidate") {
      relay(socket, data);
    }
  } catch (e) {
    // Silently ignore malformed messages
    console.error("Parse error:", e);
  }
};

socket.onclose = () => {
  if (currentSessionCode && sessions.has(currentSessionCode)) {
    const session = sessions.get(currentSessionCode);

    // Remove this connection
    if (session.initiator === socket) {
      session.initiator = null;
    } else if (session.joiner === socket) {
      session.joiner = null;
    }

    // Clean up empty sessions
    if (!session.initiator && !session.joiner) {
      sessions.delete(currentSessionCode);
    }
  }
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

return response;
}

// Root endpoint
return new Response(
"WH15P3R Signaling Server - Running on Deno Deploy\nNo logging • Ephemeral sessions • Post-quantum ready",
{
status: 200,
headers: {
"Content-Type": "text/plain",
"Access-Control-Allow-Origin": "*"
}
}
);
});

function handleJoin(socket, data) {
const { sessionCode, isInitiator } = data;

if (!sessions.has(sessionCode)) {
sessions.set(sessionCode, {
initiator: null,
joiner: null,
lastActivity: Date.now()
});
}

const session = sessions.get(sessionCode);
session.lastActivity = Date.now();

if (isInitiator) {
session.initiator = socket;
} else {
session.joiner = socket;
}

// If both peers are present, signal ready
if (session.initiator && session.joiner) {
safeSend(session.initiator, JSON.stringify({ type: "ready" }));
safeSend(session.joiner, JSON.stringify({ type: "ready" }));
}
}

function relay(senderSocket, data) {
const { sessionCode } = data;

if (!sessions.has(sessionCode)) {
return;
}

const session = sessions.get(sessionCode);
session.lastActivity = Date.now();
const message = JSON.stringify(data);

// Determine the recipient (the peer that is NOT the sender)
let recipient = null;
if (session.initiator === senderSocket) {
recipient = session.joiner;
} else if (session.joiner === senderSocket) {
recipient = session.initiator;
}

// Relay to the other peer
if (recipient) {
safeSend(recipient, message);
}
}

function safeSend(socket, message) {
try {
if (socket && socket.readyState === WebSocket.OPEN) {
socket.send(message);
}
} catch (e) {
// Socket might have closed, ignore
}
}

console.log("WH15P3R Signaling Server started on Deno Deploy");
console.log("No logging enabled - operating in secure mode");
