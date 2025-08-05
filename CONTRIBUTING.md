# Contributing to Peakfolk Social

Thank you for your interest in contributing to Peakfolk Social. This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git
- Firebase project (for testing)

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/peakfolk.social.git
   cd peakfolk.social
   ```

3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/peakfolk.social.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

6. Configure your Firebase project in `.env.local`

7. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming Convention

Use the following naming convention for branches:

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Adding or updating tests

Examples:
- `feature/user-profile-editing`
- `fix/message-loading-issue`
- `docs/api-documentation`

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the coding standards

3. Test your changes:
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

4. Commit your changes with descriptive messages:
   ```bash
   git add .
   git commit -m "feat: add user profile editing functionality"
   ```

### Commit Message Convention

Follow conventional commit format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
- `feat: add real-time notifications`
- `fix: resolve message loading issue`
- `docs: update API documentation`

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type when possible
- Use strict mode settings

### React/Next.js

- Use functional components with hooks
- Follow React best practices
- Use Next.js App Router conventions
- Implement proper error boundaries

### Styling

- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Use Radix UI components when possible
- Maintain consistent spacing and typography

### File Organization

- Place components in appropriate directories
- Use descriptive file and function names
- Keep components focused and reusable
- Separate business logic into custom hooks

## Testing

Currently, the project uses manual testing. When adding new features:

1. Test functionality manually in development
2. Test responsive design on different screen sizes
3. Verify Firebase integration works correctly
4. Test PWA functionality if applicable

## Linting and Formatting

The project uses ESLint for code quality:

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Build check
npm run build
```

Fix any linting errors before submitting your PR.

## Submitting Pull Requests

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request on GitHub with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Screenshots for UI changes
   - Link to any related issues

3. Ensure your PR:
   - Passes all checks (linting, type-checking, build)
   - Includes appropriate documentation updates
   - Follows the coding standards
   - Has a clear commit history

### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (please describe)

## Testing
- [ ] Tested locally
- [ ] Responsive design verified
- [ ] Firebase integration tested

## Screenshots (if applicable)
Add screenshots for UI changes.

## Additional Notes
Any additional information or context.
```

## Code Review Process

1. All PRs require review before merging
2. Address feedback promptly and professionally
3. Make requested changes in new commits
4. Once approved, maintainers will merge the PR

## Getting Help

- Check existing issues and discussions
- Create a new issue for bugs or feature requests
- Join project discussions for questions
- Follow the issue templates when reporting bugs

## Project Structure Guidelines

When adding new features, follow these guidelines:

- **Components**: Place in `/components` directory
- **Pages**: Use Next.js App Router in `/app` directory
- **Hooks**: Custom hooks in `/hooks` directory
- **Utils**: Utility functions in `/lib` directory
- **Types**: TypeScript definitions in `/types` directory
- **Contexts**: React contexts in `/contexts` directory

## Firebase Guidelines

- Use Firebase services through the centralized `/lib/firebase-services.ts`
- Follow security rules and data structure conventions
- Test Firestore queries for performance
- Handle errors appropriately with user-friendly messages

## Performance Considerations

- Optimize images and assets
- Use React Query for efficient data fetching
- Implement proper loading states
- Consider bundle size impact of new dependencies

## Security Guidelines

- Never commit sensitive data or API keys
- Use environment variables for configuration
- Follow Firebase security best practices
- Validate user inputs properly
- Implement proper error handling

Thank you for contributing to Peakfolk Social!
