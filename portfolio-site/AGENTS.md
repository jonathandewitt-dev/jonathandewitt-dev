# Working on the portfolio site

Please be sure to read the project's [README](./README.md) to understand the stack and structure before working.

## Code Comments

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

## Design System

Please apply standard design theory as popularized in the industry, but wherever the rules may conflict, this document takes precedence.

I'm rather particular about design systems, so I'll outline only my less popular ideas to keep this document clear and minimal.

❌ Do NOT name any part of a component's public interface in a way that is visually descriptive. That means:

- 🚫 NOT "large"
- 🚫 NOT "red"
- 🚫 NOT "bold"
- 🚫 NOT "horizontal"
- 🚫 NOT "spacing"
- 🚫 NOT "grid"
- 🚫 NOT "thin"
- 🚫 NOT "dark"
- ...and so on.

✅ DO name a component's public interface by its use case. Only the component's own internals get to decide how that usage appears visually. This prevents issues later when a decision is changed, such as changing all warning banners from yellow to orange. The scope of the design decision is directly proportional to the scope of the maitenance burden. That means:

- 👍 USE "warning"
- 👍 USE "important"
- 👍 USE "variant"
- 👍 USE "theme"
- 👍 USE "preference"
- 👍 USE "detail"
- 👍 USE "intent"
- 👍 USE "focus"
- ...and so on.

❌ Do NOT make changes to the global CSS scope, outside required rules on `html` and `body` which cannot be scoped, or a CSS reset to make browser defaults more consistent. If you find what appears to be a necessary exception, you may proceed with your changes, but your choice will be subject to heavy criticism and a lengthy exploration of the alternatives. Come prepared with an exceptionally valid justification, and always call attention to it in your response.
✅ DO contain all CSS within constructable stylesheets, and only inject them into closed shadow roots. If shared CSS is necessary, consider moving it into a shared stylesheet. (e.g., "theme", "typography", "containers", and so on)

❌ Do NOT couple component code directly. One component should never reach into the implementation of another and change or depend on it, especially shadow DOM internals. Same goes for method calls from outside that mutate inside -- that's still reaching in, just through an extra layer of abstraction.
✅ DO separate behavior via inputs (attributes, properties, etc) and outputs (event dispatchers and listeners). You should rarely if ever need any method calls at all on custom elements, but there may be some exceptions.

## Architecture and Patterns

❌ Do NOT extract dozens of tiny helper functions arbitrarily. Abstractions are often _worse_ because they obfuscate the intent and readability, and they can often be accounted for by simple type annotations and proper test coverage on the parent function. NEVER extract a tiny helper function when it's only ever called once.
✅ DO extract smaller functions when the goal is to _divide independent concerns_, especially when the logic is _repeated in many places_.

❌ Do NOT write impure functions unless required by the platform, (e.g., browser APIs).
✅ DO write pure functions with explicit contracts - meaning no side effects, but also no hidden danger of unhandled errors, or any other behavior that's invisible to the consumer. (See [Handling Errors](#handling-errors) below.)

❌ Do NOT mutate state directly in an otherwise stateless function.
✅ DO isolate necessary mutations to the outermost edges. Move state interactions to their own scope, apart from the rest of the logic. Callbacks can be a helpful pattern to lift that concern to the top-most caller.

❌ Do NOT treat non-boolean truthy/falsy values as booleans in ternaries, `if` statements, or any other context where a boolean is standard.
✅ DO write explicit comparisons to resolve any ambiguity, like `obj !== null` or `obj?.cond === true`.

❌ Do NOT use mutable object-oriented patterns as the default.
✅ DO prefer immutable functional patterns everywhere, unless performance is _meaningfully_ impacted. Classes are fine, as long as they are limited to generic data structures and not regarded as first-class citizens.

## Handling Errors

> In the next prompt, add error-handling utilities and native Node tests to validate their behavior, and remove this note. Mimic Rust's `Result<T, E>` type using discriminated unions, so that errors can be caught and returned as `Err` variant `Result` types. This will allow errors with a possibility of throwing to be explicitly marked by their return type in a public contract, while TypeScript will naturally flag unhandled error conditions. A `safeTry()` utility is preferred, along with `asyncSafeTry()` and `AsyncResult<T, E>`.

You should never write code that risks a hidden unhandled error. Wrap every uncertain API so that the error becomes a safe and visible type contract. Be especially cautious around native browser APIs or other globals that are capable of throwing errors, such as `JSON.parse()`.

## Testing

### Stack and Strategy

> Tests have not yet been written and dependencies have not yet been installed. In the next prompt, add the necessary dependencies and write some tests to establish a foundation, then remove this note. Make sure you set up coverage-tracking for at least the unit tests, and set a reasonable starting minimum threshold. Add all test outputs to gitignore and favor JSON and CLI text reports over HTML or other formats.

Prefer a TDD approach. That is, you should write a failing test case and then implement the code until it passes. As coverage improves, please increase the minimum threshold so it never drops below that again. The target is 100%.

- Node testing library
- Storybook
- Playwright

### Unit vs Integration

Any test that interacts with the DOM, shared state, or some external object, is considered integration, and should _avoid_ overlapping with unit tests that only test a pure function's input and output. Both are important, but units should be the majority.

Always use the Node testing library for unit tests.
Use the most appropriate tool for each type of integration test:

#### Types of Integration

- **Node testing library:** Interactions between modules, shared state, APIs, or other globals.
  > NOTE: Browser APIs cannot be tested in Node, and any reference to them _will crash the test suite_.
- **Storybook:** Component (AKA "Interaction") tests can verify DOM manipulation, browser APIs, and publicly observable component behavior.
  > NOTE: You cannot (and should not) reach into closed shadow roots. Instead, the structure and behavior should be architected in such a way that you don't _need_ to. For example, provide a slot for the target element so that it renders in the light DOM, expose a direct reference to the element via a property (e.g., `searchElement.button`, `searchElement.input`), or emit an event that carries a clone of the target element(s) (the purest functional option).
- **Playwright:** Automated E2E tests can verify site/page level behavior.
  > NOTE: Limit these tests to "user stories", like "as an admin, I want to edit a blog post, so I can amend it or correct mistakes." In fact, every test should be labeled as a story like this. Use guidance from agile thought leaders like Ron Jeffries to author and slice stories.

### Mocking

❌ DO NOT use (mutable) mocks in unit tests. Lift the dependency to the consumer with a callback, then test the unit of behavior in isolation.
✅ DO use mocks in genuine integration tests, but please practice restraint.

❌ Do not write tests that only verify fake behavior. A bullet-proof mock proves nothing.
✅ DO write tests that verify the _real_ integrated system's behavior.
