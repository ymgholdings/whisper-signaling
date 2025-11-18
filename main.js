// WH15P3R Minimal Signaling Server for Deno Deploy
// Zero dependencies, pure Deno
// CRITICAL: No data persistence - all ephemeral in-memory only

const sessions = new Map();

// Cleanup old sessions
setInterval(() => {
  const now = Date.now();
  for (const [code, session] of sessions.entries()) {
    if (!session.lastActivity || now - session.lastActivity > 600000) {
      sessions.delete(code);
    }
  }
}, 300000);

Deno.serve((req) => {
  const url = new URL(req.url);

  // Health check
  if (url.pathname === '/health') {
    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        sessions: sessions.size 
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }

  // WebSocket upgrade
  if (req.headers.get('upgrade') === 'websocket') {
    const { socket, response } = Deno.upgradeWebSocket(req);
    let sessionCode = null;
    
    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        
        if (data.type === 'join') {
          sessionCode = data.sessionCode;
          if (!sessions.has(sessionCode)) {
            sessions.set(sessionCode, {
              initiator: null,
              joiner: null,
              lastActivity: Date.now()
            });
          }
          
          const session = sessions.get(sessionCode);
          session.lastActivity = Date.now();
          
          if (data.isInitiator) {
            session.initiator = socket;
          } else {
            session.joiner = socket;
          }
          
          if (session.initiator && session.joiner) {
            send(session.initiator, { type: 'ready' });
            send(session.joiner, { type: 'ready' });
          }
        } else {
          relay(data);
        }
      } catch (err) {
        console.error('Message error:', err);
      }
    };
    
    socket.onclose = () => {
      if (sessionCode && sessions.has(sessionCode)) {
        const session = sessions.get(sessionCode);
        if (session.initiator === socket) session.initiator = null;
        if (session.joiner === socket) session.joiner = null;
        if (!session.initiator && !session.joiner) {
          sessions.delete(sessionCode);
        }
      }
    };
    
    return response;
  }

  // Root
  return new Response('WH15P3R Signaling Server', { 
    status: 200,
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
});

function send(socket, data) {
  try {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  } catch (e) {
    // Ignore
  }
}

function relay(data) {
  const { sessionCode } = data;
  if (!sessions.has(sessionCode)) return;
  
  const session = sessions.get(sessionCode);
  session.lastActivity = Date.now();
  
  if (session.initiator && session.joiner) {
    if (data.type === 'offer' || data.type === 'ice-candidate') {
      send(session.joiner, data);
    } else if (data.type === 'answer') {
      send(session.initiator, data);
    }
  }
}