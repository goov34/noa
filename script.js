// Game state
let currentScreen = 'envelope';
let puzzlePieces = [];
let correctOrder = [];
let draggedPiece = null;
let envelopeOpened = false;
let puzzleSetup = false;
let bgMusic = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    createHearts();
    setupEnvelope();
    setupPuzzle();
    setupButtons();
    
    // Play background music on app start
    try {
        bgMusic = new Audio('assets/background-music.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        // Try to play on first user interaction
        document.addEventListener('click', () => {
            if (bgMusic && bgMusic.paused) {
                bgMusic.play().catch(e => console.log('Background music not available'));
            }
        }, { once: true });
    } catch (e) {
        console.log('Background music not available');
    }
    
    // Ensure initial active screen has pointer events
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen) {
        activeScreen.style.pointerEvents = 'auto';
    }
});

// Create falling hearts
function createHearts() {
    const heartsContainer = document.querySelector('.hearts-container');
    const heartCount = 20;
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 8 + 's';
        heartsContainer.appendChild(heart);
    }
}

// Create floating hearts for proposal screen and later screens
function setupProposalHearts() {
    // Clear any existing hearts first
    const existingContainers = document.querySelectorAll('.proposal-hearts-container');
    existingContainers.forEach(container => {
        container.innerHTML = '';
    });
    
    // Find the active screen's hearts container
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;
    
    const heartsContainer = activeScreen.querySelector('.proposal-hearts-container');
    if (!heartsContainer) return;
    
    const heartEmojis = ['💕', '💖', '💗', '💓', '💝', '💘', '❤️', '💞'];
    const heartCount = 15;
    
    function createProposalHeart() {
        const heart = document.createElement('div');
        heart.className = 'proposal-heart';
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 2 + 's';
        heartsContainer.appendChild(heart);
        
        // Remove heart after animation completes
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 12000);
    }
    
    // Create initial hearts
    for (let i = 0; i < heartCount; i++) {
        setTimeout(() => createProposalHeart(), i * 500);
    }
    
    // Continuously create new hearts while screen is active
    const intervalId = setInterval(() => {
        const currentActiveScreen = document.querySelector('.screen.active');
        if (currentActiveScreen && currentActiveScreen.querySelector('.proposal-hearts-container') === heartsContainer) {
            createProposalHeart();
        } else {
            clearInterval(intervalId);
        }
    }, 2000);
}

// Setup envelope click
function setupEnvelope() {
    const envelope = document.querySelector('.envelope-container');
    const envelopeFlap = document.querySelector('.envelope-flap');
    
    envelope.addEventListener('click', () => {
        // Prevent multiple clicks
        if (envelopeOpened) return;
        envelopeOpened = true;
        
        // Play envelope open sound if available
        try {
            const openSound = new Audio('assets/envelope-open.mp3');
            openSound.volume = 0.5;
            openSound.play().catch(e => console.log('Envelope sound not available'));
        } catch (e) {
            console.log('Envelope sound not available');
        }
        
        // Open the envelope flap
        if (envelopeFlap) {
            envelopeFlap.classList.add('opening');
        }
        
        // Transition to puzzle screen with fade after envelope opens
        setTimeout(() => {
            showScreen('puzzle');
        }, 1800);
    });
}

