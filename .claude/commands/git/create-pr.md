Use the template below to create a PR, don't actually create the PR yet, just show how the content would look like.

## Instruction

Use the following commands to view the changes of current branch

- `git fetch`, wait to finish # this refreshes origin/main
- `git diff origin/main...HEAD` # view the commited changes
- `git diff HEAD` # View both staged and unstaged changes

## PR Template

- Title format: Brief description
- Body must include:

  ## Overview

  Description: <summarize changes, 1-3 sentences, keep it brief>

## Final Instruction

- Before creating the PR, show me the output first to confirm.
- After I approve, use `gh pr create` to create the PR.
- Give me the URL to the PR when done
