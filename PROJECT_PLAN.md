# PROJECT_PLAN.md - Vinyl Cabinet Implementation

## Project Overview
Static web application for managing and browsing a personal vinyl collection with Netflix-style neobrutalism design. Data stored as JSON files, manageable via DecapCMS, deployable to GitHub Pages with SSG option for future.

---

## Data Schema (Finalized)

```json
{
  "id": "001",
  "catalogNumber": "М6048979001",
  "recordLabel": "Island Records",
  "artists": ["Pink Floyd"],
  "album": "The Dark Side of the Moon",
  "year": 1973,
  "genre": ["Progressive Rock", "Art Rock"],
  "format": "LP, Album",
  "condition": "Near Mint",
  "imageUrl": "https://placeholdit.com/400/FF10F0/FFFFFF?text=Pink+Floyd",
  "sides": [
    {
      "name": "Side A",
      "tracks": [
        {
          "title": "Speak to Me",
          "duration": "1:30"
        },
        {
          "title": "Breathe",
          "duration": "2:43"
        }
      ]
    },
    {
      "name": "Side B", 
      "tracks": [
        {
          "title": "Money",
          "duration": "6:23"
        }
      ]
    }
  ],
  "externalIds": {
    "discogs": "release/3456789"
  }
}
```

**Key Design Decisions:**
- ✅ Single `artists` array (no separate `artist` field)
- ✅ No track numbers (use array index)
- ✅ Optional per-track `artists` (only if different from album)
- ✅ Placeholder images initially: `https://placeholdit.com/400/{COLOR}/{TEXT_COLOR}?text={Artist+Name}`
- ✅ Track titles in original language (English, Russian, etc.)
- ✅ Realistic track counts (4-8 per side)

---

## Mock Data Strategy

**20 Diverse Popular Albums:**
1. Pink Floyd - The Dark Side of the Moon (English)
2. The Beatles - Abbey Road (English)
3. Led Zeppelin - Led Zeppelin IV (English)
4. Miles Davis - Kind of Blue (English)
5. Fleetwood Mac - Rumours (English)
6. David Bowie - The Rise and Fall of Ziggy Stardust (English)
7. Kraftwerk - Autobahn (German)
8. ABBA - Arrival (English/Swedish)
9. The Velvet Underground & Nico (English)
10. Talking Heads - Remain in Light (English)
11. Joy Division - Unknown Pleasures (English)
12. Depeche Mode - Violator (English)
13. Radiohead - OK Computer (English)
14. Massive Attack - Blue Lines (English)
15. Daft Punk - Discovery (English/French)
16. Björk - Homogenic (English/Icelandic)
17. The Smiths - The Queen Is Dead (English)
18. Sonic Youth - Daydream Nation (English)
19. My Bloody Valentine - Loveless (English)
20. Portishead - Dummy (English)

**Genre Distribution:** Rock, Electronic, Jazz, Post-Punk, Trip-Hop, Experimental

---

## Folder Structure

```
vinyl-cabinet/
├── index.html                 # Main page (existing, to be updated)
├── detail.html                # Individual record view (NEW)
├── filter.html                # Filter/category view (NEW)
├── generate-filters.js        # Filter generation script (NEW)
├── data/
│   ├── SCHEMA.md              # Data schema documentation
│   ├── records.json           # Homepage featured records
│   ├── records-all.json       # Full catalog minimal listing
│   ├── filters/               # Filter index files (NEW)
│   │   ├── artists.json
│   │   ├── genres.json
│   │   ├── years.json
│   │   └── labels.json
│   ├── filter-tags/           # Individual filter files (NEW)
│   │   ├── artist_*.json
│   │   ├── genre_*.json
│   │   ├── year_*.json
│   │   └── label_*.json
│   └── records/               # Individual record files
│       ├── 001.json
│       ├── 002.json
│       └── ... (20 files)
├── admin/                     # DecapCMS (Phase 2)
│   ├── index.html
│   ├── config.yml
│   └── discogs-widget.js      # Custom widget for API lookup
├── scripts/                   # Utility scripts (Phase 3)
│   └── import-csv.js          # Parse vinyl.csv → skeleton JSONs
├── images/                    # Downloaded cover art (Phase 3)
│   └── covers/
├── mockups/                   # Design mockups (existing)
└── PROJECT_PLAN.md            # This file
```

---

## Phase 1: Mock Data + UX Implementation

### 1.1 Data Creation
- [x] Create data directory structure
- [x] Create `data/SCHEMA.md` - Document JSON structure with examples
- [x] Create `data/records/001.json` through `020.json` - 20 diverse albums
- [x] Create `data/records.json` - Featured records for homepage rows
- [x] Create `data/records-all.json` - Minimal listing (id, artists, album, imageUrl)

### 1.2 Homepage Enhancement
- [x] Add JavaScript to load `data/records.json`
- [x] Render cards dynamically (replace hardcoded mockups)
- [x] Create predefined rows (loaded from data/records.json):
  - Recently Added (newest 10)
  - Progressive Rock (filter by genre)
  - 1970s Classics (filter by year)
  - Electronic Music (filter by genre)
  - Jazz & Experimental (filter by genre)