// Setup puzzle game
function setupPuzzle() {
    // Prevent multiple setups
    if (puzzleSetup) return;
    
    const puzzleGrid = document.getElementById('puzzle-grid');
    const puzzleTray = document.getElementById('puzzle-tray');
    
    if (!puzzleGrid || !puzzleTray) {
        console.error('Puzzle grid or tray not found!');
        return;
    }
    
    // If puzzle is already set up, don't set it up again
    if (puzzleGrid.querySelector('.puzzle-slot')) {
        return;
    }
    
    puzzleSetup = true;
    
    // Reset solve button when puzzle loads
    const solveBtn = document.getElementById('btn-solve-auto');
    if (solveBtn) {
        solveBtn.style.display = 'block';
        solveBtn.style.opacity = '1';
        solveBtn.style.transform = 'scale(1)';
        solveBtn.style.pointerEvents = 'auto';
    }
    
    // Load the image first
    const fullImage = new Image();
    
    fullImage.onerror = function() {
        console.error('Failed to load puzzle image');
        puzzleGrid.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Error loading puzzle image. Please check assets/cartoon-image.png</p>';
        puzzleSetup = false;
    };
    
    fullImage.onload = function() {
        const imageUrl = fullImage.src;
        const size = 3;
        
        // Clear grid and tray
        puzzleGrid.innerHTML = '';
        puzzleTray.innerHTML = '';
        puzzleGrid.style.position = puzzleGrid.style.position || 'relative';
        
        // Helper functions
        const shuffle = (arr) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = (Math.random() * (i + 1)) | 0;
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        };
        
        // Build slots in grid
        const slots = [];
        for (let i = 0; i < size * size; i++) {
            const slot = document.createElement('div');
            slot.className = 'puzzle-slot';
            slot.dataset.slotIndex = String(i);
            puzzleGrid.appendChild(slot);
            slots.push(slot);
        }
        
        // Build pieces with background-position
        const pieces = [];
        for (let i = 0; i < size * size; i++) {
            const r = Math.floor(i / size);
            const c = i % size;
            
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.dataset.pieceIndex = String(i);
            piece.dataset.homeSlot = String(i);
            piece.dataset.placedSlot = '';
            
            // Use background-position with percentages
            piece.style.backgroundImage = `url("${imageUrl}")`;
            piece.style.backgroundSize = `${size * 100}% ${size * 100}%`;
            piece.style.backgroundPosition = `${(c * 100) / (size - 1)}% ${(r * 100) / (size - 1)}%`;
            piece.style.backgroundRepeat = 'no-repeat';
            
            puzzleTray.appendChild(piece);
            pieces.push(piece);
        }
        
        // Shuffle pieces in tray
        shuffle(pieces).forEach((p) => puzzleTray.appendChild(p));
        
        // State for dragging
        const state = {
            dragging: null,
            pointerId: null,
        };
        
        // Put piece into slot
        function putPieceIntoSlot(piece, slot) {
            const existing = slot.querySelector('.puzzle-piece');
            
            if (existing && existing !== piece) {
                existing.dataset.placedSlot = '';
                puzzleTray.appendChild(existing);
            }
            
            slot.appendChild(piece);
            piece.dataset.placedSlot = slot.dataset.slotIndex;
        }
        
        // Check if puzzle is solved
        function checkWin() {
            for (const slot of slots) {
                const p = slot.querySelector('.puzzle-piece');
                if (!p) return false;
                if (p.dataset.homeSlot !== slot.dataset.slotIndex) return false;
            }
            return true;
        }
        
        // Animate puzzle completion - remove grid lines and show full image
        let transitionTimeout = null;
        let isPaused = false;
        let pauseHandler = null;
        let resumeHandler = null;
        let timeoutStartTime = null;
        let remainingTime = 3000;
        
        function animatePuzzleCompletion() {
            const puzzleTitle = document.querySelector('.puzzle-title');
            const solveBtn = document.getElementById('btn-solve-auto');
            const puzzleReference = document.querySelector('.puzzle-reference');
            
            // Reset pause state
            isPaused = false;
            remainingTime = 2000; // 2 seconds for showing the image
            timeoutStartTime = null;
            
            // Remove any existing pause/resume handlers
            if (pauseHandler) {
                puzzleGrid.removeEventListener('pointerdown', pauseHandler, { capture: true });
                puzzleGrid.removeEventListener('touchstart', pauseHandler, { capture: true });
            }
            if (resumeHandler) {
                puzzleGrid.removeEventListener('pointerup', resumeHandler, { capture: true });
                puzzleGrid.removeEventListener('touchend', resumeHandler, { capture: true });
                puzzleGrid.removeEventListener('pointercancel', resumeHandler, { capture: true });
            }
            
            // Step 1: Hide ALL headers and buttons simultaneously (400ms)
            const elementsToHide = [puzzleTitle, solveBtn, puzzleReference, puzzleTray];
            elementsToHide.forEach(element => {
                if (element) {
                    element.style.opacity = '0';
                    element.style.transition = 'opacity 0.4s ease';
                    setTimeout(() => {
                        element.style.display = 'none';
                    }, 400);
                }
            });
            
            // Step 2: Fade away grid lines smoothly (starts after headers fade, takes 600ms)
            setTimeout(() => {
                // Center the grid container
                const puzzleContainer = document.querySelector('.puzzle-container');
                if (puzzleContainer) {
                    puzzleContainer.style.display = 'flex';
                    puzzleContainer.style.flexDirection = 'column';
                    puzzleContainer.style.justifyContent = 'center';
                    puzzleContainer.style.alignItems = 'center';
                    puzzleContainer.style.minHeight = '100vh';
                    puzzleContainer.style.padding = '20px';
                    puzzleContainer.style.width = '100%';
                    puzzleContainer.style.maxWidth = '100%';
                }
                
                // Fade grid background and gaps smoothly, ensure it's centered
                puzzleGrid.style.transition = 'gap 0.6s ease, padding 0.6s ease, background 0.6s ease';
                puzzleGrid.style.gap = '0';
                puzzleGrid.style.padding = '0';
                puzzleGrid.style.background = 'transparent';
                puzzleGrid.style.borderRadius = '12px';
                puzzleGrid.style.overflow = 'hidden';
                puzzleGrid.style.margin = '0 auto';
                puzzleGrid.style.maxWidth = 'min(90vw, 500px)';
                puzzleGrid.style.width = '100%';
                puzzleGrid.style.position = 'relative';
                
                // Fade slot borders smoothly
                slots.forEach(slot => {
                    slot.style.transition = 'border 0.6s ease, background-color 0.6s ease, border-radius 0.6s ease';
                    setTimeout(() => {
                        slot.style.border = 'none';
                        slot.style.background = 'transparent';
                        slot.style.borderRadius = '0';
                    }, 50);
                });
                
                // Mark grid as completed to prevent piece dragging
                puzzleGrid.classList.add('completed');
                
                // Remove visual separators from pieces smoothly and disable dragging
                const allPieces = puzzleGrid.querySelectorAll('.puzzle-piece');
                allPieces.forEach((piece) => {
                    piece.style.transition = 'border-radius 0.6s ease, box-shadow 0.6s ease, border 0.6s ease';
                    piece.style.pointerEvents = 'none'; // Disable individual piece interactions
                    piece.style.touchAction = 'none';
                    setTimeout(() => {
                        piece.style.borderRadius = '0';
                        piece.style.boxShadow = 'none';
                        piece.style.border = 'none';
                        piece.style.cursor = 'default';
                    }, 50);
                });
                
                // Enable pointer events on the grid itself for pause functionality
                puzzleGrid.style.pointerEvents = 'auto';
                puzzleGrid.style.cursor = 'default';
                puzzleGrid.style.touchAction = 'manipulation';
                
                // Add pause functionality - listen for pointer down on the whole grid
                pauseHandler = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (!isPaused && transitionTimeout && timeoutStartTime) {
                        isPaused = true;
                        
                        // Calculate remaining time based on when the 2-second display period started
                        const elapsed = Date.now() - timeoutStartTime;
                        remainingTime = Math.max(0, 2000 - elapsed); // 2000ms = 2 seconds for image display
                        
                        // Clear the transition timeout
                        clearTimeout(transitionTimeout);
                        transitionTimeout = null;
                    }
                };
                
                // Add resume functionality - listen for pointer up on the whole grid
                resumeHandler = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (isPaused && remainingTime > 0) {
                        isPaused = false;
                        
                        // Resume with remaining time (minimum 100ms to ensure it works)
                        const timeToWait = Math.max(remainingTime, 100);
                        
                        timeoutStartTime = Date.now();
                        transitionTimeout = setTimeout(() => {
                            if (!isPaused) {
                                // Remove pause/resume listeners before transitioning
                                if (pauseHandler) {
                                    puzzleGrid.removeEventListener('pointerdown', pauseHandler, { capture: true });
                                    puzzleGrid.removeEventListener('touchstart', pauseHandler, { capture: true });
                                }
                                if (resumeHandler) {
                                    puzzleGrid.removeEventListener('pointerup', resumeHandler, { capture: true });
                                    puzzleGrid.removeEventListener('touchend', resumeHandler, { capture: true });
                                    puzzleGrid.removeEventListener('pointercancel', resumeHandler, { capture: true });
                                }
                                showScreen('proposal');
                            }
                        }, timeToWait);
                    }
                };
                
                // Add listeners for both pointer and touch events on the grid (use capture to catch before pieces)
                puzzleGrid.addEventListener('pointerdown', pauseHandler, { passive: false, capture: true });
                puzzleGrid.addEventListener('touchstart', pauseHandler, { passive: false, capture: true });
                puzzleGrid.addEventListener('pointerup', resumeHandler, { passive: false, capture: true });
                puzzleGrid.addEventListener('touchend', resumeHandler, { passive: false, capture: true });
                puzzleGrid.addEventListener('pointercancel', resumeHandler, { passive: false, capture: true });
            }, 400);
            
            // Step 3: After grid lines fade away (400ms + 600ms = 1000ms), show full clean image for 2 seconds, then transition
            // Total timing: 400ms (hide elements) + 600ms (fade grid lines) + 2000ms (show image) = 3000ms
            // Start the timeout after grid lines finish fading (at 1000ms)
            setTimeout(() => {
                // Set start time when the 2-second image display period begins
                timeoutStartTime = Date.now();
                remainingTime = 2000; // 2 seconds for showing the image
                
                transitionTimeout = setTimeout(() => {
                    if (!isPaused) {
                        // Remove pause/resume listeners before transitioning
                        if (pauseHandler) {
                            puzzleGrid.removeEventListener('pointerdown', pauseHandler, { capture: true });
                            puzzleGrid.removeEventListener('touchstart', pauseHandler, { capture: true });
                        }
                        if (resumeHandler) {
                            puzzleGrid.removeEventListener('pointerup', resumeHandler, { capture: true });
                            puzzleGrid.removeEventListener('touchend', resumeHandler, { capture: true });
                            puzzleGrid.removeEventListener('pointercancel', resumeHandler, { capture: true });
                        }
                        showScreen('proposal');
                    }
                }, remainingTime);
            }, 1000); // Wait for grid lines to finish fading (400ms + 600ms)
        }
        
        // Hit test for drop target
        function hitTestTarget(clientX, clientY) {
            for (const slot of slots) {
                const r = slot.getBoundingClientRect();
                if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
                    return { type: 'slot', el: slot };
                }
            }
            const tr = puzzleTray.getBoundingClientRect();
            if (clientX >= tr.left && clientX <= tr.right && clientY >= tr.top && clientY <= tr.bottom) {
                return { type: 'tray', el: puzzleTray };
            }
            return { type: 'none', el: null };
        }
        
        // Pointer event handlers
        function onPointerDown(e) {
            // Don't handle piece dragging if puzzle is completed
            if (puzzleGrid.classList.contains('completed')) {
                return;
            }
            
            const piece = e.target.closest('.puzzle-piece');
            if (!piece) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // Prevent scrolling while dragging on mobile
            if (piece.setPointerCapture) {
                piece.setPointerCapture(e.pointerId);
            }
            
            const pieceRect = piece.getBoundingClientRect();
            const originParent = piece.parentElement;
            const originNextSibling = piece.nextElementSibling;
            
            const overlay = document.body;
            const scrollX = window.scrollX || document.documentElement.scrollLeft;
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            
            piece.style.position = 'absolute';
            piece.style.left = `${pieceRect.left + scrollX}px`;
            piece.style.top = `${pieceRect.top + scrollY}px`;
            piece.style.width = `${pieceRect.width}px`;
            piece.style.height = `${pieceRect.height}px`;
            piece.style.zIndex = '9999';
            piece.style.cursor = 'grabbing';
            piece.classList.add('dragging');
            
            overlay.appendChild(piece);
            
            state.dragging = {
                piece,
                originParent,
                originNextSibling,
                originRect: pieceRect,
                offsetX: e.clientX - pieceRect.left,
                offsetY: e.clientY - pieceRect.top,
            };
            state.pointerId = e.pointerId;
        }
        
        function onPointerMove(e) {
            if (!state.dragging || e.pointerId !== state.pointerId) return;
            
            e.preventDefault();
            
            const { piece, offsetX, offsetY } = state.dragging;
            const scrollX = window.scrollX || document.documentElement.scrollLeft;
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            
            piece.style.left = `${e.clientX - offsetX + scrollX}px`;
            piece.style.top = `${e.clientY - offsetY + scrollY}px`;
        }
        
        function onPointerUp(e) {
            if (!state.dragging || e.pointerId !== state.pointerId) return;
            
            e.preventDefault();
            
            const { piece, originParent, originNextSibling } = state.dragging;
            
            const target = hitTestTarget(e.clientX, e.clientY);
            
            // Release pointer capture
            if (piece.releasePointerCapture) {
                try {
                    piece.releasePointerCapture(e.pointerId);
                } catch (err) {
                    // Ignore if already released
                }
            }
            
            piece.classList.remove('dragging');
            piece.style.position = '';
            piece.style.left = '';
            piece.style.top = '';
            piece.style.width = '';
            piece.style.height = '';
            piece.style.zIndex = '';
            piece.style.cursor = '';
            
            if (target.type === 'slot') {
                putPieceIntoSlot(piece, target.el);
            } else if (target.type === 'tray') {
                piece.dataset.placedSlot = '';
                puzzleTray.appendChild(piece);
            } else {
                if (originNextSibling) originParent.insertBefore(piece, originNextSibling);
                else originParent.appendChild(piece);
            }
            
            state.dragging = null;
            state.pointerId = null;
            
            if (checkWin()) {
                animatePuzzleCompletion();
            }
        }
        
        // Auto-solve function
        function solveAutomatically() {
            // Disable the button to prevent multiple clicks (but don't fade it yet)
            const solveBtn = document.getElementById('btn-solve-auto');
            if (solveBtn) {
                solveBtn.style.pointerEvents = 'none';
                solveBtn.style.opacity = '0.6';
            }
            
            // Get all pieces from tray and grid
            const allPieces = Array.from(document.querySelectorAll('.puzzle-piece'));
            
            // Clear all slots first
            slots.forEach(slot => {
                const existingPiece = slot.querySelector('.puzzle-piece');
                if (existingPiece) {
                    existingPiece.dataset.placedSlot = '';
                    puzzleTray.appendChild(existingPiece);
                }
            });
            
            // Place each piece in its correct slot with animation delay
            allPieces.forEach((piece, index) => {
                const homeSlotIndex = parseInt(piece.dataset.homeSlot);
                const correctSlot = slots[homeSlotIndex];
                
                if (correctSlot) {
                    setTimeout(() => {
                        // Remove from current parent
                        if (piece.parentElement) {
                            piece.parentElement.removeChild(piece);
                        }
                        
                        // Add to correct slot
                        correctSlot.appendChild(piece);
                        piece.dataset.placedSlot = String(homeSlotIndex);
                        
                        // Add a small animation
                        piece.style.transition = 'transform 0.3s ease';
                        piece.style.transform = 'scale(1.1)';
                        setTimeout(() => {
                            piece.style.transform = 'scale(1)';
                        }, 300);
                        
                        // Check if puzzle is solved after all pieces are placed
                        if (index === allPieces.length - 1) {
                            setTimeout(() => {
                                if (checkWin()) {
                                    // Use the same completion animation as manual solve
                                    animatePuzzleCompletion();
                                }
                            }, 500);
                        }
                    }, index * 100); // Stagger the placement
                }
            });
        }
        
        // Setup auto-solve button
        const solveBtn = document.getElementById('btn-solve-auto');
        if (solveBtn) {
            solveBtn.addEventListener('click', solveAutomatically);
        }
        
        // Attach listeners - use passive: false for move to prevent scrolling
        document.addEventListener('pointerdown', onPointerDown, { passive: false });
        document.addEventListener('pointermove', onPointerMove, { passive: false });
        document.addEventListener('pointerup', onPointerUp, { passive: false });
        document.addEventListener('pointercancel', onPointerUp, { passive: false });
    };
    
    // Set image source
    const imagePath = 'assets/cartoon-image.png';
    fullImage.src = imagePath;
    
    setTimeout(() => {
        if (!fullImage.complete || fullImage.naturalHeight === 0) {
            console.warn('Image not loaded, trying alternative path...');
            fullImage.src = './assets/cartoon-image.png';
        }
    }, 1000);
}


