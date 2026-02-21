# INFERIS Ecosystem Roadmap
## Secret Menu LLC — Antigravity Division
**Updated: 2026-02-21 | Build: Ghidorah (v5)**

---

## System Overview

INFERIS is a multi-agent creative AI engine powering all four Secret Menu revenue tiers. The architecture has evolved through five named builds:

| Build | Codename | Status |
|---|---|---|
| v1–v3 | SOLUS FORGE | Archived |
| v4 | Three-Headed Monster | ✅ Core shipped (Phase 1–2 unblocked) |
| v5 | **Ghidorah** | 🔥 Active — Phases 6+7 in progress |

The current production stack lives across two repos:
- **`ChopperD00/solus-forge-next`** — Production UI (Next.js 14, Framer Motion, GSAP, Tailwind, Zustand)
- **`ChopperD00/inferis`** — Headless engine (`@inferis/core`, TypeScript monorepo)

Deployed at **inferis.app** via Vercel (`prj_bMN2R60NyQjn2b4HS9tnl9qqTY9i`).

---

## Hardware Fleet

### ARK-001 — HERBIE (Primary Compute)
- **Role**: Memory · Compute · Mesh Node
- **Services running**: Qdrant `:6333` · Mem0 `:8080` · Inferis Console `:3141` · **Tailscale (ACTIVE)**
- **Auto-start**: `com.secretmenu.inferis` + `com.secretmenu.mem0` launchd plists (see `launchd/` in inferis repo)
- **Tailscale hostname**: `herbie`
- **Status**: ✅ Online — Mesh node confirmed

### EDGE-001 — XU4 (Vessel Node)
- **Role**: Vessel · GPIO · Tailscale Relay
- **Services deployed**: VesselRuntime · SafetyGate (watchdog armed) · GPIOAdapter (blink test ready)
- **Tailscale hostname**: `xu4-memory`
- **OS**: DietPi · SSD boot · Static IP
- **Status**: ✅ Online — Phase 7.0 complete, blink test queued

### CLOUD — Gateway
- **Role**: API Gateway · Vercel Edge · Tailscale node (pending)
- **Status**: 🔄 Partial — Vercel edge active, Tailscale join pending

### STUDIO — Mac Pro 5,1
- **Role**: Local render · Asset cache
- **Status**: ⏳ Boot drive rebuild queued

---

## Build Status: Three-Headed Monster (v4)

Phase 1 is the foundation for everything above it.

| Phase | Name | Status |
|---|---|---|
| Phase 0 | Bootstrap | ✅ Complete |
| Phase 1 | Proof of Life | ✅ **SHIPPED** — `anthropic.ts`, `runtime.ts`, `http.ts` (commit `6d478b1`) |
| Phase 2 | Orchestrator Pipeline | ✅ **UNBLOCKED** — `pipeline.ts` + `chief.ts` + `types.ts` fixed (commit `8c22f6a`, Feb 21) |
| Phase 3 | Memory | ⏳ Queued — `context.ts`, `vector.ts`, `local-rag.ts` |
| Phase 4 | Quality Gates | ⏳ Queued — Gauntlet, Crucible |
| Phase 5 | Nervous System | ✅ Complete — WebSocket transport, MessageRouter, agent bus |

**Phase 2 fix (Feb 21):** `getStepKey()` helper + `stepId` field added to `PipelineStep`. `validatePipeline()` and `resolveReadySteps()` now key by stepId — same agent can handle multiple pipeline steps without collision. `chief.ts` passes `task.taskId` as `stepId` and `task.dependsOn` directly. `/api/execute` ForgeChief multi-agent pipelines are unblocked.

---

## Build Status: Ghidorah (v5)

### Phase 6 — Distributed Coordination ("The Mesh")

Extend the Phase 5 agent bus across physical nodes via Tailscale. No gossip protocol needed — Tailscale handles discovery, NAT traversal, and encryption.

| Step | Name | Files | Status |
|---|---|---|---|
| 6.0 | Tailscale mesh validation | — | ✅ **DONE** — HERBIE + XU4 nodes confirmed |
| 6.1 | Node Registry | `registry.ts` | ✅ **Coded** |
| 6.2 | Distributed Router | `distributed-router.ts` | ✅ Coded |
| 6.3 | Consensus | `consensus.ts` | ✅ Coded |
| 6.4 | Smart Gateway | — | ⏳ Build queued |
| 6.5 | Cross-node memory sync | — | ⏳ Build queued |

**Key architectural decisions:**
- **WebSocket over gRPC** — Fleet size (3 nodes) doesn't justify protobuf/codegen complexity
- **Qdrant over Redis** — Node registry stored in existing Qdrant instance on HERBIE; no new service
- **Quorum vote** — 2-of-3 for FORGE_CHIEF cluster decisions (consensus.ts)

