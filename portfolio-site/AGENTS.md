# Working on the portfolio site

Please be sure to read the project's [README](./README.md) to understand the stack and structure before working.

## Writing Code Comments

Some agents don't write enough comments, and others write too many. This section clarifies the rules to keep it consistent.

❌ Do NOT write comments that directly relate to the current session.
✅ DO write comments that will be relatable to a future developer reading the code for the first time.

❌ Do NOT write comments with a high risk of becoming obsolete, (i.e., anything describing a temporary state of the code)
✅ DO write comments that are expected to remain true for a long time.
✅ DO write `// @TODO - <comment here>` to highlight something temporary, as close as possible to the exact line(s).

❌ Do NOT write comments to explain how the code works.
✅ DO write comments that explain why the code is there.

❌ Do NOT write documentation comments with unnecessary verbosity or detailed descriptions of the function's internals.
✅ DO write documentation comments that concisely describe the function's purpose, and tag `@example` to demonstrate its behavior using markdown code blocks.

❌ Do NOT write stray comments to serve as code descriptions or section labels.
✅ DO write stray comments _ONLY IF_ the code is unusual or unintuitive, to briefly justify workarounds or excessive complexity.
✅ DO reconsider _the code itself_ if you are compelled to clarify its behavior with a comment, as that in itself is a potential smell.

❌ Do NOT add excessive comments, nor too few.
✅ DO write the minimum acceptable amount, so that future developers or agent sessions will have the necessary context to quickly understand the code.
✅ DO remove excessive or misleading comments IF you come across them, even if they are not directly related to the task at hand.

❌ Do NOT add verbose comments to describe entire files/modules unless it is vital information for developers.
✅ DO consider adding a block to the project README.md file to describe the overall architecture and relationships, or a nested README.md, or a supplemental `docs/<SCREAMING_SNAKE_CASE>.md` file, any/all using `docs/assets/<file>` for embedded content if necessary.
