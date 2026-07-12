---
name: "commit-with-check"
description: "Commit code with mandatory pre-commit checklist execution. Invoke when user asks to commit code, submit changes, or git commit — ensures docs and agent memory are updated before committing."
---

# Commit With Check

## Purpose

Enforce the pre-commit workflow before any `git commit`. This skill tells you **the steps to follow** — the actual checklist lives in the project's root `AGENT.md` (single source of truth).

**Invoke this skill EVERY TIME user asks to commit/submit code.**

---

## Step 1: Read the Pre-Commit Checklist

Read the **「提交代码前检查清单」** section in the root `AGENT.md`.

Do NOT rely on memory — actually read it. The checklist is the source of truth.

---

## Step 2: Go Through the Checklist Item by Item

For each category in the checklist:

- **If the category applies to your changes** → verify each item
- **If an item is missing/not done** → fix it before committing
- **If you're unsure whether an item applies** → err on the side of updating

### The 4 categories (for quick reference — but read the full list in AGENT.md):

1. **代码改动** — API docs, architecture docs, content protocol docs
2. **内容改动** — correct directory, manifest updated, naming conventions
3. **架构/目录结构改动** — AGENT.md mapping, README structure, content/AGENT.md
4. **通用检查** — current-state updated, work-log written, no sensitive info

---

## Step 3: Update Gaps

If anything is missing:
1. Update the missing files/documents
2. If you genuinely don't have enough info to update something, note that in the work-log
3. Don't skip items just because you're "not sure" — make a best effort

---

## Step 4: Stage and Commit

After the checklist passes:

```bash
git status          # Review what's changed
git add -A          # Stage all changes
git diff --cached --stat  # Quick summary of staged changes
git commit -m "<type>: <description>"
```

### Commit Message Convention

Format: `<type>: <description>`

| Type | When to use |
|------|------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation changes only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `style` | Formatting, whitespace, etc |
| `chore` | Build tools, config, etc |
| `content` | Content updates (notes, knowledge base entries) |

Examples:
- `feat: add project detail page with demo iframe`
- `docs: reorganize doc structure, add plans directory`
- `content: migrate n8n notes to learning-projects`
- `fix: resolve dev.ps1 encoding issue`

---

## Step 5: Confirm to User

After successful commit, tell the user:
- Commit hash
- Brief summary of what was committed
- Which files from the checklist were updated (especially current-state and work-log)
- Any reminders (e.g., "push may time out due to network")

---

## Important: AGENT.md is the Source of Truth

- This skill is just a **workflow trigger** — it tells you the steps to follow.
- The actual checklist items live in **root AGENT.md**.
- If something in this skill contradicts AGENT.md, **AGENT.md wins**.
- When the checklist changes, update AGENT.md — you don't need to update this skill.