// Setup buttons
function setupButtons() {
    document.getElementById('btn-yes').addEventListener('click', () => {
        showScreen('yes');
    });
    
    document.getElementById('btn-no').addEventListener('click', () => {
        // Stop background music immediately for awkward silence
        if (bgMusic) {
            bgMusic.pause();
            bgMusic.currentTime = 0;
        }
        
        // Wait 2 seconds before transitioning to create awkward silence
        setTimeout(() => {
            showScreen('no');
        }, 2000);
    });
}

// Show specific screen
function showScreen(screenName) {
    console.log('Switching to screen:', screenName);
    
    // Hide all screens with fade out
    document.querySelectorAll('.screen').forEach(screen => {
        if (screen.classList.contains('active')) {
            screen.style.pointerEvents = 'none';
            screen.style.opacity = '0';
            setTimeout(() => {
                screen.classList.remove('active');
            }, 300);
        }
    });
    
    // Show target screen with fade in
    const targetScreen = document.getElementById(`screen-${screenName}`);
    if (targetScreen) {
        setTimeout(() => {
            targetScreen.classList.add('active');
            targetScreen.style.opacity = '1';
            targetScreen.style.pointerEvents = 'auto';
            
            // If switching to puzzle screen, ensure puzzle is set up
            if (screenName === 'puzzle') {
                setupPuzzle();
            }
            
            // If switching to proposal screen or yes screen, ensure hearts are set up
            if (screenName === 'proposal' || screenName === 'yes') {
                setupProposalHearts();
            }
            
            // If switching to no screen, ensure video plays
            if (screenName === 'no') {
                const video = document.getElementById('no-video');
                if (video) {
                    video.play().catch(e => console.log('Video play failed:', e));
                }
            }
        }, 300);
    } else {
        console.error('Screen not found:', screenName);
    }
    
    currentScreen = screenName;
}

