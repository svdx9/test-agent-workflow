---
name: pr
description: Creates well-structured pull requests. Use when opening Pull Requests.
---

# Create Pull Request

Creates comprehensive pull requests following repository conventions with proper titles, linked issues, and complete descriptions.

## Your Task

Guide the user through creating a well-structured pull request:

1. **Analyze current state** - Examine branch and commits
2. **Detect context** - Find linked issues and PR templates
3. **Generate content** - Create title and description
4. **Gather metadata** - Determine labels, reviewers, assignees
5. **Create PR** - Submit via `gh pr create`
6. **Verify creation** - Confirm PR was created successfully

## Task Progress Checklist

Copy and track progress:

```
PR Creation Progress:
====================

Phase 1: Analysis
- [ ] Verify on feature branch (not main)
- [ ] Check for uncommitted changes
- [ ] Analyze commit history on branch
- [ ] Determine base branch

Phase 2: Context Detection
- [ ] Extract issue references from branch name
- [ ] Extract issue references from commits
- [ ] Check for PR template in repository
- [ ] Detect repository conventions

Phase 3: Content Generation
- [ ] Generate conventional PR title
- [ ] Create summary section
- [ ] List changes made
- [ ] Write test plan
- [ ] Add related issues section

Phase 4: Metadata
- [ ] Suggest appropriate labels
- [ ] Identify potential reviewers
- [ ] Determine if draft PR needed

Phase 5: Creation
- [ ] Run gh pr create with all options
- [ ] Verify PR was created
- [ ] Display PR URL to user
```

## Phase 1: Analysis

### Pre-flight Checks

```bash
# Verify we're in a git repository
git rev-parse --is-inside-work-tree

# Get current branch name
git branch --show-current

# Check for uncommitted changes
git status --porcelain
```

**Decision points:**

- If on `main`: Ask user to switch to feature branch or specify one
- If uncommitted changes exist: Warn user and ask if they want to commit first
- If no commits ahead of base: Inform user there's nothing to create a PR for

### Commit Analysis

```bash
# Get commits not in base branch (default: origin/main)
git log origin/main..HEAD --oneline 2>/dev/null

# Get detailed commit messages for description
git log origin/main..HEAD --pretty=format:"%s%n%b" 2>/dev/null
```

## Phase 2: Context Detection

### Issue Detection

Extract issue numbers from:

1. **Branch name patterns:**
   - `feature/123-description` → #123
   - `fix/issue-456` → #456
   - `123-feature-name` → #123
   - `user/issue-789` → #789

2. **Commit messages:**
   - `Fixes #123`
   - `Closes #456`
   - `Resolves #789`
   - `Related to #101`
   - `#234` (standalone references)

```bash
# Extract from branch name
BRANCH=$(git branch --show-current)
echo "$BRANCH" | grep -oE '[0-9]+' | head -1

# Extract from commits
git log origin/main..HEAD --oneline | grep -oE '#[0-9]+' | sort -u
```

### PR Template Detection

```bash
# Check for PR templates (in order of precedence)
ls -la .github/PULL_REQUEST_TEMPLATE.md 2>/dev/null
ls -la .github/pull_request_template.md 2>/dev/null
ls -la .github/PULL_REQUEST_TEMPLATE/ 2>/dev/null
ls -la docs/pull_request_template.md 2>/dev/null
ls -la PULL_REQUEST_TEMPLATE.md 2>/dev/null
```

If template exists, read it and use its structure for the PR description.

## Phase 3: Content Generation

### Title Generation

Follow conventional commit format for PR titles:

| Type | When to Use | Example |
|------|-------------|---------|
| `feat:` | New feature | `feat: add user registration` |
| `fix:` | Bug fix | `fix: resolve login timeout` |
| `chore:` | Maintenance | `chore: update dependencies` |

**Title rules:**

- Use imperative mood: "add" not "added"
- Keep under 72 characters
- Don't end with period
- Include scope if relevant: `feat(auth): add OAuth2 support`

### Description Generation

```markdown
## Summary

<!-- Brief description of what this PR does -->
{1-3 sentence summary based on commits}

## Changes

<!-- List of specific changes made -->
{Bulleted list derived from commit messages}

## Testing

<!-- How was this tested? -->
{Describe testing performed or needed}

## Related Issues

<!-- Link to related issues -->
{Closes #X, Fixes #Y, Related to #Z}

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have added necessary documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
```

## Phase 4: Metadata

### Label Detection

Suggest labels based on:

| Content Type | Suggested Labels |
|--------------|------------------|
| Bug fix | `bug`, `fix` |
| New feature | `feature`, `enhancement` |
| Documentation | `documentation`, `docs` |
| Breaking change | `breaking-change`, `major` |
| Dependencies | `dependencies` |

```bash
# List available labels
gh label list --limit 50
```

### Reviewer Suggestions

```bash
# Get code owners if available
cat .github/CODEOWNERS 2>/dev/null

# Get recent contributors to changed files
git log --format='%an' -- $(git diff origin/main --name-only) | sort | uniq -c | sort -rn | head -5
```

## Phase 5: Creation

### Create PR Command

```bash
# Full PR creation with all options
gh pr create \
  --title "<title>" \
  --body "<description>"
```

### Available Options

| Flag | Purpose | Example |
|------|---------|---------|
| `--title`, `-t` | PR title | `-t "feat: add login"` |
| `--body`, `-b` | PR description | `-b "Description..."` |
| `--base`, `-B` | Target branch | `-B main` |
| `--head`, `-H` | Source branch | `-H feature-branch` |
| `--draft`, `-d` | Create as draft | `-d` |
| `--label`, `-l` | Add labels | `-l bug -l urgent` |
| `--reviewer`, `-r` | Request reviewers | `-r user1 -r user2` |
| `--assignee`, `-a` | Assign users | `-a @me` |
| `--milestone`, `-m` | Add to milestone | `-m "v1.0"` |
| `--project`, `-p` | Add to project | `-p "Sprint 1"` |
| `--fill`, `-f` | Auto-fill from commits | `-f` |
| `--web`, `-w` | Open in browser | `-w` |

### Draft PR

Create as draft when:

- Work is still in progress
- Seeking early feedback
- CI needs to run before review
- Dependent on other PRs

```bash
gh pr create --draft --title "WIP: feature name" --body "..."
```

## Verification

After creation:

```bash
# View the created PR
gh pr view --web

# Or get PR details
gh pr view --json number,url,title,state
```

## Error Handling

| Issue | Solution |
|-------|----------|
| "No commits between base and head" | Ensure commits exist on feature branch |
| "A pull request already exists" | Use `gh pr view` to see existing PR |
| "Permission denied" | Check repository access and gh auth status |
| "Base branch not found" | Verify base branch exists: `git fetch origin` |
| "Label not found" | Create label first or omit: `gh label create name` |


## Validation Checklist

Before creating the PR, verify:

- [ ] On feature branch (not main)
- [ ] All changes are committed
- [ ] Branch is pushed to origin
- [ ] Title follows conventional commit format
- [ ] Description includes summary of changes
- [ ] Related issues are linked with proper keywords (Closes, Fixes)
- [ ] Labels are appropriate for the change type
- [ ] Reviewers are assigned (if required)
- [ ] No sensitive information in description (API keys, passwords)
- [ ] CI checks are likely to pass

## Tips

- Use `--fill` for quick PRs with good commit messages
- Use `--draft` when work is still in progress
- Use `--web` to finish in browser if you prefer the UI
- Link issues with "Closes #X" to auto-close on merge
- Request specific reviewers for security-sensitive changes
- Add to milestones to track release progress
