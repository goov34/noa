# Valentine's Day Web App

A romantic interactive web app for Valentine's Day, featuring an animated envelope, puzzle game, and proposal screen.

## Features

1. **Animated Envelope Opening** - Beautiful envelope animation with floating hearts
2. **Puzzle Game** - 9-piece drag-and-drop puzzle
3. **Proposal Screen** - Romantic proposal with Yes/No buttons
4. **Response Screens** - Celebratory or playful responses based on choice

## Setup

1. Make sure you have the cartoon image at `assets/cartoon-image.png`
2. The puzzle pieces will be generated automatically from the cartoon image
3. (Optional) Add a sad GIF at `assets/sad.gif` for the "No" response - if not provided, a CSS animation will be used instead
4. (Optional) Add a sound file at `assets/sad-sound.mp3` for the "No" response - if not provided, the app will work without sound
5. (Optional) Add background music at `assets/background-music.mp3` - will loop during the experience
6. (Optional) Add envelope open sound at `assets/envelope-open.mp3` - plays when envelope is clicked

## Deployment to GitHub Pages

1. Push this repository to GitHub
2. Go to Settings > Pages
3. Select the main branch and `/root` folder
4. Your app will be live at `https://yourusername.github.io/repository-name/`

## Files Structure

```
.
├── index.html          # Main HTML file
├── styles.css          # All styles and animations
├── script.js           # Game logic and interactions
├── assets/
│   ├── cartoon-image.png      # Main cartoon image
│   ├── sad.gif                # GIF for "No" response (optional)
│   ├── sad-sound.mp3          # Sound for "No" response (optional)
│   ├── background-music.mp3   # Background music (optional)
│   └── envelope-open.mp3      # Envelope open sound (optional)
└── README.md           # This file
```

## Notes

- The puzzle pieces are generated dynamically from the cartoon image
- All animations are CSS-based for smooth performance
- The app is fully responsive and works on mobile devices
