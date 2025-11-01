# Vinyl Cabinet - Admin Panel

A local-first admin panel for managing your vinyl record collection using the **File System Access API**.

## Features

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

## Browser Support

The File System Access API is supported in:
- ✅ Chrome 86+
- ✅ Edge 86+
- ✅ Opera 72+

❌ **Not supported:**
- Firefox (does not support File System Access API)
- Safari (does not support File System Access API)

[Check browser compatibility](https://caniuse.com/native-filesystem-api)

## How to Use

### 1. Open the Admin Panel

```bash
# Start local server
npm start

# Open in browser
http://localhost:8000/admin/
```

**Note:** You must use Chrome, Edge, or Opera.

### 2. Select Data Folder

On first use, click **"📁 Select Data Folder"** and navigate to your project's `data/` folder.

Your browser will remember this location for future sessions.

### 3. Manage Records

**Create New Record:**
1. Click **"➕ New Record"**
2. Search Discogs or manually enter data
3. Fill in the required ID field (001-999)
4. Click **"💾 Save Record"**

**Edit Existing Record:**
1. Click on a record card in the list
2. Make your changes
3. Click **"💾 Save Record"**

**Delete Record:**
1. Edit a record
2. Click **"🗑️ Delete"**
3. Confirm deletion

### 4. Discogs API Setup (Optional but Recommended)

To use Discogs search:

1. Get a free API token from [Discogs Developer Settings](https://www.discogs.com/settings/developers)
2. In the admin panel, click **"Search Discogs"**
3. Enter your API token
4. Click **"Save Token"**

Your token is stored in browser localStorage and will be remembered.

## File Structure

```
admin/
├── index.html                      # Main admin panel
├── discogs-widget-standalone.js    # Standalone record editor widget
└── README.md                       # This file
```

## What Gets Updated

When you save a record, the admin panel updates:

1. **Individual record file:** `data/records/{id}.json`
2. **All records index:** `data/records-all.json` (automatically)

You'll need to manually regenerate filters if you add new artists/genres/labels/years:

```bash
npm run generate-filters
```

## Git Workflow

After making changes in the admin panel:

```bash
# Check what changed
git status
git diff

# Commit changes
git add data/
git commit -m "✨ Add new records via admin panel"

# Push to deploy
git push
```

## Production Use

For production, you can:

1. **Use Git-based CMS:** Keep using this admin panel locally and push changes via Git (recommended)
2. **Add backend API:** Replace File System Access API calls with fetch() to a backend API
3. **Static site generator:** Generate static pages from JSON at build time

The current approach is perfect for personal collections where you're the only editor.

## Security Notes

- Your data never leaves your computer
- API tokens are stored in browser localStorage
- File System Access API requires explicit user permission
- Browser sandboxing prevents unauthorized file access

## Troubleshooting

**"Browser Not Supported" error:**
- Use Chrome, Edge, or Opera browser
- Update to the latest version

**Permission denied / "requestPermission is not a function":**
- This is a browser compatibility issue with older Chrome versions
- Update Chrome to version 86 or later
- Click the folder icon in browser address bar
- Grant permission to access files
- Try selecting the data folder again
- If issues persist, clear browser cache and IndexedDB:
  ```javascript
  // In browser console (F12):
  indexedDB.deleteDatabase('VinylCabinetAdmin');
  // Then refresh the page
  ```

**"Cannot read properties of undefined" errors:**
- Some record files may be corrupted or have missing fields
- Check browser console to see which file has issues
- Manually fix the JSON file or delete it
- Ensure all records have at least these fields:
  ```json
  {
    "id": "001",
    "album": "Album Name",
    "artists": ["Artist Name"],
    "year": 2020,
    "recordLabel": "Label"
  }
  ```

**Changes not saved:**
- Check browser console for errors
- Verify you selected the correct `data/` folder
- Ensure the folder has write permissions
- Make sure the `records/` subfolder exists

**Records not loading:**
- Verify you selected the `data/` folder (not the project root)
- Check that `data/records/` exists and contains JSON files
- Look for JavaScript errors in browser console
- Try selecting the folder again

**Discogs search not working:**
- Verify your API token is correct
- Check rate limits (Discogs allows 60 requests/minute)
- Try searching by catalog number instead of album/artist
- Check browser console for API errors

## Development

The admin panel consists of:

1. **index.html** - Main UI, file system integration, record list management
2. **discogs-widget-standalone.js** - Reusable record editor component

Both use vanilla JavaScript with no build step required.

## Future Enhancements

Potential improvements:

- [ ] Bulk import from CSV
- [ ] Drag-and-drop image upload
- [ ] Duplicate record detection
- [ ] Statistics dashboard
- [ ] Export to different formats
- [ ] Offline PWA support
- [ ] Auto-sync with cloud storage

## License

Part of the Vinyl Cabinet project.
