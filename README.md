# Instagram Reels Gallery

A sleek, modern, and highly interactive frontend web application designed to showcase a curated collection of aesthetic video moments. Built with standard web technologies (HTML, CSS, JavaScript) and Bootstrap 5, this gallery mimics the premium, immersive feel of an Instagram profile page.

## ✨ Features
- **Aesthetic Dark/Light Theme:** Fully responsive UI with a premium dark mode default and a sleek light mode fallback. Features an ambient, animated gradient background.
- **Dynamic Masonry Grid Layout:** Automatically detects video orientation (Landscape vs Portrait) by parsing metadata and intelligently categorizes the videos into separate responsive masonry grids to maximize screen real estate.
- **Smooth Playback Modal:** Interacting with any localized video launches a clean, distraction-free pop-up modal for instant playback with play/pause and mute toggles inline.
- **Lazy Loading & Performance:** Utilizes the `IntersectionObserver` API to lazy-load video elements only as they approach the viewport, saving bandwidth and improving performance. Auto-pauses videos that scroll out of view.
- **Premium User Interface:** Features a gorgeous profile header with animated gradient rings, floating frosted-glass username badges, and micro-animations for elements like the custom built heart-like animation and share buttons. 
- **Direct Video Sharing:** Integrated with the Web Share API to allow users to generate exact timestamped URLs to direct-link specific videos to friends.

## 🚀 Tech Stack
- Vanilla HTML5, CSS3, JavaScript (ES6)
- Bootstrap 5.3 (Grid structure, Utility classes, Modals)
- FontAwesome 6 (Vector Icons)

## 📦 Setup Instructions
1. Clone the repository to your local machine.
2. Ensure you have your videos placed inside the `videos/` directory.
3. Update the `reelsLinks` array in `script.js` with your video filenames.
4. Open `index.html` in any modern web browser to view your gallery!
