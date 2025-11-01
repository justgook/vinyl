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
- **Local-first admin panel** with File System Access API

## Setup

### Prerequisites

- Node.js 16+ and npm
- Modern web browser (Chrome/Edge/Opera for admin panel)

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
├── admin/                  # Local-first admin panel
│   ├── index.html         # Admin interface
│   ├── discogs-widget-standalone.js
│   └── README.md          # Admin panel docs
└── mockups/               # Design mockups
```

## Data Schema

Records are stored as individual JSON files in `data/records/`. See `data/SCHEMA.md` for details.

## Admin Panel (Content Management)

The project includes a **local-first admin panel** that uses the File System Access API to manage your vinyl records directly on your file system - no server or CMS required!

### Quick Start

```bash
# Start dev server
npm start

# Open admin panel in Chrome/Edge/Opera
http://localhost:8000/admin/
```

### Features

✨ **Local File Management**
- Direct read/write access to your `data/` folder
- No server required - works entirely in the browser
- Changes are saved directly to your local file system

🎵 **Discogs Integration**
- Search Discogs by catalog number or album/artist
- Auto-import complete record data
- High-quality cover images from Discogs

📝 **Full Record Editor**
- All record fields editable
- Track-by-track editing with duration
- Multiple artists and genres support
- Image preview

🗂️ **Record Management**
- List all records with preview cards
- Create new records
- Edit existing records
- Delete records

🔄 **Filter Index Management**
- Automatic outdated filter detection
- One-click filter regeneration
- Smart timestamp comparison
- Updates artists, genres, years, and labels indexes

### Browser Support

The File System Access API is supported in:
- ✅ Chrome 86+
- ✅ Edge 86+
- ✅ Opera 72+

❌ **Not supported:**
- Firefox (does not support File System Access API)
- Safari (does not support File System Access API)

[Check browser compatibility](https://caniuse.com/native-filesystem-api)

### How to Use

1. **Open the Admin Panel**
   - Visit `http://localhost:8000/admin/` in Chrome, Edge, or Opera

2. **Select Data Folder**
   - Click "📁 Select Data Folder"
   - Navigate to your project's `data/` folder
   - Your browser will remember this location

3. **Get Discogs API Token** (optional but recommended)
   - Visit https://www.discogs.com/settings/developers
   - Generate a personal access token
   - Enter it in the admin panel (stored in browser localStorage)

4. **Manage Records**
   - **Create:** Click "➕ New Record", search Discogs or enter manually
   - **Edit:** Click on a record card to edit
   - **Delete:** Open a record and click "🗑️ Delete"

5. **Update Filter Indexes**
   - The admin panel automatically detects when filters are outdated
   - Click "🔄 Regenerate Filters" when the yellow warning appears
   - Filter files (`data/filters/*.json`) are updated instantly

6. **Commit Changes**
   ```bash
   git add data/
   git commit -m "✨ Add new records via admin panel"
   git push
   ```

See `admin/README.md` for detailed documentation.

### Production Workflow

The admin panel is designed for **local-first editing**:

1. Use the admin panel on your local machine
2. Edit records as needed
3. Commit and push changes via Git
4. Your static site deploys automatically

This approach is perfect for personal collections where you're the only editor. For production multi-user scenarios, you can replace the File System Access API calls with backend API endpoints.

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
