# claude (repo root)


## interaction protocol (mandatory)

when information is missing, ambiguous, or there are multiple plausible implementations:
- ask exactly one question at a time.
- questions must be yes/no only.
- do not ask multi-part questions.
- do not offer options lists inside the question.
- after I answer, either:
  - ask the next single yes/no question.

## mandatory workflow steps

- after editing any /backend file:
  - before committing:
    - run `make test` MUST not commit if there are any errors
    - run `make lint` MUST not commit if there are any errors

- before opening a PR that completes a backlog task:
  - call `task_edit` with `status: Done` and a `finalSummary`
  - verify all Definition of Done items are checked

# skills
  - the agent MUST explicitly state skill was loaded before implementation.

## available skills
  - golang backend: @.claude/skills/go-backend/SKILL.md
    - any changes to files under /backend MUST use this skill
    - this skill is an enforcement contract, not guidance.


## backlog MCP + worktrees (known bug workaround)

Backlog MCP tools always write to the **main repo's** `backlog/` directory, regardless of the current worktree CWD. This is upstream bug MrLesk/Backlog.md#558.

When a task file must be committed as part of a PR branch (e.g. setting status to Done):

1. Make the MCP call as normal — file lands in main repo's `backlog/`
2. Copy the file into the worktree:
   ```
   cp <main-repo>/backlog/tasks/<task-file> backlog/tasks/<task-file>
   ```
3. Restore the main repo copy so main stays clean:
   ```
   git -C <main-repo> restore backlog/tasks/<task-file>
   ```
4. Commit the worktree copy as part of the PR

`<main-repo>` is the repo root of this project

<!-- BACKLOG.MD MCP GUIDELINES START -->

<CRITICAL_INSTRUCTION>

## BACKLOG WORKFLOW INSTRUCTIONS

This project uses Backlog.md MCP for all task and project management activities.

**CRITICAL GUIDANCE**

- If your client supports MCP resources, read `backlog://workflow/overview` to understand when and how to use Backlog for this project.
- If your client only supports tools or the above request fails, call `backlog.get_workflow_overview()` tool to load the tool-oriented overview (it lists the matching guide tools).

- **First time working here?** Read the overview resource IMMEDIATELY to learn the workflow
- **Already familiar?** You should have the overview cached ("## Backlog.md Overview (MCP)")
- **When to read it**: BEFORE creating tasks, or when you're unsure whether to track work

These guides cover:
- Decision framework for when to create tasks
- Search-first workflow to avoid duplicates
- Links to detailed guides for task creation, execution, and finalization
- MCP tools reference

You MUST read the overview resource to understand the complete workflow. The information is NOT summarized here.

</CRITICAL_INSTRUCTION>

<!-- BACKLOG.MD MCP GUIDELINES END -->