- [x] Navigate to detail page on card click
- [x] Implement "VIEW ALL" button → show full category view

### 1.3 Filter System Implementation
- [x] Create `filter.html` - Dynamic filter/category view
- [x] Create `generate-filters.js` - Automated filter generation script
- [x] Generate filter index files (artists, genres, years, labels)
- [x] Create individual filter tag files for each category
- [x] Implement URL parameter parsing (`?type=artist&value=Pink+Floyd`)
- [x] Grid layout for filtered results with responsive design
- [x] Filter-specific styling and headers

### 1.4 Global Search Implementation (MOVED TO PHASE 4)
- [ ] Free-text search input (existing in header)
- [ ] Search across: artists, album, catalogNumber, recordLabel
- [ ] Live suggestions dropdown (as-you-type)
- [ ] Full results view (filter homepage or new page)

### 1.5 Detail Page
- [x] Create `detail.html` - Individual record view
- [x] Parse URL param `?id=001`
- [x] Load `data/records/001.json`
- [x] Display: cover, artists, album, year, label, condition
- [x] Render tracklist grouped by side
- [x] Show per-track artists only if different from album
- [x] Maintain neobrutalism design language
- [x] Vinyl record visual display with label
- [x] Responsive design for mobile
- [x] Back button to return to collection

---

## Phase 2: DecapCMS Integration

### 2.1 Basic Setup
- [x] Create `admin/index.html` - DecapCMS loader
- [x] Create `admin/config.yml` - Collection schema
- [ ] Setup GitHub authentication (git-gateway)
- [x] Configure media folder for cover images
- [ ] Test: Create new record via CMS interface (requires git-gateway)

### 2.2 Custom Discogs Widget
- [x] Create `admin/discogs-widget.js`
- [x] Add input field for catalog number
- [x] Implement "Search Discogs" button
- [x] Fetch results from Discogs API
- [x] Display matches with images (shows up to 10)
- [x] User selects correct release
- [x] Auto-fill all form fields
- [x] Handle cover image URLs (uses Discogs URLs directly)

### 2.3 Workflow Optimization
- [ ] Add "Quick Add" mode (catalog number → auto-save best match)
- [ ] Bulk edit mode (update condition for multiple records)
- [ ] Image management (re-fetch from Discogs if needed)

---

## Phase 3: Bulk Import & Migration

### 3.1 CSV Processing
- [ ] Create `scripts/import-csv.js`
- [ ] Parse `vinyl.csv` (212 records)
- [ ] Generate skeleton JSON files in `data/records/`
- [ ] Create `data/records-all.json` with all catalog numbers
- [ ] Map catalogNumber → id for lookups

### 3.2 Data Enrichment
- [ ] Use DecapCMS + Discogs widget to fill remaining 192 records
- [ ] Download all cover images locally
- [ ] Update imageUrl paths to local files
- [ ] Validate data completeness

---

## Phase 4: Advanced Features (Future)

### 4.1 SSG Migration Option
- [ ] Setup Eleventy or Hugo
- [ ] Convert to build-time rendering
- [ ] Setup GitHub Actions workflow
- [ ] Deploy to GitHub Pages

### 4.2 SQLite WASM Alternative
- [ ] Create SQLite database from JSON
- [ ] Integrate sql.js in browser
- [ ] Implement instant search/filter/sort
- [ ] Compare performance vs SSG

### 4.3 Additional Features
- [ ] Global search functionality (moved from Phase 1.3)
- [ ] Offline mode (Service Worker + IndexedDB)
- [ ] Statistics dashboard (collection value, genres, years)
- [ ] Wishlist / Want List
- [ ] Listening log (track when you played records)
- [ ] Export to CSV/PDF

---

## API Integration Plan

**Discogs API:**
- Endpoint: `https://api.discogs.com/database/search`
- Auth: User token (free, 60 req/min)
- Search by: `catno`, `artist`, `label`
- Fetch: `title`, `artists`, `year`, `tracklist`, `images`, `labels`
- Rate limiting: Respect 429 responses

**Future APIs:**
- MusicBrainz (metadata fallback)
- Spotify (audio previews, if needed)

---

## DecapCMS Configuration Preview

