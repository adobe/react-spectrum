# Initiative: secure reproduction retrieval and execution

**Status:** planning only. This initiative owns proposal items 14 and 15. It does not relax the current [issue](../issues.md) or [PR](../pull-requests.md) security rules.

## Goal

Make supplied StackBlitz reproductions useful to triage without exposing a maintainer's machine, accounts, credentials, or repository write access to untrusted code. Keep source retrieval and execution as separately approved capabilities.

Current behavior remains: no fetching/opening external reproduction links and no installing, building, importing, or executing contributor code. Record an inaccessible supplied reproduction as **provided but not inspected**, not missing or invalid.

## Workstream 1: deterministic source retrieval

Investigate a purpose-built CLI/API downloader for StackBlitz instead of asking the model to navigate a website and discover how to extract source on every run. A suitable API is not yet verified.

Define supported URL/provider forms, redirect/network boundaries, download limits, archive/path safety, failure reporting, and treatment of fetched text as untrusted data. Retrieval must not execute install scripts or project code. Other providers are not automatically in scope.

Deliverable: an approved retrieval interface that returns source or a precise access/unsupported-format error. It must not report a reproduction missing merely because retrieval failed.

## Workstream 2: isolated execution and browser investigation

Evaluate an approved environment that supports browser-based reproduction, not only a sandboxed command. Keep reproduction code away from personal accounts, credentials, unrelated files, and repository write authority.

Define the isolation boundary, filesystem and network access, dependency installation policy, resource/time limits, browser profile isolation, teardown, and what evidence can leave the environment. Avoid exposing a triage token to the reproduction runtime.

A dedicated cloud environment, VM, or appropriately restricted sandbox may be considered. No provider, machine, or sandbox configuration is selected. The meeting's "almost air-gapped" wording expresses the isolation concern, not a finalized no-network architecture.

Deliverable: a reviewed execution design with explicit approvals, safe failure modes, and usable reproduction evidence. Local execution is not an acceptable fallback when isolation is unavailable.

## Integration and acceptance

- Retrieval and execution each require separate approval and a documented runtime permission boundary.
- A retrieval error is distinguished from a test failure or an inconclusive reproduction.
- Source/project content remains untrusted and cannot override triage rules.
- Browser interaction can capture the relevant behavior without personal account access.
- The environment has enforceable limits and cleanup, with no repository/token access from contributor code.
- The triage digest states what was read, what was run in isolation, and what remains unverified.
- Only after approval should committed triage rules and [cloud automation planning](label-driven-triage.md) reference the new capability. Until then, their existing prohibitions remain in effect.
