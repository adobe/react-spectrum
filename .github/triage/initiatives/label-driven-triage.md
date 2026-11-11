# Initiative: label-driven triage lifecycle and cloud execution

**Status:** planning only. Current triage remains a GitHub read-only dry run; no workflow, token, scheduler, or host changes are authorized by this document.

This initiative owns proposal items 10, 12, 13, the future human-handled selection policy from item 11, and cloud execution from item 16. Keep it separate from the current [issue](../issues.md) and [PR](../pull-requests.md) rules so it can evolve independently.

## Goal and accepted boundaries

- Replace selection based only on "created in the last 24 hours" with an explicit label-driven queue for eligible issues and PRs.
- Keep deterministic event/check handling separate from AI investigation.
- Skip verified team-authored work. Preserve the PR-only `rsp-core` label-and-skip exception; do not run AI analysis on these PRs or apply `ai-reviewed`.
- Keep comments, assignments, closure, merge actions, and actual escalation out of the first live bot phase. Label writes require token setup and explicit enablement; until then, propose them only in digests.
- Tolerate linked issue/PR double investigation for now. No automatic PR deferral or closure.

## Deterministic automation dependency: assumed done

Treat CLA and mechanical failing-check labeling/reminders as provided by separate automation, per the maintainer's decision. Do not rebuild it as part of the triage rule update. This is an assumption, not an implementation audit or verified deployment claim.

Before integrating the queue, document that automation's actual events, labels, bot identity, and permissions. CLA completion can clear a CLA blocker, but does not by itself establish readiness. AI triage must not duplicate CLA reminders or apply waiting labels solely for an unsigned CLA.

## Planned queue and lifecycle

1. Agree on exact existing/new labels, eligible item types, ownership of each label, and transition semantics. `needs AI review` and `waiting for CLA` are discussion examples, not current configured labels.
2. Connect deterministic issue/PR-open events to queue entry. Specify draft/bot exclusions and the team-authored exception before enqueueing.
3. Have AI triage consume explicitly queued items, produce its digest, and eventually apply only agreed bot-eligible labels.
4. Define when queue state is cleared and what happens on partial failure, retries, or a changed PR revision. Do not mark an uncompleted investigation as reviewed.
5. Requeue on meaningful author responses, relevant PR updates, or resolved blockers such as CLA completion, according to agreed transitions.
6. Define initial review, waiting states, and substantive `ready for review` gates. Preserve maintainer ownership of readiness unless explicitly changed.

## Human-handled work: deferred decision

Do not introduce a blanket "skip if a maintainer commented/labeled it" rule in current triage. Decide here which human actions suppress AI work, which responses reopen it, and how to distinguish routine CLA/check reminders from substantive human triage, including reminders posted under a person's account.

Define interaction with existing `ai-reviewed` labels and revision changes. Existing time-window/label selection remains in force until the queue is implemented and approved.

## Cloud execution instead of a local machine

Select an approved cloud host/runtime so scheduled work does not depend on a personal computer being awake. No provider or new automation has been selected.

Decisions required:

- How the runtime reads the version-controlled [entry prompts](../automation-prompts.md) and rules, with a recorded revision.
- The schedule/event trigger, repository checkout strategy, concurrency/retry behavior, and durable digest destination.
- A least-privilege bot identity/token, secure secret storage, and explicit separation of read-only dry runs from future label-write permissions.
- How the existing local-only digest commit authorization is replaced or separately approved for the cloud host; do not copy local absolute paths or assume permission to push digests.
- How disabled local jobs are retired or kept disabled to avoid duplicate runs after an approved cutover.
- Operational visibility, failure reporting, cost monitoring, and a way to disable writes immediately.

Cloud triage does not authorize running contributor code. Reproduction execution belongs to the separate [secure reproductions initiative](secure-reproductions.md).

## Acceptance before enablement

- Queue events and label transitions are documented and exercised without GitHub writes.
- Team work is excluded from AI analysis; label-only member PR handling remains correct.
- CLA/check transitions requeue appropriately without duplicate reminders, false readiness, or dropped work.
- Human-reviewed, author-response, changed-revision, duplicate-event, retry, and partial-failure cases have defined outcomes.
- Cloud dry runs produce durable digests without a local machine, exposing errors instead of claiming success.
- A maintainer approves token scope, live label permissions, and cutover explicitly. No comment posting is enabled.

## Label inventory checkpoint

On November 6, 2026, a read-only GitHub label inventory confirmed `rsp-core`, `ai-reviewed`, `regression`, `ready for review`, `needs API review`, `needs decision`, `on hold`, `waiting for maintainer`, `has workaround`, `small review`, and `merge-risk: low|medium|high`.

The same inventory did not return `waiting for author`, `patch worthy`, `merge-risk: unknown`, or `needs initial review`. Existing rules must list missing labels as recommendations, not create them or substitute a misleading risk label. Recheck the inventory before implementation; it is not a reason to provision labels during this documentation update.
