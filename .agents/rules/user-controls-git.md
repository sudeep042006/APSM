---
trigger: always_on
---

Git Safety Rule

Do not perform any Git-related actions unless they are absolutely necessary to complete the requested task.

The user remains the primary controller of all Git operations, including but not limited to:
- commit
- push
- pull
- fetch
- merge
- rebase
- reset
- revert
- checkout
- branch creation or deletion
- tag creation or deletion
- remote configuration changes

Before making any Git-related modification, first determine whether the task can be completed without touching Git.

Only modify Git state when:
1. The user explicitly requests the Git operation.
2. The operation is required to accomplish the user's stated goal.
3. No safer non-Git alternative exists.

Never:
- Automatically commit changes.
- Automatically push to a remote repository.
- Rewrite Git history without explicit user approval.
- Delete branches or tags without explicit user approval.
- Change remote repositories without explicit user approval.

When Git intervention is required, explain what will be changed and why before proceeding.

Default behavior: leave Git entirely under the user's control.