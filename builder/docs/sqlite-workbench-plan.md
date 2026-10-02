# Atelier SQLite workbench contract

Goal: implement the accepted SQLite upgrade, preserving automatic flow layout, version 1 JSON and portable export. Branch `feat/editor-workbench-upgrade`; one PR, no auto merge. Functional/review agents use gpt-6-luna xhigh; final aesthetics use gpt-6-astra low.

## Persistence and synchronization

Use Node 24 native SQLite in data/projects.sqlite: projects with save_version, revisions with kind/label, per-boot drafts and immutable received requests. WAL/FULL/5s busy timeout; consistent online backup before idempotent migration. No automatic pruning. Projects remain validated JSON documents.

Draft/request IDs globally unique, ownership immutable. Each boot gets a new draft ID with monotonic sequence. Reject old sequence; equal sequence/same hash acknowledges retry; equal sequence/different hash conflicts. Drafts never publish or create revisions. Stale base drafts remain recoverable. Draft uploads debounce 500ms/minimum 1s; manual snapshot flushes immediately.

Formal autos debounce 1.5s/minimum 10s. One request in flight; merge unsent autos, retain clicked manual snapshots FIFO. On sending, freeze UUID and own confirmed CAS chain, never fetch a newer other-client token to relabel an old snapshot. Retry unchanged payload at 2/5/15/30s. Register pending requests durably; process project FIFO in an IMMEDIATE transaction that rereads status, compares version, writes project/revision/completed receipt and marks only matching draft sequence/hash. Recover pending on restart. Canonical hash sorts object keys and preserves arrays, covering operation/project/client/base/kind/label/document. UUID hash mismatch conflicts. Equal-content auto creates no revision; manual/restore creates one. Absent project/base 0 creates token 1. Missing token 428, stale token 409.

Browser stores preferences/client ID only. Offline unsent changes are memory-only; accurate connection/save status and unload warning. Startup resolves own pending receipts before coordinating saved project/drafts. Offer recover draft, saved version, or copy to new project. Conflict pauses formal saves, permits draft upload. Before replacing edits, flush to SQLite or abort. Legacy cache validates and idempotently imports into a separate SQL draft, never overwrites projects; clear browser copy only after confirmed acknowledgement.

## Stages

0. Review/test/build/commit previous drag, 36 components, 16 motions and export work separately.
1. SQLite backup/migration, CAS receipts/FIFO/restart, drafts/history/health APIs and fixture tests.
2. Client sync/recovery/cache migration/offline state, manual then automatic save, named history. Restore checkpoints dirty edits first, then creates new revision. History desktop overlay/mobile fullscreen with focus handling.
3. Focus/restorable panels; fit/50/75/100/125 zoom; grid 8px, edge/center guides, 6 physical px snap, Alt bypass. Shift multi-select excludes ancestor duplicates, group movement/bounds and six alignments. Resize width ordinary nodes, both axes containers/images, square avatar, no divider handles; width 24 to parent content, height 32 to 2000, no container clipping. Strict size/Flex validation without legacy rewrite. Inherited locks protect geometry/reorder/delete and strip from export. End replay before gestures; one finish commit; page/mode/device/zoom/viewport cancellation restores temporary DOM without history/save.
4. Distinct static thumbnails for all 36; fresh-ID validated login/profile/product templates add new pages; text/button/card appearance presets preserve data/action/geometry. Isolated motion hover/focus/touch preview, click applies, previews cause no history/save, reduced motion respected. Local demo actions only.
5. Owned background Windows start/status/stop services; fixed loopback 5173/4310, workspace identity before reuse, conflicts never kill unrelated processes, no OS auto start. Astra low warm white/gray/terracotta styling, no gradient/remote font; desktop control 32px/touch 44px, collapsible desktop/mobile one panel. Independent review, CI, screenshots, PR.

## Verification

Migration repeats/backup restore; new save/CAS/duplicates/sequence order/pending restart/lost response; multiple clients/manual chain conflict/newer draft retention/cache import; offline editing/reconnect/unload. Canvas scale/scroll/nesting/bounds/snap/lock/resize/cancel/undo. Valid template IDs/actions and preview isolation. Browser 1440x900/1280x800/1024x768/390x844 with keyboard/touch entry points. Independent export TypeScript/build excludes SQL/receipts/drafts/editor state. Preserve existing regressions, add behavioral checks, independently review stages before commit.

SQLite architecture passed sealed three-room planning review; native collaboration substituted because invoke_subagent is unavailable. No code changes to that contract without review.
