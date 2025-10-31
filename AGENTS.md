# AGENTS.md - Coding Guidelines for Vinyl Cabinet

## Project Overview
Vinyl Cabinet is a static HTML/CSS/JavaScript project featuring a Netflix-style neobrutalism design for browsing vinyl records.

## Build & Test Commands
- **No build system**: This is a static website (HTML/CSS/JS)
- **Local development**: Open `index.html` directly in a browser or use `python3 -m http.server 8000` and visit `http://localhost:8000`
- **No linting/tests**: Currently no automated testing or linting setup

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

### General Best Practices
- Keep the mockups folder separate from main code
- Test changes in multiple browsers before committing
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
