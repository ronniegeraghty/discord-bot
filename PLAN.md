# Ron-bot Project Plan

Living checklist for the modernization, hardening, and feature work. Check items off (`- [x]`) as they land.

**Locked decisions**
- **YouTube engine:** `yt-dlp` via [`youtube-dl-exec`](https://www.npmjs.com/package/youtube-dl-exec) (most reliable for self-hosting; needs Python 3.9+). Pure-JS fallback: [`youtubei.js`](https://github.com/LuanRT/YouTube.js).
  - _Why:_ `@distube/ytdl-core` was **archived by its maintainer on 2025-08-16** and no longer works against YouTube.
- **Monorepo:** Turborepo (`apps/*`, `packages/*`) with shared TypeScript types.
- **Tests:** Vitest.
- **Stream client:** cross-platform Node.js + TypeScript terminal CLI.
- **Transport:** WebSocket over TLS (`wss`).

---

## 1. Modernization — ✅ complete
- [x] Restore the completed implementation from `main` onto a working branch
- [x] Security quick win (`npm audit fix`, 14 → 8 vulns, track `package-lock.json`)
- [x] discord.js 13 → 14 (intents, builders, embeds, interactions)
- [x] `@discordjs/voice` 0.7 → 0.19, mongoose 6 → 9 (async/await), REST/Routes from discord.js
- [x] Drop native `@discordjs/opus` → pure-JS `opusscript`
- [x] `undici` override → **0 vulnerabilities**
- [x] Build / type-check / runtime module-load verified
- [x] Repo hygiene + standards (Node 24 Dockerfile, CI action bumps, LICENSE, editorconfig, nvmrc, prettier)
- [x] Push branch to origin; fix remote URL to canonical `discord-bot`
- [x] Live smoke test: Docker stack up, Discord login, MongoDB connect, audio deps detected

## 2. Bug diagnosis — ✅ complete
- [x] RPS crash: `users.cache.get(winner).tag` → `undefined.tag` throws
- [x] `/play`: `@distube/ytdl-core` can't decipher YouTube (library archived Aug 2025)
- [x] `EACCES`: container non-root user can't write ytdl debug file to `/app`
- [x] No crash isolation: one command error kills the whole process

## Phase 0 — Stabilization (in progress)
- [x] Fix RPS crash (resolve winner from `i.user`/`i.client.user`, no cache)
- [x] `Track.createAudioResource` rejects gracefully (`stream.on('error')` + `demuxProbe().catch()`)
- [x] Global `unhandledRejection` / `uncaughtException` handlers
- [x] Rebuild container & re-verify (RPS works)

## Phase 1 — Fix YouTube playback ✅
- [x] Add `youtube-dl-exec` (yt-dlp); remove `@distube/ytdl-core`
- [x] Wire yt-dlp streaming into `Track` / `Subscription`
- [x] Container: install `python3` + yt-dlp (streams to stdout, no writable cwd needed)
- [x] Re-test playback end-to-end in Discord (play / pause / queue / skip / leave confirmed working)

## Phase 2 — Hardening & reorganization (Turborepo)
- [x] Convert to Turborepo monorepo: `apps/bot` + `packages/protocol` (shared types) via npm workspaces + turbo _(`apps/stream-client` added in Phase 4)_
- [ ] Introduce `AudioSource` abstraction (pluggable engine: YouTube / file / live stream) — _moved from Phase 1_
- [x] Centralized config validation (`zod`, fail-fast on missing env)
- [x] Structured logging (`pino`) replacing `console.log`
- [x] Command error wrapper (consistent catch + ephemeral reply)
- [x] Fix deprecations: `ephemeral` → `flags: MessageFlags.Ephemeral`; `ready` → `clientReady`
- [x] Graceful shutdown (SIGTERM/SIGINT, re-entry guard, force-exit timeout) _(health/readiness endpoint moved to Phase 4 with the stream server)_

## Phase 3 — Tests without Discord (Vitest)
- [ ] Vitest setup + `npm test`
- [ ] Unit tests: URL parsing (`getURLType`), `RPS.calcWinner`, queue logic
- [ ] Command tests with mocked interactions (assert replies)
- [ ] `AudioSource` contract tests (mock extractor → error paths)
- [ ] ESLint (flat config) + prettier
- [ ] CI: typecheck + lint + test job (on PR)

## Phase 4 — Feature: stream local PC audio → ronbot → voice channel
- [ ] `packages/protocol`: auth handshake + Opus frame message format
- [ ] Bot WebSocket stream server + `/stream start` / `/stream stop`
- [ ] Feed incoming Opus → `createAudioResource({ inputType: Opus })` → play in VC (reuse `MusicSubscription`)
- [ ] Cross-platform Node/TS CLI client (capture → Opus encode → `wss` stream)
- [ ] Audio capture via a virtual audio device the user routes to (BlackHole / VB-CABLE / PulseAudio null-sink)
- [ ] Security: single-use session tokens, `wss`/TLS, per-user binding, max duration
- [ ] Docs: setup guide + networking notes (local vs remote bot)

## Phase 5 — Feature enhancements
- [ ] **RPS player-vs-player mode** — challenge another user instead of the bot
  - [ ] Add an optional `opponent` user option to `/rps` (keep the current solo vs-bot mode when it's omitted)
  - [ ] Post the hand buttons and wait for exactly one pick from **both** the initiator and the named opponent; ignore clicks from anyone else
  - [ ] Keep each player's choice hidden until both have picked (acknowledge each pick privately/ephemerally so neither sees the other's hand early)
  - [ ] Reveal both hands + the winner once both have submitted
  - [ ] Handle a timeout if the opponent never responds (cancel the match and notify)