### Phase 7 — Physical Manifestation ("The Vessel")

Bridge the neural mesh into physical hardware. Two-layer architecture: AI layer decides intent (1–5s), Vessel layer executes actuation (<100ms) without cloud round-trip.

| Step | Name | Files | Status |
|---|---|---|---|
| 7.0 | Vessel ground zero | — | ✅ **LIVE** (DietPi + Tailscale + SSD boot complete) |
| 7.1 | Blink test | `gpio.ts`, `runtime.ts` | 🔥 **NEXT** — vessel code deployed, GPIO ready |
| 7.2 | MQTT bridge | `mqtt.ts` | ⏳ Queued (ESP32 target) |
| 7.3 | HERBIE spatial context | — | ⏳ Queued |
| 7.4 | SafetyGate hardening | `safety-gate.ts` | ✅ Coded |
| 7.5 | Séance WebXR | `xr/index.ts` | ⏳ Q1 2027 |
| 7.6 | ROS2 / Mobile unit | `ros2.ts` | ⏳ Q2 2027 (deferred) |

**SafetyGate is non-negotiable.** All physical commands pass through it. Watchdog timer (5s heartbeat), hard current/PWM limits, e-stop bypass lane that no agent can override.

---

## Ghidorah File Registry

| File | Package | Purpose | Status |
|---|---|---|---|
| `agents/consensus.ts` | `@inferis/core` | Quorum vote — 2-of-3 FORGE_CHIEF cluster | ✅ Coded |
| `mesh/registry.ts` | `@inferis/core` | Node heartbeat + capability registration | ✅ **Coded** |
| `mesh/distributed-router.ts` | `@inferis/core` | Cross-node MessageRouter + nodeId envelope | ✅ Coded |
| `transport/websocket.ts` | `@inferis/core` | WebSocket transport (updated: nodeId + NodeRecord) | ✅ Updated |
| `types.ts` | `@inferis/core` | NodeRole, NodeRecord, stepId types added | ✅ Updated |
| `vessel/runtime.ts` | `@inferis/vessel` | Local execution engine for physical commands | 🔥 Deploy |
| `vessel/safety-gate.ts` | `@inferis/vessel` | Hardware interlock — watchdog, limits, e-stop | ✅ Coded |
| `vessel/adapters/gpio.ts` | `@inferis/vessel` | XU4 GPIO adapter — blink test entry point | ✅ Coded |
| `vessel/adapters/mqtt.ts` | `@inferis/vessel` | ESP32/Arduino MQTT bridge | ✅ Coded |
| `vessel/adapters/ros2.ts` | `@inferis/vessel` | ROS2 adapter (deferred — mobile unit) | ⏳ Deferred |
| `seance/xr/index.ts` | `@inferis/seance` | Séance WebXR AR layer | ⏳ Q1 2027 |
| `orchestrator/pipeline.ts` | `@inferis/core` | stepId-based step tracking — ForgeChief pipeline engine | ✅ Fixed (Feb 21) |
| `orchestrator/chief.ts` | `@inferis/core` | ForgeChief — taskId as stepId, deps passed directly | ✅ Fixed (Feb 21) |
| `console/inferis-server.js` | Console | v0.6.0 — mesh bridge :3141→:3142, auto-reconnect | ✅ Done (Feb 21) |
| `launchd/com.secretmenu.inferis.plist` | HERBIE | launchd auto-start for inferis-server.js | ✅ Done (Feb 21) |
| `launchd/com.secretmenu.mem0.plist` | HERBIE | launchd auto-start for Mem0 → Qdrant | ✅ Done (Feb 21) |

---

## Current Sprint (Feb 2026)

Priority order:

1. **Phase 6.0 Mesh Ping** — ✅ **DONE** — HERBIE + XU4 Tailscale nodes confirmed online
2. **Phase 7.1 Blink Test** — HAWK issues `{ action: 'gpio_toggle', pin: 17 }` → SafetyGate → GPIOAdapter → LED on XU4. Target <100ms execution latency. **🔥 NEXT — Vessel code is live.**
3. **pipeline.ts fix** — ✅ **DONE** — `getStepKey()` + `stepId` tracking, commit `8c22f6a`. `/api/execute` ForgeChief pipelines unblocked.
4. **launchd auto-start** — ✅ **DONE** — `com.secretmenu.inferis.plist` + `com.secretmenu.mem0.plist` pushed to `launchd/`.
5. **Console mesh bridge** — ✅ **DONE** — `inferis-server.js` v0.6.0: `startMeshBridge()` added, `:3141` → `:3142` WS client with 5s auto-reconnect.
6. **Mac Pro 5,1** — Boot drive rebuild. Queued — not blocking anything active.

