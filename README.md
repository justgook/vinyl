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

## Content Management (DecapCMS)

### Using the Discogs Widget

The project includes a custom Discogs widget for easily adding new vinyl records:

1. **Get a Discogs API Token**
   - Visit https://www.discogs.com/settings/developers
   - Generate a new personal access token
   - Copy the token

2. **Access the CMS**
   - Navigate to `/admin/index.html` in your browser
   - (Future: Set up authentication for production use)

3. **Add a New Record**
   - Click "New Record" in the CMS
   - In the "🔍 Import from Discogs" field:
     - Paste your API token when prompted (saved to localStorage)
     - Search by catalog number (e.g., `SHVL804`) or album name
     - Click on the matching release
   - All fields will auto-populate with Discogs data
   - Review and adjust as needed (especially condition, which defaults to "Near Mint")
   - Assign a unique 3-digit ID
   - Save the record

4. **Widget Features**
   - ✅ Search by catalog number or album/artist name
   - ✅ Auto-fill: artists, album, year, genres, label, format
   - ✅ Auto-populate tracklist with sides and durations
   - ✅ Fetch album cover image URL
   - ✅ Save Discogs release ID for reference
   - ✅ Token stored locally for convenience

### Manual Entry

You can also create records manually by filling in all fields in the CMS interface.

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
