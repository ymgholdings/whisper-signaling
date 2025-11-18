# WH15P3R Signaling Server

Ephemeral WebSocket signaling server for WH15P3R post-quantum encrypted P2P chat.

**Live URL:** `https://whisper-signaling-20.ymgholdings.deno.net`

-----

## Critical Security Properties

### ⚠️ ZERO DATA PERSISTENCE

**This server intentionally stores NOTHING:**

- ❌ No database
- ❌ No file writes
- ❌ No logs of message content
- ❌ No session history
- ❌ No user data
- ❌ No encryption keys

**All data is ephemeral in-memory only:**

- Session data exists only during active connections
- Destroyed when connections close
- Automatically cleaned up after 10 minutes of inactivity
- Server restart = complete memory wipe

### What This Server Does

**Purpose:** Facilitate WebRTC peer-to-peer connection setup ONLY

**Sees:**

- Random session codes (e.g., “A3F7B9E2C1D4”)
- WebSocket connection metadata
- WebRTC signaling messages (SDP offer/answer/ICE candidates)

**Does NOT See:**

- Message content (transmitted P2P, not through server)
- Encryption keys (generated client-side)
- User identities (no authentication)
- Chat history (no storage)

**After P2P connection established:** Server is no longer involved in communication.

-----

## Technical Implementation

**Runtime:** Deno Deploy (Serverless)  
**Language:** JavaScript (Deno)  
**Dependencies:** Zero (pure Deno standard library)

**Architecture:**

```
Client A ──┐
           ├──→ Signaling Server (WebSocket relay)
Client B ──┘         ↓
                Facilitates WebRTC handshake
                     ↓
Client A ←────────────────────────────────→ Client B
              Direct P2P Connection
         (Server no longer involved)
```

**Data Flow:**

1. Clients connect via WebSocket (WSS)
1. Exchange WebRTC signaling messages through server
1. Establish direct P2P connection
1. Server connection closes
1. All server-side data destroyed

-----

## Deployment

**Platform:** Deno Deploy (Serverless)  
**Repository:** `ymgholdings/whisper-signaling`  
**Entry Point:** `main.js`  
**Hosting:** Automatic deployment from GitHub

**Deployment Process:**

1. Push changes to GitHub `main` branch
1. Deno Deploy automatically detects changes
1. Builds and deploys in ~30 seconds
1. Zero downtime updates
1. Automatic rollback on errors

**Cost:** FREE (Deno Deploy free tier)

-----

## Security Architecture

### Permissions (Minimal)

Deno Deploy runs with restricted permissions:

```
✅ Network access: Required for WebSocket server
❌ File system read: DENIED
❌ File system write: DENIED  
❌ Environment variables: DENIED
❌ Subprocess execution: DENIED
```

**This prevents:**

- Writing logs to disk
- Reading sensitive files
- Running external processes
- Accessing configuration secrets

### Threat Model

**This server protects against:**

- ✅ Server seizure (nothing to seize)
- ✅ Data breach (no data to breach)
- ✅ Retroactive surveillance (nothing stored)
- ✅ Legal data requests (nothing to provide)

**This server does NOT protect against:**

- ❌ Real-time network monitoring during handshake
- ❌ Traffic analysis (timing, frequency patterns)
- ❌ Compromised endpoints (client devices)
- ❌ Man-in-the-middle attacks (mitigated by client-side verification)

**Metadata visible to Deno Deploy:**

- Connection timestamps
- IP addresses (during WebSocket handshake)
- Session codes (random strings with no semantic meaning)

**Metadata NOT visible:**

- Message content (end-to-end encrypted)
- Encryption keys (never touch this server)
- User identities (no authentication system)

-----

## API Endpoints

### Health Check

```
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "sessions": 0
}
```

**Purpose:** Monitoring and uptime checks  
**Sessions count:** Number of currently active signaling sessions (not total users)

### WebSocket Endpoint

```
WSS /
```

**Protocol:** WebSocket Secure (WSS)  
**Purpose:** WebRTC signaling relay  
**Authentication:** None (by design)

**Message Types:**

- `join`: Client joining a session
- `offer`: WebRTC offer (initiator → joiner)
- `answer`: WebRTC answer (joiner → initiator)
- `ice-candidate`: ICE candidate exchange (bidirectional)

-----

## Monitoring

**Available Metrics:**

- Active sessions count (via `/health`)
- Request count (Deno Deploy dashboard)
- Error rates (Deno Deploy dashboard)
- Response times (Deno Deploy dashboard)

**NOT Logged:**

- Message content
- Session codes
- User identities
- WebRTC signaling payload details

