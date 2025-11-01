# Homepage Rows Configuration Guide

## Overview
The admin panel now allows you to configure which categories appear on your homepage through the "Homepage Rows Configuration" section.

## How It Works

### 1. Access the Configuration
- Open the admin panel (`admin/index.html`)
- Grant access to the `data/` folder when prompted
- You'll see the "Homepage Rows Configuration" card at the top of the list view

### 2. Manage Rows
Each row represents a category that will appear on your homepage (e.g., "Recently Added", "Progressive Rock", etc.)

**Add a New Row:**
- Click the "➕ Add Row" button
- A new row will appear with a default name "New Category"
- Click on the text field to edit the category name

**Reorder Rows:**
- Click and drag the ☰ handle to reorder rows
- The order here determines the order on your homepage

**Remove a Row:**
- Click the "🗑️" button next to any row
- Confirm the deletion

**Edit Category Names:**
- Click on any category name text field
- Type your desired category name
- Changes are automatically saved to memory

**Select Records for a Row:**
- Click the "📀 Select Records (X)" button on any row
- A modal will open showing all your records
- Click on records to add/remove them from the category
- Selected records show a number indicating their order
- Use the search box to filter by album, artist, year, or ID
- Click "✅ Save Selection" when done
- The order you select records determines their display order in that row

### 3. Regenerate Data Files
After making changes to your homepage rows configuration:

1. Click the "🔄 Regenerate Filters" button in the header
2. The system will:
   - Save your homepage rows configuration to `data/records.json`
   - Regenerate `data/records-all.json` from individual record files
   - Regenerate all filter indexes (`artists.json`, `genres.json`, etc.)
   - Clean up any invalid record IDs from your rows

### 4. What Gets Regenerated

When you click "🔄 Regenerate Filters", three things happen:

**`records-all.json`**: 
- Automatically generated from all individual record files in `data/records/`
- Contains minimal data (id, artists, album, year, imageUrl) for quick loading
- Always stays in sync with your collection

**`records.json`**:
- Stores your homepage rows configuration
- Contains the category names and which records appear in each row
- Records are selected via the UI or can be manually edited

**Filter Indexes**:
- `filters/artists.json`
- `filters/genres.json`
- `filters/labels.json`
- `filters/years.json`

## Manual Editing (Optional)

While the admin panel provides a complete UI for managing rows and selecting records, you can still manually edit `data/records.json` if needed:

1. Open `data/records.json` in a text editor
2. Edit the `records` array for each row:
   ```json
   {
     "rows": [
       {
         "category": "Recently Added",
         "records": ["020", "019", "018", "017"]
       },
       {
         "category": "Progressive Rock",
         "records": ["001", "013", "006"]
       }
     ]
   }
   ```
3. Save the file

The admin panel will load this configuration next time you open it.

## Tips

- The system automatically removes invalid record IDs when regenerating
- Rows with empty `records` arrays are fine - you can populate them via the UI later
- Category names can be anything you want (emojis work too!)
- The regeneration process validates all data to ensure consistency
- The order you click records in the selector determines their display order
- Use the search function to quickly find specific albums
- Selected record badges show their IDs for easy reference

## Workflow Example

1. **Add a new category**: Click "➕ Add Row"
2. **Name it**: Edit the category name (e.g., "80s Synth Wave")
3. **Select records**: Click "📀 Select Records (0)"
4. **Search & select**: Search for "1980" or artist names, click albums to add them
5. **Save selection**: Click "✅ Save Selection"
6. **Regenerate**: Click "🔄 Regenerate Filters" to save all changes
7. **Done**: Your homepage now shows the new category with selected albums!

## Future Enhancement Ideas

- [ ] Auto-populate rows based on filters (e.g., "Recently Added" = last 10 records)
- [ ] Preview how the homepage will look before regenerating
- [ ] Bulk operations (select all from a genre, year, etc.)
