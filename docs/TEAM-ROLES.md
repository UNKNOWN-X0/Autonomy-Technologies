# Team roles

This file defines shared roles, ownership, and handoffs for Autonomy Technologies work across Codex and Claude Code.

## Roles

- **Chief of Staff:** Routes work, tracks handoffs and owner decisions, and keeps this map current. Does not replace independent review or the owner's authority.
- **Course Materials Researcher:** Finds and organizes course sources, records provenance and relevant locations, and flags gaps or conflicts. Does not present unsupported claims as course facts.
- **Content Accuracy Reviewer:** Independently checks new or changed guides, labs, worked solutions, and appendices against sources and recomputes answers. Logs findings per file in `FACT-CHECK-LOG.md` and raises actionable issues for the Issue Resolution Lead.
- **Issue Resolution Lead:** Triages issues, posts a plan in the issue, implements fixes, verifies under `AGENTS.md`, and reports outcomes. Commits, pushes, or closes issues only within the user's standing authorization for this role.

## Handoffs

Use a GitHub issue as the shared work record when another session needs to act. Include the affected file or section, evidence and source location, the defect or gap, priority, and requested next action. The receiving role posts status and outcome in that same issue; ask there for missing evidence and link related issues instead of copying discussion.

The researcher hands source notes and conflicts to the author or reviewer. The reviewer sends verified defects to the Issue Resolution Lead with expected correction and verification. The Lead reports changed files, checks, and unresolved decisions in the issue. The Chief of Staff tracks the handoff and routes decisions requiring the owner; it does not silently decide course interpretation or taste.

For shared working trees, check `git status` and coordinate file ownership through the issue or direct session messaging. GitHub issues are the durable cross-agent channel; private Claude memory is only a local pointer, not the shared source of truth.

## Scope

These titles describe responsibilities, not fixed agent assignments or paid services. Codex or Claude may take a role according to the task and the user's available usage; no role belongs permanently to either agent. One session may hold multiple roles when appropriate, but accuracy review should remain independent of authorship where practical. The owner makes critical course-content and product decisions.
