# Contributing to Canvasdown

Thank you for your interest in contributing to Canvasdown! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 10.28.0

**Note**: If `pnpm` is not found in your PATH when committing, you can:
- Use `corepack enable` to enable pnpm via Node.js corepack
- Or create `~/.config/husky/init.sh` (or `%USERPROFILE%\.config\husky\init.sh` on Windows) to set up your environment:
  ```sh
  # Example for nvm users
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  
  # Enable corepack if using it
  if command -v corepack >/dev/null 2>&1; then
    corepack enable
  fi
  ```

### Setup

```bash
# Clone the repository
git clone https://github.com/ssota/canvasdown.git
cd canvasdown

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `dev` - Development branch (default for contributions)
- `feature/*` - Feature branches

### Making Changes

1. Create a feature branch from `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

3. Push and create a Pull Request:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build/tooling changes

Example:
```
feat(core): add support for custom edge types

Adds ability to register custom edge types with custom styling
and behavior.

- Added EdgeTypeRegistry class
- Implemented edge type validation
- Updated documentation

Closes #123
```

## Pull Request Process

1. Ensure all tests pass: `pnpm test`
2. Ensure linting passes: `pnpm lint`
3. Ensure type checking passes: `pnpm typecheck`
4. Update documentation if needed
5. Create a PR targeting `dev` branch
6. Wait for code review

### PR Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] All tests pass
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Changeset added (if needed)

## Adding Changesets

When making changes that affect the public API, add a changeset:

```bash
pnpm changeset
```

This will guide you through creating a changeset file describing your changes.

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

- Place test files next to source files: `*.test.ts` or `*.spec.ts`
- Use Vitest for testing
- Aim for >80% code coverage

## Code Style

- We use ESLint for linting
- We use Prettier for formatting (via ESLint)
- Run `pnpm lint` before committing

### Pre-commit Hooks

This project uses [Husky](https://typicode.github.io/husky/) to run checks before commits. The pre-commit hook will automatically:
- **Format and lint staged files** using lint-staged

Full type checking, linting, and tests are run in CI. You can run them locally before pushing:

```bash
pnpm typecheck  # Type checking
pnpm lint       # Linting
pnpm test       # Tests
```

If the pre-commit hook fails, fix the issues and try committing again.

## Package Structure

```
packages/
├── core/              # @canvasdown/core - DSL parser and layout engine
├── adapter/
│   └── react-flow/   # @canvasdown/react-flow - React Flow adapter
└── examples/          # Example application (not published)
```

## Questions?

If you have questions, please:
- Open an issue on GitHub
- Check existing issues and discussions
- Review the documentation in README.md

Thank you for contributing to Canvasdown! 🎉
