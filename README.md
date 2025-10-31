# Vinyl Cabinet

A Netflix-style neobrutalism vinyl record collection browser built with vanilla HTML, CSS, and JavaScript.

## Features

- Netflix-style horizontal scrolling rows
- Neobrutalism design (bold borders, high contrast, geometric shapes)
- Animated vinyl disc reveal on hover
- Detail pages with tracklist and metadata
- Dynamic filtering by artist, genre, year, and label
- Fully responsive (desktop and mobile)
- E2E tested with Playwright

## Setup

### Prerequisites

- Node.js 16+ and npm
- Modern web browser

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Visit http://localhost:8000 in your browser.

## Development

### Available Commands

```bash
# Development
npm start                  # Start local dev server on port 8000

# Testing
npm test                   # Run all e2e tests (headless, all browsers)
npm run test:headed        # Run tests with visible browser
npm run test:debug         # Debug tests with Playwright Inspector
npm run test:ui            # Open Playwright UI mode
npm run test:report        # View HTML test report

# Code Quality
npm run lint               # Check JavaScript for errors
npm run lint:fix           # Auto-fix linting issues

# Data Generation
npm run generate-filters   # Regenerate filter JSON files
```

## Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end testing across multiple browsers.

### Test Structure

- `tests/homepage.spec.js` - Homepage functionality tests
- `tests/detail-page.spec.js` - Detail page tests
- `tests/filter.spec.js` - Filter page tests

### Running Tests

**Important:** Playwright will automatically start a dev server on port 8000. If you already have a server running, the tests will use it.

```bash
# Run all tests (automatically starts server)
npm test

# Run specific test file
npx playwright test tests/homepage.spec.js

# Run with UI (best for development)
npm run test:ui

# Debug mode (step through tests)
npm run test:debug

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

**Tip:** If tests seem to hang, you can manually start the server in a separate terminal:
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Run tests (will use existing server)
npm test
```

### Test Coverage

The test suite covers:
- ✅ Homepage layout and data loading
- ✅ Vinyl card interactions and navigation
- ✅ Detail page display and animations
- ✅ Filter functionality across all types
- ✅ Responsive design (mobile and desktop)
- ✅ Error handling and edge cases

## Project Structure

```
vinyl-cabinet/
├── index.html              # Main homepage
├── detail.html             # Individual record view
├── filter.html             # Filter/category view
├── data/                   # JSON data files
│   ├── records/           # Individual record files
│   ├── filter-tags/       # Pre-generated filter files
│   └── records.json       # Homepage featured records
├── tests/                  # Playwright e2e tests
├── admin/                  # DecapCMS (future)
└── mockups/               # Design mockups
```

## Data Schema

Records are stored as individual JSON files in `data/records/`. See `data/SCHEMA.md` for details.

## Code Style

- **HTML**: Semantic HTML5, kebab-case classes
- **CSS**: Custom properties, neobrutalism style
- **JavaScript**: ES6+, camelCase, JSDoc comments
- **Commits**: Gitmoji style (e.g., `✨ Add feature`, `🐛 Fix bug`)

See `AGENTS.md` for detailed coding guidelines.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint:fix` and `npm test`
5. Commit with gitmoji-style messages
6. Submit a pull request

## License

ISC