---

## Séance — Creative Direction Interface

The AR-native direction layer between Phil's creative intent and agent execution.

- **4-zone layout**: Live Preview · Direction Panel (mood sliders) · Agent Log · Scene State
- **Sliders**: INTENSITY · ORGANIC · WARMTH · SPEED · DENSITY · GRIT → map to component parameters
- **Phase 7.5 integration**: Séance WebXR renders agent entity positions as holographic overlays via SSE stream from mesh. Interaction in AR triggers physical vessel response.
- **Status**: Standalone prototype phase. Parameter binding → Agent integration → Séance backend (roadmap)

---

## Good Lookin' Corpse — Proving Ground

GLC is the live proving ground for INFERIS workflows.

- **Repo**: `ChopperD00/good-lookin-corpse` · branch: `valentine-teaser`
- **Stack**: Next.js 15 · React 19 · Three.js 0.170 · Tailwind 3.4
- **Design language**: Procedural canvas particles · Phase-based state machines · TV static/glitch · Coffin aesthetic
- **Vercel**: `prj_Q5Aq0ypI96pV4xoIKN3kRq9G5ef2`
- **Role**: Any INFERIS agent pipeline that ships successfully here gets promoted to the production fleet

---

## Roadmap Timeline

| Milestone | Focus | ETA |
|---|---|---|
| **7.0: Ground Zero** | xu4 vessel — DietPi, Tailscale, SSD boot | ✅ **DONE** |
| **6.0: Mesh Validation** | Tailscale 3-node ping, baseline health | ✅ **DONE** |
| **pipeline.ts fix** | ForgeChief step-tracking, `/api/execute` | ✅ **DONE** (Feb 21) |
| **Console mesh bridge** | `:3141` → `:3142` WS client, 5s auto-reconnect | ✅ **DONE** (Feb 21) |
| **launchd auto-start** | Mem0 + Inferis gateway on HERBIE boot | ✅ **DONE** (Feb 21) |
| **7.1: Blink Test** | GPIO blink via HAWK command, SafetyGate | 🔥 **NOW** |
| **6.1: Discovery** | Node registry, heartbeat, Qdrant-backed | Q2 2026 |
| **6.2: Distributed Router** | Cross-node MessageRouter + envelope | Q2 2026 |
| **6.3: Consensus** | quorum vote for FORGE_CHIEF cluster | Q2 2026 |
| **6.4: Smart Gateway** | HAWK cross-node delegation, load-aware routing | Q3 2026 |
| **7.2: MQTT Bridge** | ESP32 integration, MQTT broker on vessel | Q3 2026 |
| **6.5: Memory Sync** | Cross-node HERBIE context replication | Q3 2026 |
| **7.3: Spatial Context** | HERBIE room model, spatially-aware agents | Q4 2026 |
| **7.4: Safety Hardening** | Watchdog certification, current limits, E-stop | Q4 2026 |
| **7.5: Séance WebXR** | AR direction interface, agent entity rendering | Q1 2027 |
| **7.6: ROS2 / Mobile** | Full mobile unit, kinematics, Nav2 | Q2 2027 |

---

## Runbook Note: Ghidorah vs. Original Plan

The original Phases 6+7 runbook (`Runbook_6+7`) outlined a generic distributed architecture. Ghidorah supersedes it with hardware-specific decisions:

| Topic | Original Plan | Ghidorah Decision | Reason |
|---|---|---|---|
| Node discovery | Gossip protocol or centralized registry | **Tailscale** | Already deployed, handles NAT + encryption |
| State storage | Redis or CRDTs | **Qdrant** | Already running on HERBIE; no new service |
| Transport | WebSocket or gRPC | **WebSocket** | Fleet of 3 nodes doesn't justify protobuf |
| Timeline | 7.1 Handshake: Q1 2027 | **7.0 done NOW** | xu4 vessel already online — ~1yr ahead |
| Safety | "Hard-coded overrides" | **SafetyGate** (full impl) | Watchdog + e-stop + current limits coded |
| AR layer | Unity/Unreal suggested | **WebXR via Séance** | No separate ecosystem; SSE-native |
| **Gossip protocol?** | Considered for agent hand-offs | **No — not needed** | Tailscale handles discovery; NodeRegistry TTL heartbeat is gossip-equivalent for a 3-node fleet. Adding gossip would add complexity with zero gain at this scale. |
| **Pipeline step tracking** | Agent callsign as step key | **`stepId` field** | Allows same agent on multiple pipeline steps; `getStepKey(step)` = `step.stepId ?? step.agent` preserves backwards compat |

---

*INFERIS Ecosystem Roadmap — Antigravity / Secret Menu LLC*
*Build: Ghidorah v5 — Three-Headed Monster v2.0 foundation*