```yaml
collections:
  - name: "records"
    label: "Vinyl Records"
    folder: "data/records"
    create: true
    slug: "{{id}}"
    extension: "json"
    format: "json"
    fields:
      - {label: "ID", name: "id", widget: "string"}
      - {label: "Catalog Number", name: "catalogNumber", widget: "string"}
      - {label: "Record Label", name: "recordLabel", widget: "string"}
      - {label: "Artists", name: "artists", widget: "list"}
      - {label: "Album", name: "album", widget: "string"}
      - {label: "Year", name: "year", widget: "number"}
      - {label: "Genre", name: "genre", widget: "list"}
      - {label: "Format", name: "format", widget: "string", default: "LP, Album"}
      - {label: "Condition", name: "condition", widget: "select", options: ["Mint", "Near Mint", "Very Good Plus", "Very Good", "Good Plus", "Good"]}
      - {label: "Cover Image", name: "imageUrl", widget: "image"}
      - label: "Sides"
        name: "sides"
        widget: "list"
        fields:
          - {label: "Side Name", name: "name", widget: "string"}
          - label: "Tracks"
            name: "tracks"
            widget: "list"
            fields:
              - {label: "Title", name: "title", widget: "string"}
              - {label: "Duration", name: "duration", widget: "string"}
              - {label: "Artists (optional)", name: "artists", widget: "list", required: false}
      - label: "External IDs"
        name: "externalIds"
        widget: "object"
        fields:
          - {label: "Discogs", name: "discogs", widget: "string", required: false}
```

---

## UX Navigation Flow

```
Homepage (index.html)
├── Header: Global search bar
├── Predefined Rows (categories):
│   ├── Recently Added → VIEW ALL → filter.html
│   ├── Progressive Rock → VIEW ALL → filter.html
│   ├── 1970s Classics → VIEW ALL → filter.html
│   ├── Electronic Music → VIEW ALL → filter.html
│   └── Jazz & Experimental → VIEW ALL → filter.html
└── Click album card → detail.html?id=001

Filter Page (filter.html)
├── Dynamic header with filter type/value
├── Grid of filtered records
└── Click album card → detail.html?id=001

Detail Page (detail.html)
├── Large cover image
├── Album info (artists, year, label, condition)
├── Tracklist (grouped by side)
├── Clickable tags → filter.html
└── Back to collection button
```

**Navigation:** Curated rows + dynamic filter pages!

**Search:** Free-text across all fields (Phase 4)

---

## GitHub Actions Workflow (Phase 4)

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
    paths: ['data/**']
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Build static site (if SSG)
      - Deploy to gh-pages branch
```

---

## Current Status

**✅ Completed:**
- Project planning and architecture
- Data schema finalized
- Folder structure defined
- Mock data strategy (20 albums selected)
- Data directory structure created
- All 20 mock JSON record files (001-020.json)
- Homepage featured records file (records.json)
- Full catalog listing (records-all.json)
- Data schema documentation (SCHEMA.md)
- PROJECT_PLAN.md created
- index.html now loads data dynamically from JSON
- Homepage renders featured rows from data/records.json
- Card click navigation to detail page
- detail.html with full record view and tracklist
- Vinyl record visual display
- Per-track artist support (only shown if different from album)
- Responsive design for both pages
- **NEW:** Complete filter system implementation
- **NEW:** filter.html with dynamic category views
- **NEW:** generate-filters.js automation script
- **NEW:** Filter index files (artists, genres, years, labels)
- **NEW:** Individual filter tag files for each category
- **NEW:** "VIEW ALL" button functionality
- **NEW:** URL parameter parsing for filters
- **NEW:** Grid layout for filtered results
- **NEW:** Filter-specific styling
- **NEW:** Comprehensive E2E testing with Playwright (345 tests passing)
- **NEW:** ESLint setup for code quality
- **NEW:** DecapCMS admin interface setup
- **NEW:** Custom Discogs widget for auto-importing records
- **NEW:** API token management in widget
- **NEW:** Auto-fill functionality for all record fields

**🔄 In Progress:**
- Testing DecapCMS with git-gateway authentication

**⏳ Next Up:**
- Setup git-gateway for DecapCMS authentication (Phase 2.1)
- Bulk import of remaining 192 records from CSV (Phase 3)
- Global search functionality (Phase 4)
- Advanced features: offline mode, statistics dashboard (Phase 4)

---

## Notes & Decisions Log

**2025-10-31:**
- Decided on JSON-based architecture (flexible for SSG/SPA/SQLite)
- Chose DecapCMS for content management (80% ready, extensible)
- Removed track numbers (use array index)
- Single `artists` array (no separate `artist` field)
- Placeholder images strategy: placeholdit.com with custom colors
- Mock data: 20 diverse popular albums (not Vysotsky-focused)
- Search: Global free-text only (no traditional filters)
- Navigation: Curated rows/categories only
- Track titles in original language

**2025-10-31 (Updated):**
- **Implemented complete filter system** beyond original scope
- **Automated filter generation** from record data
- **Dynamic filter pages** for artists, genres, years, labels
- **"VIEW ALL" functionality** fully operational
- **Moved global search to Phase 4** (filter system provides comprehensive browsing)
- **Enhanced navigation flow** with filter pages
- **Responsive design validated** on mobile devices

**2025-11-01:**
- **Added comprehensive E2E testing** with Playwright (345 tests across 5 browsers)
- **Implemented ESLint** for code quality and consistency
- **Created custom Discogs widget** for DecapCMS
- **Auto-import functionality** from Discogs API (search by catalog# or album)
- **Widget features**: API token storage, search UI, result selection, auto-fill all fields
- **Phase 2.2 mostly complete** - Discogs widget ready for use
- **Next milestone**: Set up git-gateway authentication to enable CMS in production
