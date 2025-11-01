# Vinyl Cabinet Admin Panel - Features

## Complete Homepage Management System

The admin panel now provides a **fully integrated UI** for managing your vinyl collection's homepage without any manual JSON editing required.

## ✨ Key Features

### 1. Homepage Rows Configuration
- **Visual row management**: Add, remove, and reorder categories
- **Drag & drop reordering**: Click and drag the ☰ handle to reorder rows
- **Live preview**: See selected record badges for each row
- **Category naming**: Edit category names directly in the UI

### 2. Record Selection Modal
- **Visual record picker**: Browse all your records with album art
- **Search functionality**: Filter by album, artist, year, or ID
- **Selection order tracking**: Numbers show the order of selected records
- **Multi-select interface**: Click to add/remove records from a category
- **Live count display**: See how many records are selected

### 3. One-Click Data Regeneration
When you click **"🔄 Regenerate Filters"**, the system automatically:
- ✅ Saves your homepage rows to `records.json`
- ✅ Regenerates `records-all.json` from all record files
- ✅ Regenerates all filter indexes (artists, genres, labels, years)
- ✅ Validates and cleans up any invalid record IDs

## 🎯 Complete Workflow (No Manual Editing Required!)

```
1. Open admin/index.html
2. Grant access to data/ folder
3. Add/edit homepage rows
4. Click "Select Records" for each row
5. Search and select albums
6. Click "Regenerate Filters"
7. Done! Your homepage is updated.
```

## 🎨 UI Components

### Homepage Rows Editor
- Drag handle (☰) for reordering
- Category name input field
- "📀 Select Records (X)" button showing count
- "🗑️" remove button
- Record badges showing selected IDs

### Record Selector Modal
- Search bar for filtering
- Grid of album cards with cover art
- Selection indicators with order numbers
- Save/Cancel buttons with live count

### Visual Feedback
- Selected records highlighted in green
- Order numbers displayed on selected items
- Record badges in each row showing IDs
- Invalid records shown in red (if any)

## 📁 Files Managed

| File | Description | How It's Updated |
|------|-------------|------------------|
| `records.json` | Homepage row configuration | Saved when you click "Regenerate Filters" |
| `records-all.json` | Minimal record data for quick loading | Auto-generated from individual record files |
| `filters/artists.json` | Artist filter index | Auto-generated with artist → records mapping |
| `filters/genres.json` | Genre filter index | Auto-generated with genre → records mapping |
| `filters/labels.json` | Label filter index | Auto-generated with label → records mapping |
| `filters/years.json` | Year filter index | Auto-generated with year → records mapping |

## 🔄 Auto-Sync Features

- **Invalid ID cleanup**: Removes record IDs that don't exist anymore
- **Consistent ordering**: Records maintain their selection order
- **Data validation**: Ensures all files are properly formatted JSON
- **Timestamp tracking**: Knows when filters need regeneration

## 💡 Pro Tips

1. **Use descriptive category names**: "1970s Progressive Rock" is better than "Prog"
2. **Order matters**: Records display in the order you select them
3. **Search is your friend**: Use the search box to find albums quickly
4. **Empty rows are OK**: Create the structure first, add records later
5. **Watch the count**: The button shows how many records are in each row

## 🚀 What's Next?

This is a complete solution for managing your homepage! No more manual JSON editing required. Just use the UI and click "Regenerate Filters" when you're done.

Enjoy managing your vinyl collection! 🎵
