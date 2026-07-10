---
name: implement-requirement
description: Review, clarify, and implement a numbered repository requirement. Use when asked to implement a requirement by number or path, such as "implement 001" or "implement requirements/001-feature.md".
---

# Implement Requirement

## Workflow

1. Resolve a number to one `requirements/<number>-*.md` file. Ask if it is missing or ambiguous.
2. Read the requirement and repository instructions before changing code.
3. Review the requested behavior, exclusions, and acceptance criteria. Ask about any decision that would materially affect scope or implementation.
4. Once aligned, edit the requirement to make the agreed behavior and acceptance criteria clear.
5. Implement only the clarified requirement. Keep the change small and within scope.
6. Run the verification required by the repository instructions. Report unrelated existing failures separately.
7. Summarize the result and offer to create logical commits. When asked to commit a completed requirement, move it to `requirements/done/` in that commit.
