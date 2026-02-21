// Array containing local video files
const reelsLinks = [
    "videos/18078636565615611.mp4",
    "videos/17999636306518017.mp4",
    "videos/18015623861506840.mp4",
    "videos/18031488055878683.mp4",
    "videos/18028611761141064.mp4",
    "videos/18033392560584269.mp4",
    "videos/17947002026694500.mp4",
    "videos/18275238646229222.mp4"
];

document.addEventListener("DOMContentLoaded", () => {
    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    const landscapeGrid = document.getElementById("landscape-grid");
    const portraitGrid = document.getElementById("portrait-grid");
    const landscapeSection = document.getElementById("landscape-section");
    const portraitSection = document.getElementById("portrait-section");

    // Helper function to create video card HTML
    const createCardHTML = (link, index, isLandscape) => {
        // We use slightly different heights to let landscape expand naturally or be restrained nicely
        const wrapperClass = isLandscape ? "iframe-wrapper video-wrapper landscape-wrapper" : "iframe-wrapper video-wrapper";

        return `
            <div class="masonry-item">
                <div class="reel-card" style="transition-delay: ${(index % 4) * 80}ms">
                    <div class="${wrapperClass}" data-src="${link}">
                        <video src="${link}" class="metadata-preload" preload="metadata" style="display:none;"></video>
                        <div class="lazy-placeholder">
                            <i class="fa-solid fa-spinner fa-spin"></i>
                            <span>Loading Video...</span>
                        </div>
                        <div class="play-overlay">
                            <i class="fa-solid fa-play"></i>
                        </div>
                        <div class="mute-toggle" title="Toggle Mute">
                            <i class="fa-solid fa-volume-xmark"></i>
                        </div>
                        <div class="share-btn" title="Share Video">
                            <i class="fa-solid fa-share"></i>
                        </div>
                        <div class="heart-animation">
                            <i class="fa-solid fa-heart"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    // Load metadata for all videos to determine orientation
    const loadAndSortVideos = async () => {
        let landscapeCount = 0;
        let portraitCount = 0;

        // Extract metadata for all videos
        const videoPromises = reelsLinks.map((link, index) => {
            return new Promise((resolve) => {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.src = link;

                video.onloadedmetadata = () => {
                    const isLandscape = video.videoWidth > video.videoHeight;
                    resolve({ link, index, isLandscape });
                };

                video.onerror = () => {
                    // Fallback to portrait if metadata fails
                    resolve({ link, index, isLandscape: false });
                };
            });
        });

        // Wait for all metadata to load
        const sortedVideos = await Promise.all(videoPromises);

        // Inject all videos into correct grids
        sortedVideos.forEach(video => {
            const html = createCardHTML(video.link, video.index, video.isLandscape);

            if (video.isLandscape) {
                landscapeGrid.insertAdjacentHTML('beforeend', html);
                landscapeCount++;
            } else {
                portraitGrid.insertAdjacentHTML('beforeend', html);
                portraitCount++;
            }
        });

        // Show sections if they have content
        if (landscapeCount > 0) landscapeSection.classList.remove('d-none');
        if (portraitCount > 0) portraitSection.classList.remove('d-none');

        // Update Post Count Badge
        const totalCount = landscapeCount + portraitCount;
        const countBadge = document.getElementById("total-posts-badge");
        if (countBadge) {
            countBadge.innerHTML = `<i class="fa-solid fa-video me-2"></i>${totalCount} Post${totalCount !== 1 ? 's' : ''}`;
        }

        // Start intersection observer on newly created wrappers
        document.querySelectorAll('.video-wrapper:not(.observed)').forEach(wrapper => {
            wrapper.classList.add('observed');
            lazyLoadObserver.observe(wrapper);
            playbackObserver.observe(wrapper);
        });

        // Trigger reveal manually since new DOM elements were added
        setTimeout(() => revealCards(), 100);

        // Check for shared video URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sharedVideoId = urlParams.get('v');
        if (sharedVideoId) {
            const sharedSrc = `videos/${sharedVideoId}`;
            const modalVideo = document.getElementById('modalVideo');
            if (modalVideo) {
                modalVideo.src = sharedSrc;
                modalVideo.muted = false;
                const videoModal = new bootstrap.Modal(document.getElementById('videoModal'));
                videoModal.show();
                modalVideo.play().catch(e => console.log("Modal autoplay blocked:", e));
            }

            // Optionally clean the URL so it doesn't pop up again on refresh (using history API)
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: newUrl }, '', newUrl);
        }
    };

    // Start Process
    loadAndSortVideos();

    // Intersection Observer for Lazy Loading Videos
    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const wrapper = entry.target;
                const src = wrapper.getAttribute('data-src');

                // Check if we haven't initialized actual playback video yet
                if (src && !wrapper.classList.contains('video-loaded')) {
                    wrapper.classList.add('video-loaded');

                    // Remove hidden metadata-preload video if it exists
                    const preloadVid = wrapper.querySelector('.metadata-preload');
                    if (preloadVid) preloadVid.remove();

                    const video = document.createElement('video');
                    video.src = src;
                    // Do not show controls for the grid thumbnail
                    video.loop = true;
                    video.muted = true;
                    video.playsInline = true;

                    // Add an event listener to play automatically when ready
                    video.addEventListener('canplay', () => {
                        video.play().catch(e => console.log("Autoplay blocked:", e));
                        const placeholder = wrapper.querySelector('.lazy-placeholder');
                        if (placeholder) placeholder.style.display = 'none';
                    });

                    // Insert video before the play overlay so overlay stays on top
                    wrapper.insertBefore(video, wrapper.firstChild);

                    // Add click event for play overlay (launch modal)
                    const playOverlay = wrapper.querySelector('.play-overlay');
                    if (playOverlay) {
                        playOverlay.addEventListener('click', (e) => {
                            e.stopPropagation(); // prevent card click
                            const modalVideo = document.getElementById('modalVideo');
                            modalVideo.src = src;
                            modalVideo.muted = false;

                            const videoModalEl = document.getElementById('videoModal');
                            let videoModal = bootstrap.Modal.getInstance(videoModalEl);
                            if (!videoModal) videoModal = new bootstrap.Modal(videoModalEl);

                            videoModal.show();
                            modalVideo.play().catch(e => console.log("Modal autoplay blocked:", e));
                            video.pause(); // Pause background video
                        });
                    }

                    // Add click event for mute toggle button
                    const muteBtn = wrapper.querySelector('.mute-toggle');
                    if (muteBtn) {
                        muteBtn.addEventListener('click', (e) => {
                            e.stopPropagation(); // prevent modal opening
                            video.muted = !video.muted;
                            const icon = muteBtn.querySelector('i');
                            if (video.muted) {
                                icon.className = "fa-solid fa-volume-xmark";
                                muteBtn.style.background = "rgba(0, 0, 0, 0.6)";
                            } else {
                                icon.className = "fa-solid fa-volume-high";
                                muteBtn.style.background = "var(--accent)";
                            }
                        });
                    }


                    // Share Button Logic
                    const shareBtn = wrapper.querySelector('.share-btn');
                    if (shareBtn) {
                        shareBtn.addEventListener('click', async (e) => {
                            e.stopPropagation(); // prevent modal opening
                            const videoFilename = src.split('/').pop();
                            const shareUrl = window.location.origin + window.location.pathname + '?v=' + encodeURIComponent(videoFilename);
                            const shareData = {
                                title: 'Check out this Reel!',
                                text: 'Awesome reel from My Gallery.',
                                url: shareUrl
                            };
                            try {
                                if (navigator.share) {
                                    await navigator.share(shareData);
                                } else {
                                    await navigator.clipboard.writeText(shareUrl);
                                    alert("Exact Video Link copied to clipboard!");
                                }
                            } catch (err) {
                                console.log("Error sharing", err);
                            }
                        });
                    }

                    // Double Click to Like (Heart Animation)
                    wrapper.addEventListener('dblclick', (e) => {
                        e.stopPropagation();
                        e.preventDefault(); // prevent zoom
                        const heart = wrapper.querySelector('.heart-animation');
                        if (heart) {
                            heart.classList.remove('active');
                            void heart.offsetWidth; // trigger rapid reflow for re-animation
                            heart.classList.add('active');
                        }
                    });
                }
                // Stop observing once loaded
                observer.unobserve(wrapper);
            }
        });
    }, {
        rootMargin: "0px 0px 400px 0px" // Load 400px before reaching the viewport to ensure smooth UX
    });

    // Intersection Observer for Auto-Pause logic (Play when visible, Pause when hidden)
    const playbackObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video:not(.metadata-preload)');
            if (video) {
                if (entry.isIntersecting) {
                    // Start playing if visible
                    video.play().catch(e => console.log("Autoplay blocked on resume:", e));
                } else {
                    // Pause if scrolled out of view to save resources
                    video.pause();
                }
            }
        });
    }, {
        // Trigger as soon as 10% of the video goes off screen or comes on screen
        threshold: 0.1
    });

    // Hide Loader smoothly - increase timeout slightly to allow metadata parse
    setTimeout(() => {
        const loader = document.getElementById("loader-wrapper");
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            revealCards();
        }, 600);
    }, 1500);

    // Scroll Reveal Animation Logic via Intersection Observer
    const cardRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal");
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: "0px 0px -75px 0px"
    });

    const revealCards = () => {
        const cards = document.querySelectorAll('.reel-card:not(.reveal)');
        cards.forEach(card => {
            cardRevealObserver.observe(card);
            // Fallback for elements already in view during load
            const cardTop = card.getBoundingClientRect().top;
            if (cardTop < window.innerHeight - 75) {
                card.classList.add("reveal");
                cardRevealObserver.unobserve(card);
            }
        });
    };

    // Stop modal video playback when modal is closed
    const videoModalEl = document.getElementById('videoModal');
    if (videoModalEl) {
        videoModalEl.addEventListener('hidden.bs.modal', () => {
            const modalVideo = document.getElementById('modalVideo');
            if (modalVideo) {
                modalVideo.pause();
                modalVideo.src = ""; // Clears the video source completely
            }
        });
    }

});
/*  */