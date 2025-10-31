# AGENTS.md - Coding Guidelines for Vinyl Cabinet

## Project Overview
Vinyl Cabinet is a static HTML/CSS/JavaScript project featuring a Netflix-style neobrutalism design for browsing vinyl records.

## Build & Test Commands

### Development Server
```bash
npm start                  # Start local dev server on http://localhost:8000
```

### Testing (Playwright E2E)
```bash
npm test                   # Run all e2e tests (headless, all browsers)
npm run test:headed        # Run tests with visible browser
npm run test:debug         # Debug tests with Playwright Inspector
npm run test:ui            # Run tests with Playwright UI mode
npm run test:report        # View HTML test report
```

### Linting (ESLint)
```bash
npm run lint               # Check JavaScript for style/errors
npm run lint:fix           # Auto-fix linting issues
```

### Other Commands
```bash
npm run generate-filters   # Regenerate filter JSON files from records data
```

### Manual Testing
You can also open `index.html` directly in a browser, but using `npm start` is recommended for proper CORS handling and JSON file loading.

## Code Style Guidelines

### HTML & Structure
- Use semantic HTML5 elements (`<header>`, `<main>`, `<section>`, etc.)
- Maintain consistent indentation (2 spaces)
- Use descriptive class names with kebab-case (e.g., `album-card`, `header-content`)

### CSS & Styling
- Use CSS custom properties (defined in `:root`) for colors and reusable values
- Follow neobrutalism style: bold borders, high contrast, geometric shapes
- Keep responsive design mobile-first (breakpoints as needed)
- Avoid inline styles; use stylesheet only

### JavaScript
- Use modern ES6+ syntax (arrow functions, const/let, template literals)
- Add JSDoc comments for functions: `/** @param {type} name - description */`
- Use kebab-case for IDs and data attributes, camelCase for variables
- Prefer event delegation for dynamic elements

### Naming Conventions
- CSS classes: kebab-case (`album-grid`, `vinyl-icon`)
- JavaScript variables/functions: camelCase (`getAlbumData`, `scrollPosition`)
- HTML IDs: kebab-case (`main-nav`, `album-list`)
- Constants: UPPER_SNAKE_CASE (`MAX_VISIBLE_ITEMS = 12`)

### Error Handling
- Wrap API calls in try-catch blocks
- Log errors to console with context: `console.error('Failed to load albums:', error)`
- Provide graceful fallbacks (e.g., placeholder images if image fails to load)
- Never silently fail; always inform user of issues

### Testing Best Practices
- **Run tests after implementing features**: Use `npm test` to validate your changes
- **Write tests for new features**: Add test cases to appropriate spec files in `tests/`
- **Use headed mode for debugging**: `npm run test:headed` shows what's happening
- **Test across browsers**: Playwright runs tests on Chromium, Firefox, and WebKit
- **Check mobile responsiveness**: Tests include mobile viewport scenarios
- **Review test reports**: Use `npm run test:report` to see detailed results with screenshots

### General Best Practices
- Keep the mockups folder separate from main code
- **Run linting before committing**: Use `npm run lint:fix` to clean up code
- **Run tests before committing**: Ensure `npm test` passes
- Test changes in multiple browsers (automated via Playwright)
- Make git commits frequently for logical units of work
- Commit messages: Use gitmoji-style with emoji prefix + descriptive message
  - Format: `{emoji} Brief description in present tense`
  - Examples:
    - `✨ Add DecapCMS integration for content management`
    - `🐛 Fix album card hover state in Safari`
    - `💄 Update neobrutalism border styles`
    - `📝 Add setup instructions for local development`
    - `♻️ Refactor filter generation script`
    - `🔧 Update DecapCMS configuration`
    - `✅ Add e2e tests for filter functionality`
  - Common emojis:
    - ✨ New feature
    - 🐛 Bug fix
    - 💄 UI/styling updates
    - 📝 Documentation
    - ♻️ Refactoring
    - 🔧 Configuration
    - 🚀 Performance
    - ✅ Tests
    - 🎨 Code structure/format

## AI Agent Testing Guidelines

When implementing features as an AI coding agent, follow this workflow:

1. **Implement the feature** - Write/modify code as requested
2. **Run the tests** - Execute `npm test` to validate functionality
3. **Check test results** - Review output for failures or errors
4. **Fix issues** - If tests fail, debug and fix the implementation
5. **Verify success** - Ensure all tests pass before completing the task
6. **Report results** - Inform the user of test outcomes

### When Tests Fail
- Use `npm run test:headed` to see what's happening visually
- Use `npm run test:debug` to step through tests interactively
- Check `playwright-report/` for screenshots of failures
- Review test expectations vs actual implementation
- Fix code and re-run tests until they pass

### Writing New Tests
When adding new features, create corresponding tests:
- Homepage features → `tests/homepage.spec.js`
- Detail page features → `tests/detail-page.spec.js`
- Filter features → `tests/filter.spec.js`
- Follow existing test structure and naming conventions
- Include tests for happy paths, edge cases, and mobile views
