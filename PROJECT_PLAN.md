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
├── data/
│   ├── SCHEMA.md              # Data schema documentation
│   ├── records.json           # Homepage featured records
│   ├── records-all.json       # Full catalog minimal listing
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
- [ ] Create `data/SCHEMA.md` - Document JSON structure with examples
- [ ] Create `data/records/001.json` through `020.json` - 20 diverse albums
- [ ] Create `data/records.json` - Featured records for homepage rows
- [ ] Create `data/records-all.json` - Minimal listing (id, artists, album, imageUrl)

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
- [ ] Implement "VIEW ALL" button → show full category view (TODO)

### 1.3 Global Search Implementation
- [ ] Free-text search input (existing in header)
- [ ] Search across: artists, album, catalogNumber, recordLabel
- [ ] Live suggestions dropdown (as-you-type)
- [ ] Full results view (filter homepage or new page)

### 1.4 Detail Page
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
- [ ] Create `admin/index.html` - DecapCMS loader
- [ ] Create `admin/config.yml` - Collection schema
- [ ] Setup GitHub authentication (git-gateway)
- [ ] Configure media folder for cover images
- [ ] Test: Create new record via CMS interface

### 2.2 Custom Discogs Widget
- [ ] Create `admin/discogs-widget.js`
- [ ] Add input field for catalog number
- [ ] Implement "Search Discogs" button
- [ ] Fetch results from Discogs API
- [ ] Display 3-5 matches with images
- [ ] User selects correct release
- [ ] Auto-fill all form fields
- [ ] Download cover image to `images/covers/`

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
│   ├── Recently Added → VIEW ALL
│   ├── Progressive Rock → VIEW ALL
│   ├── 1970s Classics → VIEW ALL
│   └── Electronic Music → VIEW ALL
└── Click album card → detail.html?id=001

Detail Page (detail.html)
├── Large cover image
├── Album info (artists, year, label, condition)
├── Tracklist (grouped by side)
└── Back to collection button
```

**No traditional filters** - Navigation via curated rows only!

**Search:** Free-text across all fields, live suggestions

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

**🔄 In Progress:**
- Testing the full user journey (homepage → detail page)

**⏳ Next Up:**
- Implement global search functionality (Phase 1.3)
- Implement "VIEW ALL" button functionality
- Polish mobile responsiveness
- DecapCMS setup (Phase 2)

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
