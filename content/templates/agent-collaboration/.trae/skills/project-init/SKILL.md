---
name: "project-init"
description: "Initialize new conversation context. Invoke at the START of a new conversation or when switching to this project, to ensure the agent reads all critical docs and follows project workflows."
---

# Project Init

## Purpose

Bootstrap agent context at the beginning of a new conversation. This skill tells you **what to read and in what order** — the actual rules and workflows live in the project's AGENT.md files (single source of truth).

**Invoke this skill FIRST when starting work on this project in a new conversation.**

---

## Step 1: Read These Files (in order)

Read these files completely before doing anything else.

| Priority | File | Why read it |
|---------|------|-------------|
| 🔴 1 | `AGENT.md` | Root agent instructions: project overview, task-to-directory mapping, mandatory workflows |
| 🔴 2 | `agent-memory/README.md` | Agent Memory system overview |
| 🔴 3 | `agent-memory/current-state.md` | Current project status, progress, known issues, next steps |
| 🟡 4 | `workspace/AGENT.md` | If you'll be working with content in workspace/ |
| 🟡 5 | `plans/AGENT.md` | If you'll be managing ideas/plans |
| 🟢 6 | `ARCHITECTURE.md` | If you need deep technical context |

---

## Step 2: Confirm You Understand the Mandatory Workflows

After reading root `AGENT.md`, make sure you can answer these:

1. **What files MUST be updated after meaningful work?**
2. **What MUST you check before committing code?**
3. **Where do new content/features go?**

If you can't answer these, re-read the AGENT.md.

---

## Step 3: Confirm Understanding to User

After reading the files, give the user a brief confirmation:
- What you understand the current state to be
- What you understand the current task to be
- Ask for clarification if anything is unclear

---

## Important: AGENT.md is the Source of Truth

- This skill is just a **bootstrap trigger** — it tells you what to read.
- The actual rules, checklists, and workflows live in the **AGENT.md files**.
- If something in this skill contradicts AGENT.md, **AGENT.md wins**.