// Reset app
function resetApp() {
    // Reset flags
    envelopeOpened = false;
    puzzleSetup = false;
    
    // Reset solve button
    const solveBtn = document.getElementById('btn-solve-auto');
    if (solveBtn) {
        solveBtn.style.display = 'block';
        solveBtn.style.opacity = '1';
        solveBtn.style.transform = 'scale(1)';
        solveBtn.style.pointerEvents = 'auto';
    }
    
    // Reset puzzle - clear grid and tray, will be recreated when puzzle screen is shown
    const puzzleGrid = document.getElementById('puzzle-grid');
    const puzzleTray = document.getElementById('puzzle-tray');
    if (puzzleGrid) {
        puzzleGrid.innerHTML = '<div class="puzzle-loading">Loading puzzle...</div>';
    }
    if (puzzleTray) {
        puzzleTray.innerHTML = '';
    }
    
    // Reset envelope animation
    const envelopeFlap = document.querySelector('.envelope-flap');
    
    if (envelopeFlap) {
        envelopeFlap.classList.remove('opening');
    }
    
    // Reset envelope animation by recreating it
    const envelope = document.querySelector('.envelope');
    if (envelope) {
        envelope.style.animation = 'none';
        setTimeout(() => {
            envelope.style.animation = 'envelopeAppear 1s ease-out';
        }, 10);
    }
    
    // Show envelope screen
    showScreen('envelope');
}
