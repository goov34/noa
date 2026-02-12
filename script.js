// Game state
let currentScreen = 'envelope';
let puzzlePieces = [];
let correctOrder = [];
let draggedPiece = null;
let envelopeOpened = false;
let puzzleSetup = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    createHearts();
    setupEnvelope();
    setupPuzzle();
    setupButtons();
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

// Setup envelope click
function setupEnvelope() {
    const envelope = document.querySelector('.envelope-container');
    const envelopeFlap = document.querySelector('.envelope-flap');
    
    // Play background music if available
    let bgMusic = null;
    try {
        bgMusic = new Audio('assets/background-music.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        // Try to play on user interaction
        document.addEventListener('click', () => {
            if (bgMusic && bgMusic.paused) {
                bgMusic.play().catch(e => console.log('Background music not available'));
            }
        }, { once: true });
    } catch (e) {
        console.log('Background music not available');
    }
    
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
        function animatePuzzleCompletion() {
            const puzzleTitle = document.querySelector('.puzzle-title');
            const puzzleContainer = document.querySelector('.puzzle-container');
            
            // Hide the tray and title
            puzzleTray.style.opacity = '0';
            puzzleTray.style.transform = 'translateY(20px)';
            puzzleTray.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            setTimeout(() => {
                puzzleTray.style.display = 'none';
            }, 300);
            
            if (puzzleTitle) {
                puzzleTitle.style.opacity = '0';
                puzzleTitle.style.transform = 'translateY(-10px)';
                puzzleTitle.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                setTimeout(() => {
                    puzzleTitle.style.display = 'none';
                }, 300);
            }
            
            // Remove grid gaps and borders to create seamless image
            puzzleGrid.style.gap = '0';
            puzzleGrid.style.padding = '0';
            puzzleGrid.style.background = 'transparent';
            puzzleGrid.style.borderRadius = '12px';
            puzzleGrid.style.overflow = 'hidden';
            puzzleGrid.style.margin = '0 auto';
            puzzleGrid.style.maxWidth = 'min(90vw, 500px)';
            puzzleGrid.style.width = '100%';
            puzzleGrid.classList.add('completed');
            
            // Center and size the container better
            if (puzzleContainer) {
                puzzleContainer.style.display = 'flex';
                puzzleContainer.style.flexDirection = 'column';
                puzzleContainer.style.justifyContent = 'center';
                puzzleContainer.style.alignItems = 'center';
                puzzleContainer.style.padding = '20px';
                puzzleContainer.style.minHeight = 'auto';
            }
            
            // Remove borders from slots and make them seamless
            slots.forEach(slot => {
                slot.style.border = 'none';
                slot.style.background = 'transparent';
                slot.style.borderRadius = '0';
            });
            
            // Make all pieces show the full image seamlessly
            const allPieces = puzzleGrid.querySelectorAll('.puzzle-piece');
            allPieces.forEach((piece) => {
                // Remove visual separators
                piece.style.borderRadius = '0';
                piece.style.boxShadow = 'none';
                piece.style.border = 'none';
                piece.style.cursor = 'default';
            });
            
            // Add smooth pulse animation to the entire grid (single pulse, 2 seconds)
            setTimeout(() => {
                puzzleGrid.style.animation = 'puzzleCompletePulse 2s ease-in-out';
            }, 400);
            
            // After animation completes, show full image for 1 more second, then transition to proposal screen
            setTimeout(() => {
                showScreen('proposal');
            }, 3400);
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
            // Fade out both the button and title together
            const solveBtn = document.getElementById('btn-solve-auto');
            const puzzleTitle = document.querySelector('.puzzle-title');
            
            if (solveBtn) {
                solveBtn.style.opacity = '0';
                solveBtn.style.transform = 'scale(0.8)';
                solveBtn.style.pointerEvents = 'none';
                solveBtn.style.transition = 'opacity 0.4s ease, transform 0.3s ease';
                setTimeout(() => {
                    solveBtn.style.display = 'none';
                }, 400);
            }
            
            if (puzzleTitle) {
                puzzleTitle.style.opacity = '0';
                puzzleTitle.style.transform = 'translateY(-10px)';
                puzzleTitle.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                setTimeout(() => {
                    puzzleTitle.style.display = 'none';
                }, 400);
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
        // Play sound (if available)
        try {
            const audio = new Audio('assets/sad-sound.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) {
            console.log('Audio not available');
        }
        showScreen('no');
    });
}

// Show specific screen
function showScreen(screenName) {
    console.log('Switching to screen:', screenName);
    
    // Hide all screens with fade out
    document.querySelectorAll('.screen').forEach(screen => {
        if (screen.classList.contains('active')) {
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
            
            // If switching to puzzle screen, ensure puzzle is set up
            if (screenName === 'puzzle') {
                setupPuzzle();
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
