# Vinyl Cabinet - Data Schema Documentation

## Overview
All vinyl records are stored as JSON files. This document describes the complete schema and how data flows through the application.

---

## Individual Record Schema

**Location:** `data/records/{id}.json`

**Example:** `data/records/001.json`

```json
{
  "id": "001",
  "catalogNumber": "SHVL804",
  "recordLabel": "Harvest",
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
          "duration": "6:22"
        }
      ]
    }
  ],
  "externalIds": {
    "discogs": "release/4167881"
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Yes | Unique identifier (001-999) |
| `catalogNumber` | String | Yes | Record catalog/matrix number (e.g., "SHVL804") |
| `recordLabel` | String | Yes | Record label name (e.g., "Harvest", "Island Records") |
| `artists` | Array[String] | Yes | Array of artist/performer names. Supports multiple artists for compilations |
| `album` | String | Yes | Album/release title |
| `year` | Number | Yes | Release year (YYYY) |
| `genre` | Array[String] | Yes | Musical genres (e.g., ["Rock", "Progressive Rock"]) |
| `format` | String | Yes | Physical format (e.g., "LP, Album" or "EP" or "12\" Single") |
| `condition` | String | Yes | Record condition: "Mint", "Near Mint", "Very Good Plus", "Very Good", "Good Plus", "Good" |
| `imageUrl` | String | Yes | Cover art image URL |
| `sides` | Array[Side] | Yes | Array of record sides (typically 2 for LPs) |
| `externalIds` | Object | No | Links to external databases |

### Side Object

```json
{
  "name": "Side A",
  "tracks": [
    {
      "title": "Track Title",
      "duration": "3:45"
    },
    {
      "title": "Another Track",
      "duration": "4:12",
      "artists": ["Featured Artist"]
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Side identifier (e.g., "Side A", "Side 1", "Disc A") |
| `tracks` | Array[Track] | Yes | List of tracks on this side |

### Track Object

```json
{
  "title": "Track Title",
  "duration": "3:45",
  "artists": ["Artist 1", "Artist 2"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Song/track title (in original language) |
| `duration` | String | Yes | Track duration in MM:SS format |
| `artists` | Array[String] | No | Track-specific artists (only if different from album artists). If not present, track uses album artists |

### External IDs Object

```json
{
  "discogs": "release/4167881",
  "musicbrainz": "12345678-1234-1234-1234-123456789012",
  "spotify": "5RVjmRXvPLPvNt3BQwF83n"
}
```

These are optional IDs linking to external music databases. Used for:
- Auto-filling data from APIs
- Linking to external pages
- Finding cover art alternatives

---

## Homepage Featured Records

**Location:** `data/records.json`

Groups records into curated categories for the homepage:

```json
{
  "rows": [
    {
      "category": "Recently Added",
      "records": ["020", "019", "018", "017", "016"]
    },
    {
      "category": "Progressive Rock",
      "records": ["001", "013", "006"]
    },
    {
      "category": "1970s Classics",
      "records": ["001", "003", "005", "006", "007"]
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `category` | String | Display name for the row |
| `records` | Array[String] | Array of record IDs to display |

---

## Full Catalog Listing

**Location:** `data/records-all.json`

Minimal metadata for all records (used for "VIEW ALL", search, and filtering):

```json
{
  "records": [
    {
      "id": "001",
      "artists": ["Pink Floyd"],
      "album": "The Dark Side of the Moon",
      "year": 1973,
      "imageUrl": "https://placeholdit.com/400/FF10F0/FFFFFF?text=Pink+Floyd"
    },
    {
      "id": "002",
      "artists": ["The Beatles"],
      "album": "Abbey Road",
      "year": 1969,
      "imageUrl": "https://placeholdit.com/400/00E5FF/000000?text=The+Beatles"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Record ID (links to full record file) |
| `artists` | Array[String] | Album artists |
| `album` | String | Album title |
| `year` | Number | Release year |
| `imageUrl` | String | Cover image URL |

---

## Data Validation Rules

**IDs:**
- Format: `001`-`999` (padded with zeros, 3 digits)
- Must be unique
- Used as filename: `data/records/{id}.json`

**Artists:**
- Minimum 1 artist
- Multiple artists supported (array)
- Order matters (primary artist first)

**Year:**
- Valid range: 1900-2099
- Must be a 4-digit number

**Duration:**
- Format: `MM:SS` or `M:SS`
- Examples: `3:45`, `12:34`, `1:30`

**Genre:**
- Minimum 1 genre
- Common genres: Rock, Pop, Jazz, Electronic, Classical, Country, etc.
- Support nested genres: ["Rock", "Progressive Rock"]

**Condition:**
- Only valid values: "Mint", "Near Mint", "Very Good Plus", "Very Good", "Good Plus", "Good"
- Grading standard follows vinyl collector conventions

**Tracks per side:**
- Minimum 1 track
- Recommended: 3-8 tracks per side for LPs
- No maximum limit

---

## Image URL Strategy

### Current (MVP) - Placeholder Images
Uses placeholdit.com with custom colors:

```
https://placeholdit.com/{width}/{bg_color}/{text_color}?text={Artist+Name}
```

**Format:**
- Width: 400px (fits standard album art)
- Colors: Use CSS custom properties from design (FF10F0, 00E5FF, etc.)
- Text: Artist name or album name

**Examples:**
```
https://placeholdit.com/400/FF10F0/FFFFFF?text=Pink+Floyd
https://placeholdit.com/400/00E5FF/000000?text=The+Beatles
https://placeholdit.com/400/76FF03/000000?text=Led+Zeppelin
```

### Future (Phase 3) - Local Images
When integrating Discogs API:
1. Download cover image
2. Store in `images/covers/{id}.jpg`
3. Update imageUrl to: `/images/covers/001.jpg`

---

## Data Flow

### Homepage Load
```
1. index.html loads
2. JavaScript fetches: data/records.json
3. Renders: featured rows with records from data/records-all.json
4. User clicks "VIEW ALL" → full catalog from records-all.json
5. User clicks album card → detail.html?id=001
```

### Detail Page Load
```
1. detail.html?id=001 loads
2. JavaScript parses URL param: id=001
3. Fetches: data/records/001.json
4. Renders: full details + tracklist
```

### Global Search
```
1. User types in search box
2. JavaScript searches across all records:
   - data/records-all.json (fast, minimal data)
   - Matches: artists, album, catalogNumber, recordLabel
3. Display suggestions dropdown
4. Click result → detail page
```

---

## Update Workflow (DecapCMS)

1. User adds new record via `admin/` interface
2. DecapCMS collects form data
3. Validates against schema
4. Creates: `data/records/{id}.json`
5. Updates: `data/records-all.json` with new entry
6. Optionally updates: `data/records.json` to feature new record
7. Commits to Git → triggers build/deploy

---

## Adding New Records Manually

**Step 1:** Create `data/records/021.json`
```bash
cp data/records/001.json data/records/021.json
# Edit with your record info
```

**Step 2:** Update `data/records-all.json`
```json
{
  "records": [
    ...existing records...,
    {
      "id": "021",
      "artists": ["New Artist"],
      "album": "New Album",
      "year": 2025,
      "imageUrl": "https://placeholdit.com/400/FF10F0/FFFFFF?text=New+Artist"
    }
  ]
}
```

**Step 3:** Optionally add to `data/records.json` featured rows

**Step 4:** Commit and push to trigger deployment

---

## Migration Path

### Phase 1 (Current)
- JSON files in Git
- Manual editing or DecapCMS

### Phase 2 (SSG)
- Eleventy/Hugo reads JSON files
- Builds static HTML at deploy time
- Same data structure

### Phase 3 (SQLite)
- Convert JSON to SQLite database
- sql.js loads database in browser
- Same data schema, different storage

---

## Notes

- All track titles preserve original language (English, Russian, German, etc.)
- Per-track artists only shown in detail view if different from album artists
- No track numbers needed (array index is implicit)
- Format field supports various formats: "LP, Album", "EP", "12\" Single", "7\" Single", etc.
