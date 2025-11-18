# WH15P3R Signaling Server

Ephemeral WebSocket signaling server for WH15P3R post-quantum encrypted P2P chat.

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

## Technical Implementation

**Runtime:** Deno Deploy (Serverless)

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

1. Clients connect via WebSocket
1. Exchange WebRTC signaling messages through server
1. Establish direct P2P connection
1. Server connection closes
1. All server-side data destroyed

## Permissions

**Deno Deploy is configured with minimal permissions:**

```json
{
  "allow-net": true,     // Required for WebSocket server
  "allow-read": false,   // NO file read access
  "allow-write": false,  // NO file write access
  "allow-env": false,    // NO environment variable access
  "allow-run": false     // NO subprocess execution
}
```

**This prevents:**

- Writing logs to disk
- Reading sensitive files
- Running external processes
- Accessing environment variables

## Deployment

**Hosted on:** Deno Deploy (serverless)

**Deployment method:** Automatic from GitHub

**Update procedure:**

1. Push changes to GitHub
1. Deno Deploy automatically redeploys
1. Zero downtime updates

## Monitoring

**Health check endpoint:** `/health`

Returns:

```json
{
  "status": "ok",
  "sessions": 0
}
```

**Session count** indicates currently active signaling sessions (not message count).

**No other metrics collected** - intentional privacy design.

## Code Audit

**Total lines of code:** ~100 lines

**Dependencies:** Zero (pure Deno)

**Audit recommendation:** This code is simple enough to audit in 10 minutes.

**Security principle:** Simple code = fewer vulnerabilities

## Privacy Guarantees

### What can be observed (metadata):

By operator (Deno Deploy):

- Number of concurrent connections
- Connection timestamps
- Session codes (random strings with no meaning)

By network observer:

- Encrypted WebSocket traffic (TLS 1.3)
- Cannot see content (encrypted)
- Can see timing and connection patterns

### What CANNOT be observed:

- Message content (P2P encrypted)
- Encryption keys (never touch this server)
- User identities (no authentication)
- Chat history (no storage)
- Message recipients (after P2P established)

### Threat Model

**This server protects against:**

- ✅ Server seizure (nothing to seize)
- ✅ Data breach (no data to breach)
- ✅ Retroactive surveillance (nothing stored)

**This server does NOT protect against:**

- ❌ Real-time network monitoring during handshake
- ❌ Traffic analysis (timing, frequency patterns)
- ❌ Compromised endpoints
- ❌ Man-in-the-middle during signaling (mitigated by out-of-band verification)

## Compliance

**GDPR:** No personal data collected or stored

**Data retention:** Zero (ephemeral only)

**Right to erasure:** N/A (nothing to erase)

**Data portability:** N/A (nothing to export)

**Legal requests:** Nothing to provide

## Operational Notes

**Scaling:** Automatic (serverless)

**Availability:** Deno Deploy SLA (~99.9%)

**Maintenance:** Zero (automatic updates)

**Costs:** Free tier (generous limits)

**Backup:** Not needed (stateless)

## Security Incident Response

**If server compromised:**

1. Attacker gains: Active session codes (random strings)
1. Attacker does NOT gain: Message content, encryption keys, chat history
1. Impact: Minimal (all data ephemeral)
1. Response: Redeploy, rotate if needed

**No persistent data = minimal breach impact**

## Related Repositories

**Client Application:** [whisper-chat](https://github.com/ymgholdings/whisper-chat)

**Documentation:** See main repo

## License

Open source - use responsibly

## Contact

For security issues, please report responsibly.

-----

**Last Updated:** November 2025

**Version:** 1.0.0

**Status:** Production