# Deployment Guide for GitHub Pages

## Quick Start

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Valentine's Day web app"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub and create a new repository
   - Don't initialize it with README, .gitignore, or license

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Select "main" branch and "/ (root)" folder
   - Click "Save"

5. **Access Your App**:
   - Your app will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
   - It may take a few minutes for the changes to go live

## Required Assets

Make sure these files exist before deploying:

- ✅ `assets/cartoon-image.png` - Already created
- ⚠️ `assets/sad.gif` - Optional (fallback animation will be used if missing)
- ⚠️ `assets/sad-sound.mp3` - Optional (app works without sound)

## Customization

### Replace the "Yes" Response Image

To use a different image for the "Yes" response:
1. Place your image in the `assets/` folder
2. Update `index.html` line 56:
   ```html
   <img id="yes-image" src="assets/your-image.png" alt="Valentine's Day">
   ```

### Add Custom GIF for "No" Response

1. Find or create a sad/playful GIF
2. Save it as `assets/sad.gif`
3. The app will automatically use it

### Add Sound Effect

1. Find or create an MP3 sound file
2. Save it as `assets/sad-sound.mp3`
3. The app will play it when "No" is clicked

## Troubleshooting

### Puzzle Pieces Not Showing
- Make sure `assets/cartoon-image.png` exists
- Check browser console for errors
- Ensure the image loads properly (check network tab)

### Animations Not Working
- Check that CSS file is loaded correctly
- Verify browser supports CSS animations
- Clear browser cache

### GitHub Pages Not Updating
- Wait 5-10 minutes after pushing changes
- Check GitHub Actions tab for build errors
- Verify you're pushing to the correct branch

## Testing Locally

Before deploying, test locally:
1. Open `index.html` in a web browser
2. Or use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (if you have http-server installed)
   npx http-server
   ```
3. Navigate to `http://localhost:8000`
