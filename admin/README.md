# DecapCMS Setup Instructions

## Quick Start - Local Development

To test DecapCMS locally without GitHub authentication:

1. **Install Decap Server** (one time only):
   ```bash
   npm install -g decap-server
   ```

2. **Start the local backend** (from project root):
   ```bash
   npx decap-server
   ```

3. **Start a local web server** (in another terminal):
   ```bash
   python3 -m http.server 8000
   ```

4. **Open the CMS**:
   - Visit: `http://localhost:8000/admin/`
   - Click "Login" (no authentication needed in local mode)

5. **Test the interface**:
   - View existing records
   - Create a new test record
   - Edit an existing record
   - Upload an image

---

## Production Setup - GitHub Authentication

For deploying to GitHub Pages with authentication:

### Step 1: Enable Git Gateway

1. Go to your GitHub repository settings
2. Enable GitHub Pages (Settings → Pages)
3. Set source to `main` branch

### Step 2: Setup Netlify Identity (Free)

DecapCMS uses Netlify Identity for GitHub authentication:

1. Create a free Netlify account at https://netlify.com
2. Add your GitHub Pages site to Netlify (just for identity, not hosting)
3. Enable Identity service (Site Settings → Identity)
4. Enable Git Gateway (Site Settings → Identity → Services → Git Gateway)
5. Invite yourself as a user (Identity tab → Invite users)

### Step 3: Add Netlify Identity Widget

Add this to your `admin/index.html` `<head>` section:

```html
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
```

And this before the closing `</body>` tag:

```html
<script>
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }
</script>
```

### Step 4: Update config.yml

Update the `site_url` in `config.yml`:

```yaml
site_url: https://yourusername.github.io/vinyl-cabinet
```

### Step 5: Deploy & Login

1. Commit and push your changes to GitHub
2. Visit `https://yourusername.github.io/vinyl-cabinet/admin/`
3. Login with your Netlify Identity credentials
4. Start managing your collection!

---

## Configuration Details

### File Storage

- **Records**: `data/records/*.json` - Individual record files
- **Cover images**: `images/covers/` - Album artwork
- **Featured collections**: `data/records.json` - Homepage configuration

### Record ID Format

- Must be 3 digits: `001`, `002`, `003`, etc.
- Used as filename: `001.json`
- Used for URL parameters: `detail.html?id=001`

### Image Guidelines

- **Recommended size**: 400x400px
- **Format**: JPG or PNG
- **Max file size**: 500KB recommended
- Images are stored in `images/covers/` directory

### Condition Grades

Standard vinyl condition grading:
- **Mint (M)**: Perfect, unplayed
- **Near Mint (NM)**: Almost perfect, minimal signs of handling
- **Very Good Plus (VG+)**: Shows some signs of wear
- **Very Good (VG)**: Shows wear but plays well
- **Good Plus (G+)**: Significant wear, may have some surface noise
- **Good (G)**: Heavy wear, noticeable surface noise
- **Fair (F)**: Poor condition but still playable
- **Poor (P)**: Barely playable

---

## Workflow Tips

### Adding a New Record

1. Click "New Vinyl Records"
2. Enter basic info: ID, catalog number, artist, album, year
3. Upload cover image
4. Add genres and label
5. Select condition
6. Add tracklist for each side
7. Save!

### Bulk Operations

For adding many records at once:
1. Use the CSV import script (Phase 3)
2. Generate skeleton JSON files
3. Use DecapCMS to complete missing data

### Updating Homepage Featured Rows

1. Navigate to "Featured Collections"
2. Edit "Homepage Featured Records"
3. Add/remove/reorder rows
4. Specify which record IDs appear in each row

---

## Troubleshooting

### CMS won't load
- Check browser console for errors
- Ensure `config.yml` is valid YAML (indentation matters!)
- Try clearing browser cache

### Can't upload images
- Ensure `images/covers/` directory exists
- Check file permissions
- Verify image file size is reasonable

### Changes not appearing on site
- Check that JSON files are being updated in `data/records/`
- Refresh browser cache (Cmd+Shift+R or Ctrl+Shift+R)
- Verify file paths in `config.yml`

### Local backend not working
- Ensure `npx decap-server` is running
- Check that `local_backend: true` is in config.yml
- Try restarting both the server and web server

---

## Next Steps

1. ✅ Test local CMS interface
2. ⏳ Setup GitHub authentication (optional, for production)
3. ⏳ Create custom Discogs widget (Phase 2.2)
4. ⏳ Import existing records from CSV (Phase 3)

---

## Resources

- [DecapCMS Documentation](https://decapcms.org/docs/)
- [Configuration Options](https://decapcms.org/docs/configuration-options/)
- [Widget Reference](https://decapcms.org/docs/widgets/)
- [Discogs API](https://www.discogs.com/developers)