**Monitoring Philosophy:** Track operational health, not user activity.

-----

## Privacy Guarantees

### What Can Be Observed

**By Deno Deploy (platform operator):**

- Number of concurrent WebSocket connections
- Connection timestamps
- Aggregate request counts

**By network observer:**

- Encrypted WebSocket traffic (TLS 1.3)
- Connection timing and frequency
- Cannot see content (encrypted)

### What CANNOT Be Observed

**By anyone (including server operator):**

- Message content (P2P encrypted)
- Encryption keys (client-side only)
- User identities (no authentication)
- Chat history (no storage)
- Message recipients (after P2P established)

-----

## Code Audit

**Codebase Size:** ~100 lines of JavaScript  
**Dependencies:** Zero external packages  
**Complexity:** Minimal (by design)

**Audit Recommendation:**  
This code is simple enough to audit in 10-15 minutes. We encourage security researchers to review.

**Security Principle:** Simple code = fewer vulnerabilities

-----

## Compliance

**GDPR (General Data Protection Regulation):**

- ✅ No personal data collected
- ✅ No data retention (zero storage)
- ✅ Right to erasure: N/A (nothing to erase)
- ✅ Data portability: N/A (nothing to export)

**Data Breach Notification:**

- Not applicable (no data to breach)
- Session codes are random strings with no value

**Legal Requests:**

- Cannot provide message content (not stored)
- Cannot provide chat history (not stored)
- Cannot provide encryption keys (never possessed)
- Can only provide: Active session count and basic operational metrics

-----

## Disaster Recovery

**Server Failure:**

- Impact: Users cannot establish NEW connections
- Users with EXISTING P2P connections: Unaffected (direct P2P)
- Recovery: Automatic (Deno Deploy redundancy)
- Data Loss: None (nothing stored)

**Deployment Rollback:**

- Automatic on critical errors
- Manual rollback available via Deno Deploy dashboard
- No data migration needed (stateless)

**Backup Strategy:**

- Not needed (no state to back up)
- Configuration stored in GitHub (version controlled)

-----

## Performance

**Expected Performance:**

- Latency: <50ms (edge network)
- Throughput: Thousands of concurrent sessions
- Scaling: Automatic (serverless)
- Geographic: Global edge deployment

**Bottlenecks:**

- WebSocket connection limits (handled by Deno Deploy)
- Memory for active sessions (minimal footprint)

-----

## Operational Notes

**Maintenance:** Zero ongoing maintenance required  
**Updates:** Automatic via GitHub commits  
**Monitoring:** Deno Deploy dashboard  
**Alerts:** Configure via Deno Deploy (optional)  
**Costs:** FREE (within generous limits)  
**Scaling:** Automatic (no configuration needed)

-----

## Development

**Local Testing:**

```bash
# Clone repository
git clone https://github.com/ymgholdings/whisper-signaling.git
cd whisper-signaling

# Run locally
deno run --allow-net main.js

# Test
curl http://localhost:8000/health
```

**Making Changes:**

1. Edit `main.js`
1. Test locally with Deno
1. Commit to GitHub
1. Deno Deploy auto-deploys
1. Verify at production URL

-----

## Security Incident Response

**If Server Compromised:**

**Attacker Gains:**

- Active session codes (random strings, no semantic value)
- Current connection count

**Attacker Does NOT Gain:**

- Message content (never touches server)
- Encryption keys (client-side only)
- User identities (no authentication system)
- Historical data (nothing stored)

**Impact:** Minimal (ephemeral design limits damage)

**Response:**

1. Redeploy from GitHub (clean deployment)
1. Monitor for unusual patterns
1. No user notification needed (no data compromised)
1. Review Deno Deploy logs (if available)

**No persistent data = minimal breach impact**

-----

## Related Projects

**Main Repository:** [whisper-chat](https://github.com/ymgholdings/whisper-chat)  
**Documentation:** See main repository for user guides and security assessment  
**Client Application:** Deployed separately (GitHub Pages or custom domain)

-----

## Technical Support

**Platform Issues:** Contact Deno Deploy support  
**Code Issues:** Open issue on GitHub repository  
**Security Concerns:** Report responsibly via GitHub issues (private disclosure)

-----

## License

Open source - use responsibly and ethically.

-----

## Acknowledgments

- **Deno Team:** For serverless platform
- **WebRTC Working Group:** For P2P standards
- **NIST:** For post-quantum cryptography standards

-----

**Last Updated:** November 2025  
**Version:** 1.0.0  
**Status:** Production  
**Uptime:** Monitor at `/health` endpoint